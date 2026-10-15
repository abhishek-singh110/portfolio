// A tiny in-browser TF-IDF retriever. No network calls — just like a local RAG stack.
const STOP = new Set('a an and are as at be by did do does for from has have he him his how i in is it its of on or so that the their them this to was what when where which who why with you your about me tell can'.split(' '))

const SYN = {
  job: 'work', jobs: 'work', working: 'work', employer: 'work', employed: 'work', now: 'currently', currently: 'currently now', lead: 'leadership', led: 'leadership', team: 'leadership', manage: 'leadership',
  email: 'contact', reach: 'contact', hire: 'contact', phone: 'contact', linkedin: 'contact',
  stack: 'skills tech', tools: 'skills tech', technologies: 'skills tech', languages: 'python',
  llm: 'llms', ai: 'genai llms', genai: 'genai', retrieval: 'rag', chatbot: 'rag chatbot',
  degree: 'education', college: 'education', university: 'education', study: 'education',
  experience: 'years experience', projects: 'project', built: 'project',
}

const tokenize = (s) =>
  s.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, ' ').split(/\s+/)
    .map((w) => w.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((w) => w && !STOP.has(w))
    .flatMap((w) => [w, ...(SYN[w] ? SYN[w].split(' ') : [])])
    .map((w) => (w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w))

export function buildIndex(docs) {
  const tf = docs.map((d) => {
    const m = new Map()
    tokenize(d.text + ' ' + d.source.replace(/[/#-]/g, ' ')).forEach((t) => m.set(t, (m.get(t) || 0) + 1))
    return m
  })
  const df = new Map()
  tf.forEach((m) => m.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1)))
  const idf = (t) => Math.log(1 + docs.length / (df.get(t) || 0.5))
  return {
    search(query, k = 3) {
      const q = tokenize(query)
      const scored = docs.map((d, i) => {
        let s = 0
        q.forEach((t) => { if (tf[i].has(t)) s += (1 + Math.log(tf[i].get(t))) * idf(t) })
        return { ...d, score: s / Math.sqrt(tf[i].size) }
      })
      const max = Math.max(...scored.map((d) => d.score), 1e-9)
      return scored
        .filter((d) => d.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .map((d) => ({ ...d, score: d.score / max }))
    },
  }
}
