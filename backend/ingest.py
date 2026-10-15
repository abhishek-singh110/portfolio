"""Turns the PDFs in data/ into retrievable chunks.

Resume-aware chunking:
  1. clean the extracted text (re-join hyphenated words, fix split headings)
  2. split into sections on ALL-CAPS heading lines (SUMMARY, EXPERIENCE, PROJECTS, ...)
  3. inside a section, start a new chunk at each entry: a line with a date range (job, degree)
     or a "Title. Description" line (project); bullets and wrapped lines stay with their entry
  4. long entries are split, repeating the entry header so every chunk keeps its context
"""
import re
from pathlib import Path

import pymupdf

MAX_CHARS = 900

MONTH = r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?"
DATE_RANGE = re.compile(rf"((\b{MONTH}\s+)?\d{{4}})\s*[-–—]\s*((\b{MONTH}\s+)?\d{{4}}|Present|Current|Now)", re.I)
HEADING = re.compile(r"^[A-Z][A-Z &/,\-]{2,40}$")
# "Title. Description…" — a short title (≤10 words, no commas) followed by a sentence.
PROJECT_TITLE = re.compile(r"^([A-Z][\w&+/()'’ -]{2,80}?)\.\s*[A-Z]")
BULLET = re.compile(r"^[•●▪◦\-*]\s*")


def _page_text(page) -> str:
    """Rebuild visual lines: text at the same height is one line, read left to right.
    Keeps right-aligned dates ("Nov 2024 - Present") on the same line as the job title,
    and a bold project title on the same line as its description."""
    spans = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for s in line["spans"]:
                if s["text"].strip():
                    x0, y0, x1, y1 = s["bbox"]
                    spans.append(((y0 + y1) / 2, x0, s["text"]))
    spans.sort()
    rows: list[list[tuple]] = []
    for y, x, t in spans:
        if rows and abs(rows[-1][0][0] - y) < 3:  # same visual line (within 3pt)
            rows[-1].append((y, x, t))
        else:
            rows.append([(y, x, t)])
    out = []
    for row in rows:
        row.sort(key=lambda r: r[1])
        line = ""
        for _, _, t in row:
            line += t if not line or line.endswith(" ") or t.startswith(" ") else " " + t
        out.append(line)
    return "\n".join(out)


def _clean(text: str) -> list[str]:
    text = re.sub(r"(\w)-\n([a-z])", r"\1\2", text)  # "busi-\nness" -> "business"
    lines = []
    for raw in text.splitlines():
        line = re.sub(r"[ \t]+", " ", raw).strip()
        line = re.sub(r"\s+([,;:])", r"\1", line)  # "Engineering , CT" -> "Engineering, CT"
        if line:
            lines.append(line)
    return lines


def _project_title(line: str) -> bool:
    m = PROJECT_TITLE.match(line)
    return bool(m) and len(m.group(1).split()) <= 10


def _heading(line: str) -> str | None:
    if not HEADING.match(line) or len(line.replace(" ", "")) < 3:
        return None
    return re.sub(r"(?<=[A-Z]) (?=[A-Z]\b)", "", line)  # "SUMMAR Y" -> "SUMMARY"


def _label(section: str, header: str) -> str:
    sec = section.title().replace(" / ", "/")
    if not header:
        return sec
    m = PROJECT_TITLE.match(header)
    title = m.group(1) if m else DATE_RANGE.sub("", header)
    title = re.sub(r"\s+", " ", title).strip(" ,·-–")
    return f"{sec} · {title[:80]}" if title else sec


