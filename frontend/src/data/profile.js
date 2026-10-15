export const profile = {
  name: 'Abhishek Singh',
  role: 'Backend & GenAI Engineer',
  location: 'Chandigarh, India',
  email: 'abhis9169@gmail.com',
  phone: '+91 836 075 3992',
  phoneHref: 'tel:+918360753992',
  linkedin: 'https://www.linkedin.com/in/abhishek-singh-547768203/',
  resume: './Abhishek_Singh_Resume.pdf',
  photo: './profile.png', // replace public/profile.jpg with your own photo
  summary:
    'Software engineer with 4+ years building scalable backend systems in Python, Django and FastAPI — now specialising in GenAI: RAG pipelines, local LLM deployment and AI-driven data classification.',
}

export const stats = [
  { value: 70, prefix: '~', suffix: '%', label: 'less manual review in patent tagging' },
  { value: 50, suffix: 'K+', label: 'patent records classified consistently' },
  { value: 100, suffix: '+', label: 'APIs built for live products used by real customers' },
  { value: 40, prefix: '~', suffix: '%', label: 'faster app response times after database tuning' },
]

export const jobs = [
  {
    role: 'Software Engineer',
    company: 'Iota Analytics',
    place: 'Mohali, India',
    when: 'Nov 2024 — Present',
    current: true,
    points: [
      'Built a private AI chatbot that answers questions from company data, with the AI running in-house so nothing confidential leaves the company.',
      'Created a patent classification engine that automatically scores how relevant each patent is, across very large datasets.',
      'Automated patent tagging, cutting manual review effort by ~70% and making results more consistent across 50,000+ records.',
      'Trained an AI model on past patent decisions so new patents are tagged and categorised automatically.',
    ],
    tags: ['Generative AI', 'RAG', 'Ollama', 'Django', 'NLP'],
  },
  {
    role: 'Software Developer',
    company: 'Snakescript Solutions LLP',
    place: 'Mohali, India',
    when: 'Aug 2023 — Sep 2024',
    points: [
      'Designed and delivered 100+ APIs powering logins, reports and day-to-day business features in live applications.',
      'Set up automatic confirmation emails sent in the background, so the app stayed fast for users.',
      'Built real-time messaging and live data updates supporting hundreds of users at the same time.',
      'Worked with designers, testers and product teams to deliver complete features on schedule.',
    ],
    tags: ['Python', 'Django', 'REST APIs', 'Celery', 'WebSockets'],
  },
  {
    role: 'Associate Software Engineer',
    company: 'bebo Technologies',
    place: 'Chandigarh, India',
    when: 'Apr 2022 — Jul 2023',
    points: [
      'Connected an AI resume-reading tool to the hiring system, helping boost recruiting team productivity by 30%.',
      'Tuned database queries and backend code, making the application respond ~40% faster.',
      'Wrote clean, well-structured code that was easy for the team to maintain and extend.',
    ],
    tags: ['Python', 'SQL', 'OOP', 'AI parsing'],
  },
]

