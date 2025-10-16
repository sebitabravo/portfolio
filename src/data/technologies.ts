export interface Technology {
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  years: string
  icon: string
  description: string
  projects: string[]
  badges?: {
    label: string
    variant?: 'default' | 'secondary' | 'success' | 'warning'
  }[]
}

export const technologies: Technology[] = [
  {
    name: 'React',
    level: 'Advanced',
    years: '3+',
    icon: '⚛️',
    description: 'Building modern, performant web applications with React 18+, hooks, context, and custom hooks for complex state management.',
    projects: ['E-commerce Platform', 'Task Manager App', 'Real-time Dashboard'],
    badges: [
      { label: '✓ Unit Testing', variant: 'success' },
      { label: '⚡ Performance', variant: 'success' },
      { label: '🔄 CI/CD', variant: 'secondary' },
      { label: '📱 PWA Ready', variant: 'default' },
    ]
  },
  {
    name: 'TypeScript',
    level: 'Advanced',
    years: '2+',
    icon: '📘',
    description: 'Strong typing, advanced types, generics, and utility types. Building type-safe applications with strict mode enabled.',
    projects: ['All recent projects', 'API Client Library', 'Design System'],
    badges: [
      { label: '✓ Strict Mode', variant: 'success' },
      { label: '🛡️ Type Safety', variant: 'success' },
      { label: '📚 Documentation', variant: 'secondary' },
    ]
  },
  {
    name: 'Next.js',
    level: 'Intermediate',
    years: '2+',
    icon: '▲',
    description: 'Server-side rendering, static generation, API routes, and App Router. SEO optimization and performance best practices.',
    projects: ['Marketing Site', 'Blog Platform', 'SaaS Dashboard'],
    badges: [
      { label: '⚡ SSR/SSG', variant: 'default' },
      { label: '🔍 SEO', variant: 'success' },
      { label: '🚀 Vercel', variant: 'secondary' },
    ]
  },
  {
    name: 'Tailwind CSS',
    level: 'Advanced',
    years: '2+',
    icon: '🎨',
    description: 'Utility-first CSS framework mastery. Custom configurations, plugins, and building component libraries with consistent design systems.',
    projects: ['All UI projects', 'Component Library', 'Landing Pages'],
    badges: [
      { label: '🎨 Design System', variant: 'success' },
      { label: '📱 Responsive', variant: 'success' },
      { label: '🌙 Dark Mode', variant: 'secondary' },
    ]
  },
  {
    name: 'Node.js',
    level: 'Advanced',
    years: '3+',
    icon: '🟢',
    description: 'Building scalable backend services, REST APIs, real-time applications with WebSockets, and microservices architecture.',
    projects: ['API Gateway', 'Microservices', 'Real-time Chat'],
    badges: [
      { label: '🔒 Auth/JWT', variant: 'success' },
      { label: '🧪 Testing', variant: 'success' },
      { label: '📊 Monitoring', variant: 'secondary' },
      { label: '🐳 Docker', variant: 'default' },
    ]
  },
  {
    name: 'PostgreSQL',
    level: 'Intermediate',
    years: '2+',
    icon: '🐘',
    description: 'Relational database design, complex queries, indexes optimization, and database migrations with best practices.',
    projects: ['E-commerce Backend', 'User Management', 'Analytics Platform'],
    badges: [
      { label: '🔍 Query Optimization', variant: 'success' },
      { label: '🔄 Migrations', variant: 'secondary' },
      { label: '🔐 Security', variant: 'success' },
    ]
  },
  {
    name: 'Git & GitHub',
    level: 'Advanced',
    years: '3+',
    icon: '🔀',
    description: 'Version control mastery, branching strategies, PR reviews, GitHub Actions for CI/CD, and collaborative development workflows.',
    projects: ['All projects', 'Open Source', 'Team Collaboration'],
    badges: [
      { label: '🔄 CI/CD', variant: 'success' },
      { label: '👥 Code Review', variant: 'secondary' },
      { label: '🤖 Automation', variant: 'default' },
    ]
  },
  {
    name: 'Docker',
    level: 'Intermediate',
    years: '1+',
    icon: '🐳',
    description: 'Containerization, multi-stage builds, Docker Compose for local development, and container orchestration basics.',
    projects: ['Microservices', 'Dev Environments', 'CI/CD Pipelines'],
    badges: [
      { label: '📦 Containerization', variant: 'success' },
      { label: '🔧 Multi-stage', variant: 'secondary' },
      { label: '🚀 Deployment', variant: 'default' },
    ]
  },
  {
    name: 'Jest & Testing',
    level: 'Advanced',
    years: '2+',
    icon: '🧪',
    description: 'Unit testing, integration testing, E2E with Playwright, TDD practices, and maintaining high code coverage.',
    projects: ['Component Library', 'API Testing', 'E2E Suite'],
    badges: [
      { label: '✓ Unit Tests', variant: 'success' },
      { label: '🔄 Integration', variant: 'success' },
      { label: '🎭 E2E', variant: 'secondary' },
      { label: '📊 95%+ Coverage', variant: 'success' },
    ]
  },
  {
    name: 'Astro',
    level: 'Intermediate',
    years: '1+',
    icon: '🚀',
    description: 'Content-focused websites, islands architecture, and static site generation with optimal performance and minimal JavaScript.',
    projects: ['This Portfolio', 'Documentation Site', 'Blog'],
    badges: [
      { label: '⚡ Lightning Fast', variant: 'success' },
      { label: '🏝️ Islands', variant: 'secondary' },
      { label: '📄 SSG', variant: 'default' },
    ]
  },
  {
    name: 'Preact',
    level: 'Intermediate',
    years: '1+',
    icon: '💜',
    description: 'Lightweight React alternative for performance-critical applications. Same API, smaller bundle size.',
    projects: ['Portfolio Components', 'Interactive Widgets', 'Performance Apps'],
    badges: [
      { label: '⚡ 3KB Bundle', variant: 'success' },
      { label: '⚛️ React API', variant: 'secondary' },
      { label: '🚀 Fast', variant: 'success' },
    ]
  },
  {
    name: 'REST APIs',
    level: 'Advanced',
    years: '3+',
    icon: '🌐',
    description: 'Designing and implementing RESTful APIs with best practices, proper HTTP methods, status codes, and documentation.',
    projects: ['API Gateway', 'Backend Services', 'Integration Layer'],
    badges: [
      { label: '📚 OpenAPI', variant: 'secondary' },
      { label: '🔒 Security', variant: 'success' },
      { label: '📊 Rate Limiting', variant: 'default' },
    ]
  },
]
