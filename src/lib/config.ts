import type { SiteConfig } from '@/types'

export const siteConfig: SiteConfig = {
  name: 'Sebastian Bravo',
  title: 'Portfolio - Sebastian Bravo',
  description: 'Software Developer & Frontend Specialist',
  author: 'Sebastian Bravo',
  email: 'hello@sebastianbravo.dev',
  social: {
    github: 'https://github.com/sebitabravo',
    linkedin: 'https://linkedin.com/in/sebitabravo',
    twitter: 'https://twitter.com/sebitabravo',
  },
}

export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'About', href: '#about' },
]