export const projects = [
  {
    id: 'patent-engine',
    category: 'AI automation',
    title: 'AI Patent Classification & Rule Engine',
    kicker: 'Featured · Iota Analytics',
    featured: true,
    metric: { value: '~70%', label: 'less manual review across 50,000+ patents' },
    desc: 'Analysts used to read and tag patents by hand. This system reads them automatically, scores how relevant each one is, and suggests tags — while a simple dashboard lets the team add their own rules without needing a developer.',
    impact: 'Saved the review team hundreds of hours and made tagging far more consistent.',
    flow: ['Patents come in', 'AI + rules score them', 'Tags applied', 'Analyst checks'],
    stack: ['Python', 'Django', 'NLP', 'LLMs', 'PostgreSQL'],
  },
  {
    id: 'secure-rag',
    category: 'AI assistant',
    title: 'Private AI Chatbot for Company Data',
    kicker: 'Generative AI · Privacy-first',
    desc: 'A ChatGPT-style assistant that answers questions using a company’s own documents. The AI model runs on the company’s own machines, so confidential data is never sent to an outside service.',
    impact: 'Teams get instant answers from their documents with zero risk of data leaks.',
    flow: ['Upload documents', 'Find relevant parts', 'AI writes the answer'],
    stack: ['Python', 'Ollama', 'LangChain', 'FAISS', 'RAG'],
  },
  {
    id: 'healthcare',
    category: 'Healthcare app',
    title: 'Home Healthcare Platform',
    kicker: 'Website + iOS + Android',
    desc: 'The system behind a home-care service: patients book appointments, request services and chat with healthcare professionals from the website or mobile app. A built-in chatbot answers common questions instantly.',
    impact: 'One backend serving three platforms, with faster responses to patient questions.',
    stack: ['Django', 'REST APIs', 'AWS Lex', 'Mobile'],
  },
  {
    id: 'ecommerce',
    category: 'Online store',
    title: 'E-commerce Platform',
    kicker: 'Retail · Payments',
    desc: 'The engine behind an online shop — product listings, shopping cart, orders and secure checkout — plus a promotions system that lets the business run discounts and coupon campaigns in real time.',
    impact: 'Faster pages and reliable checkout as the store grew.',
    stack: ['Python', 'Django', 'REST APIs', 'SQL'],
  },
  {
    id: 'chat',
    category: 'Messaging app',
    title: 'Real-Time Chat Application',
    kicker: 'Instant messaging',
    desc: 'A WhatsApp-style messaging app: secure login, instant message delivery, “online / offline” status and saved chat history, built to handle many users chatting at the same time.',
    impact: 'Messages delivered instantly, even with many people online at once.',
    stack: ['FastAPI', 'WebSockets', 'SQL'],
  },
]