def _chunks_for_section(section: str, lines: list[str], doc: str) -> list[dict]:
    # Group lines into entries. Each entry is a list of lines: [header, bullet, bullet, ...].
    entries: list[list[str]] = []
    headers: list[bool] = []  # does entry i start with a real header (date / project title)?
    for line in lines:
        is_bullet = bool(BULLET.match(line))
        if not is_bullet and (DATE_RANGE.search(line) or _project_title(line)):
            entries.append([line]); headers.append(True)        # new job / degree / project
        elif not entries:
            entries.append([line]); headers.append(False)       # section with no entries (summary, skills)
        elif is_bullet:
            entries[-1].append(BULLET.sub("• ", line))           # new bullet point
        elif headers[-1] or entries[-1][-1].startswith("•"):
            entries[-1][-1] += " " + line                        # wrapped line / "Company  City" under a header
        else:
            entries[-1].append(line)                             # next line of a plain section (e.g. a skills row)

    out = []
    for entry, has_header in zip(entries, headers):
        header = entry[0] if has_header else ""
        label = _label(section, header)
        prefix = f"{section.title()}"
        body: list[str] = []
        for line in entry:
            if body and len(" ".join(body)) + len(line) > MAX_CHARS:
                out.append({"source": label, "text": f"{prefix}\n" + "\n".join(body), "doc": doc})
                body = [header] if header and line != header else []
            body.append(line)
        if body:
            out.append({"source": label, "text": f"{prefix}\n" + "\n".join(body), "doc": doc})
    return out


def _merge_small(section: str, chunks: list[dict], small: int = 250) -> list[dict]:
    """Join short entries of one section (e.g. three one-line education rows) into one chunk,
    so a question like "where did he study?" retrieves all of them together."""
    if len(chunks) < 2 or not all(len(c["text"]) < small for c in chunks):
        return chunks
    head = f"{section.title()}\n"
    text = head + "\n".join(c["text"].removeprefix(head) for c in chunks)
    if len(text) > MAX_CHARS:
        return chunks
    return [{"source": section.title(), "text": text, "doc": chunks[0]["doc"]}]


def _overview(section: str, chunks: list[dict]) -> list[dict]:
    """One extra chunk listing every entry of a section, for broad questions like
    "what projects has he built?" or "where has he worked?" that top-k alone would cut short."""
    items: list[str] = []
    for c in chunks:
        if " · " not in c["source"]:
            continue
        first = c["text"].split("\n")[1] if "\n" in c["text"] else ""
        item = first if DATE_RANGE.search(first) else c["source"].split(" · ", 1)[1]  # jobs keep role + dates + company
        if item not in items:
            items.append(item)
    if len(items) < 2:
        return []
    sec = section.title()
    text = f"{sec} (overview)\nAll {len(items)} {sec.lower()} entries in the resume:\n" + "\n".join(f"- {i}" for i in items)
    return [{"source": f"{sec} · overview", "text": text, "doc": chunks[0]["doc"]}]


def load_pdf(path: Path) -> list[dict]:
    with pymupdf.open(path) as pdf:  # PyMuPDF keeps words intact where pypdf splits them ("W ebsite")
        text = "\n".join(_page_text(page) for page in pdf)
    lines = _clean(text)
    sections: list[tuple[str, list[str]]] = [("Profile & Contact", [])]  # name + contact lines before the first heading
    for i, line in enumerate(lines):
        h = _heading(line)
        if h and i == 0:
            sections[0][1].append(line.title())  # the name at the top is not a section heading
        elif h:
            sections.append((h, []))
        else:
            sections[-1][1].append(line)

    chunks = []
    for name, body in sections:
        if body:
            section_chunks = _merge_small(name, _chunks_for_section(name, body, path.name))
            chunks += section_chunks + _overview(name, section_chunks)
    # Say whose resume this is in every chunk: otherwise "who is Abhishek?" finds a summary that never names him.
    owner = sections[0][1][0] if sections[0][1] else ""
    for i, c in enumerate(chunks):
        c["id"] = f"{path.stem}-{i}"
        if owner:
            c["text"] = f"{owner}'s resume — {c['text']}"
    return chunks


def load_documents(folder: Path) -> list[dict]:
    pdfs = sorted(folder.glob("*.pdf"))
    if not pdfs:
        raise FileNotFoundError(f"No PDF found in {folder} — put your resume PDF there.")
    return [c for pdf in pdfs for c in load_pdf(pdf)]


def fingerprint(folder: Path) -> tuple:
    """Changes whenever a PDF is added, removed or modified — used to auto re-index."""
    return tuple((p.name, p.stat().st_mtime_ns, p.stat().st_size) for p in sorted(folder.glob("*.pdf")))


if __name__ == "__main__":  # python ingest.py  → preview the chunks
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    for c in load_documents(Path(__file__).parent / "data"):
        print(f"── [{c['id']}] {c['source']}  ({len(c['text'])} chars)\n{c['text']}\n")
