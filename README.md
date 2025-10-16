# Portfolio - Sebastian Bravo

A modern, minimalist portfolio built with Astro, TailwindCSS, and Preact. Designed for easy content management and extensibility.

## Features

- **Fast & Performant** - Built with Astro for optimal performance
- **Type-Safe** - Full TypeScript support with strict type checking
- **Content Collections** - Type-safe content management for projects and work experience
- **Dark Mode** - Automatic dark mode support with theme persistence
- **Responsive Design** - Mobile-first design that works on all devices
- **SEO Optimized** - Proper meta tags, Open Graph, and sitemap
- **Modular Architecture** - Easy to extend and customize

## Tech Stack

- [Astro](https://astro.build) - Static Site Generator
- [Preact](https://preactjs.com) - For interactive components
- [TailwindCSS v4](https://tailwindcss.com) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org) - Type safety

## Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/
│   │   ├── interactive/    # Preact interactive components
│   │   ├── sections/       # Page section components
│   │   └── ui/            # Reusable UI components
│   ├── content/
│   │   ├── projects/      # Project entries (Markdown)
│   │   ├── work/          # Work experience (Markdown)
│   │   └── config.ts      # Content collections schema
│   ├── layouts/           # Page layouts
│   ├── lib/
│   │   ├── config.ts      # Site configuration
│   │   └── utils.ts       # Utility functions
│   ├── pages/             # File-based routing
│   ├── styles/            # Global styles
│   └── types/             # TypeScript types
├── astro.config.mjs       # Astro configuration
├── tailwind.config.ts     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sebitabravo/portfolio.git
cd portfolio
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:4321](http://localhost:4321) in your browser

## Configuration

### Site Configuration

Edit `src/lib/config.ts` to update your personal information:

```typescript
export const siteConfig: SiteConfig = {
  name: 'Your Name',
  title: 'Portfolio - Your Name',
  description: 'Your description',
  author: 'Your Name',
  email: 'your.email@example.com',
  social: {
    github: 'https://github.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourusername',
    twitter: 'https://twitter.com/yourusername',
  },
}
```

### Theme Customization

Customize colors and styles in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: { /* your colors */ },
      secondary: { /* your colors */ },
    },
  },
}
```

## Adding Content

### Projects

Create a new `.md` file in `src/content/projects/`:

```markdown
---
title: "Project Name"
description: "Project description"
tags: ["React", "TypeScript"]
featured: true
publishDate: 2024-03-15
image: "/projects/image.jpg"
githubUrl: "https://github.com/..."
liveUrl: "https://..."
order: 1
---

Your project details here...
```

### Work Experience

Create a new `.md` file in `src/content/work/`:

```markdown
---
company: "Company Name"
position: "Your Position"
description: "Job description"
startDate: 2022-01-01
endDate: null
current: true
location: "Location"
skills: ["Skill 1", "Skill 2"]
logo: "/companies/logo.png"
url: "https://company.com"
order: 1
---

Details about your work...
```

## Components

### UI Components

- `Button` - Styled button with variants
- `Card` - Container with different styles
- `Container` - Responsive container
- `Section` - Page section wrapper
- `Badge` - Small label for tags
- `SectionTitle` - Section heading component

### Interactive Components

- `ThemeToggle` - Light/dark mode toggle (Preact)
- `ContactForm` - Contact form with validation (Preact)

### Section Components

- `Header` - Site header with navigation
- `Footer` - Site footer
- `ProjectCard` - Project display card
- `WorkCard` - Work experience card

## Deployment

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Deploy to Vercel

The easiest way to deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sebitabravo/portfolio)

Or manually:

```bash
pnpm build
vercel --prod
```

### Deploy to Netlify

```bash
pnpm build
netlify deploy --prod
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm astro` - Run Astro CLI commands

## Best Practices

1. **Content Organization**
   - Use descriptive slugs for content files
   - Set `featured: true` for homepage content

2. **Images**
   - Place images in `/public` directory
   - Use descriptive filenames
   - Optimize images before uploading
   - Use appropriate aspect ratios

3. **Performance**
   - Keep bundle size small
   - Use Preact only for interactive components
   - Lazy load images with `loading="lazy"`
   - Minimize custom JavaScript

4. **SEO**
   - Write descriptive titles and descriptions
   - Use semantic HTML
   - Include alt text for images
   - Update sitemap regularly

## Customization Tips

### Adding New Pages

Create a new `.astro` file in `src/pages/`:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import Section from '@/components/ui/Section.astro'
---

<BaseLayout title="Page Title">
  <Section>
    <h1>Your Content</h1>
  </Section>
</BaseLayout>
```

### Creating New Components

Follow the existing component patterns:

```astro
---
import { cn } from '@/lib/utils'

interface Props {
  // Your props
  class?: string
}

const { class: className, ...rest } = Astro.props
---

<div class={cn('base-classes', className)} {...rest}>
  <slot />
</div>
```

### Adding Content Collections

1. Define schema in `src/content/config.ts`
2. Create content directory in `src/content/`
3. Add content files
4. Query with `getCollection()`

## Troubleshooting

### Path Aliases Not Working

Make sure both `tsconfig.json` and `astro.config.mjs` have the alias configured.

### Tailwind Classes Not Applied

Check that `@import "tailwindcss"` is in your global CSS file.

### Dark Mode Not Working

The theme toggle uses localStorage. Check browser console for errors.

## License

MIT License - feel free to use this project for your own portfolio!

## Acknowledgments

- [Astro](https://astro.build) for the amazing framework
- [TailwindCSS](https://tailwindcss.com) for the utility classes
- [Preact](https://preactjs.com) for interactive components

## Contact

- GitHub: [@sebitabravo](https://github.com/sebitabravo)
- Email: hello@sebastianbravo.dev

---

Built with ❤️ using Astro, TailwindCSS, and Preact