export const skillGroups = [
  {
    key: 'genai',
    label: 'Generative AI',
    blurb: 'Building AI assistants and chatbots that answer from a company’s own data — privately and accurately.',
    items: ['RAG', 'LLMs', 'LangChain', 'Ollama', 'FAISS', 'Embeddings', 'Semantic search', 'NLP', 'Prompt engineering'],
  },
  {
    key: 'backend',
    label: 'Backend development',
    blurb: 'Creating the server-side systems that power websites and apps — fast, secure and able to scale.',
    items: ['Python', 'Django', 'Django REST Framework', 'FastAPI', 'Flask', 'REST APIs', 'Microservices', 'WebSockets'],
  },
  {
    key: 'databases',
    label: 'Databases',
    blurb: 'Designing how data is stored and making queries quick — like the ~40% speed-up at bebo.',
    items: ['PostgreSQL', 'MySQL', 'Graph databases', 'Redis'],
  },
  {
    key: 'devops',
    label: 'Cloud & tools',
    blurb: 'Testing, packaging and deploying software reliably, so releases are smooth.',
    items: ['Docker', 'AWS (EC2, S3)', 'CI/CD', 'Git', 'Celery', 'Pytest', 'Selenium'],
  },
  {
    key: 'data',
    label: 'Data & frontend basics',
    blurb: 'Analysing data and building simple web interfaces when a project needs it.',
    items: ['Pandas', 'NumPy', 'Matplotlib', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    key: 'soft',
    label: 'Ways of working',
    blurb: 'How I work with teams, from planning through delivery.',
    items: ['Problem-solving', 'Team leadership', 'Communication', 'Teamwork', 'Continuous learning'],
  },
]

export const quickFacts = [
  ['Looking for', 'Backend / AI Engineer roles'],
  ['Experience', '4+ years'],
  ['Based in', 'Chandigarh, India'],
  ['Strongest in', 'Python, Django, FastAPI, Generative AI'],
]

export const education = [
  { title: 'B.Tech, Computer Science Engineering', org: 'CT Group of Institutions', when: '2018 — 2022' },
  { title: 'Senior Secondary (XII)', org: 'D.A.V Senior Secondary School', when: '2017 — 2018' },
  { title: 'Secondary (X)', org: 'Ch. Balbir Singh Public School', when: '2015 — 2016' },
]

export const extras = [
  { title: 'Leadership', text: 'Stepped up to manage teams in the absence of team leads, keeping projects on track and delivered on time.' },
  { title: 'Always learning', text: 'Hands-on exploration of Generative AI, LLMs, LangChain, RAG and FastAPI through side projects.' },
  { title: 'Silver Medal · Abacus', text: 'Awarded for precision and analytical thinking in a competitive abacus championship.' },
]

/* Knowledge base for the in-browser "Ask my portfolio" retriever. */
export const knowledge = [
  { id: 'summary', source: 'Resume · Summary', text: 'Abhishek is a software engineer with 4+ years of experience building scalable backend systems in Python, Django and FastAPI, specialising in GenAI applications: RAG pipelines, local LLM deployment and AI-driven data classification.' },
  { id: 'role', source: 'Resume · Summary', text: 'He is looking for a backend or AI engineering role where he can build reliable, privacy-conscious AI products. Open to opportunities, based in Chandigarh, India.' },
  { id: 'iota', source: 'Experience · Iota Analytics', text: 'He currently works as a Software Engineer at Iota Analytics (Mohali) since Nov 2024. He architected a secure RAG chatbot using local LLMs on Ollama, built a rule-based patent classification engine, and automated patent tagging, cutting manual review by about 70% across 50,000+ patents.' },
  { id: 'snake', source: 'Experience · Snakescript Solutions', text: 'At Snakescript Solutions (Aug 2023 – Sep 2024) he built 100+ REST APIs (the connections that let apps talk to servers) with Django, set up automatic confirmation emails, and added real-time messaging that served hundreds of users at once.' },
  { id: 'bebo', source: 'Experience · bebo Technologies', text: 'At bebo Technologies (Apr 2022 – Jul 2023) he integrated an AI resume parser with backend services for a 30% productivity gain and optimised SQL queries to reduce API latency by about 40%.' },
  { id: 'rag', source: 'Project · Private AI Chatbot', text: 'He built a private AI chatbot (RAG) that answers questions from a company’s own documents. It finds the most relevant passages and has an AI model write the answer, and because the model (Ollama) runs on the company’s own machines, confidential data never leaves the building.' },
  { id: 'patent', source: 'Project · Patent Classification', text: 'AI patent classification and rule engine built with Python and Django. A configurable dashboard lets users create custom classification rules without code changes, combining AI content analysis, keyword matching and rule logic.' },
  { id: 'health', source: 'Project · Healthcare Platform', text: 'Home healthcare platform: Django REST Framework backend for web, iOS and Android with appointment scheduling, service requests, real-time communication and an AWS Lex chatbot.' },
  { id: 'shop', source: 'Project · E-commerce', text: 'E-commerce platform backend with Django: product catalog, shopping cart, order processing, secure checkout and a dynamic promotions engine for discounts and coupons.' },
  { id: 'chat', source: 'Project · Chat App', text: 'He built a WhatsApp-style real-time chat app with FastAPI: secure login, instant messages, online/offline status and saved chat history, designed for many users chatting at once.' },
  { id: 'skills-ai', source: 'Skills · Generative AI', text: 'His Generative AI skills include building AI chatbots and assistants (RAG, LLMs, LangChain, Ollama), smart search (embeddings, FAISS, semantic search), NLP and prompt engineering.' },
  { id: 'skills-be', source: 'Skills · Backend', text: 'His tech stack: Python with Django, FastAPI and Flask for building web backends and REST APIs; PostgreSQL, MySQL and Redis databases; and Docker, AWS, Git, CI/CD and automated testing (Pytest, Selenium) for shipping reliably.' },
  { id: 'edu', source: 'Resume · Education', text: 'Education: Bachelor of Technology in Computer Science Engineering from CT Group of Institutions, 2018 to 2022. Won a silver medal in an abacus competition.' },
  { id: 'lead', source: 'Resume · Leadership', text: 'He has led teams when team leads were away, keeping projects on track and delivered on time, and works closely with designers, testers and product teams.' },
  { id: 'contact', source: 'Resume · Contact', text: 'Contact Abhishek by email at abhis9169@gmail.com, by phone at +91 836 075 3992, or on LinkedIn. Hire him or reach out for collaboration.' },
]

export const suggestions = [
  'What does he do with AI?',
  'Where does he work now?',
  'What are his skills?',
  'How do I contact him?',
]
