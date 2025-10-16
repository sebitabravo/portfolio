# Portfolio - Sebastian Bravo

A modern, performant, and accessible portfolio built with Astro, Preact, and TailwindCSS. Features internationalization, dark mode, and optimized for 100% Lighthouse scores.

## ✨ Features

- **🚀 Lightning Fast** - Built with Astro for optimal performance with View Transitions
- **🌍 Internationalization** - Full i18n support (Spanish & English)
- **🎨 Modern Design** - Minimalist UI with smooth animations and glassmorphism effects
- **🌓 Dark Mode** - Seamless theme switching with system preference support
- **📱 Fully Responsive** - Mobile-first design that works on all devices
- **♿ Accessible** - WCAG AA compliant with 100% Lighthouse Accessibility score
- **🔍 SEO Optimized** - Proper meta tags, Open Graph, and semantic HTML
- **📝 Content Collections** - Type-safe content management with Astro
- **⚡ Optimized Performance** - Code splitting, lazy loading, and async fonts
- **🎯 TypeScript** - Full type safety throughout the project

## 🛠️ Tech Stack

- [**Astro**](https://astro.build) - Static Site Generator with View Transitions
- [**Preact**](https://preactjs.com) - Lightweight React alternative (3KB)
- [**TailwindCSS v4**](https://tailwindcss.com) - Utility-first CSS framework
- [**TypeScript**](https://www.typescriptlang.org) - Type safety and better DX

## 📁 Project Structure

```
portfolio/
├── public/                    # Static assets (images, fonts, etc.)
├── src/
│   ├── components/
│   │   └── ui/               # Reusable UI components (Button, Card, Badge)
│   ├── content/              # Content Collections (Markdown)
│   │   ├── projects/
│   │   │   ├── es/          # Spanish projects
│   │   │   └── en/          # English projects
│   │   ├── work/
│   │   │   ├── es/          # Spanish work experience
│   │   │   └── en/          # English work experience
│   │   └── config.ts         # Content schemas with Zod
│   ├── layouts/
│   │   ├── Layout.astro      # Base HTML layout
│   │   ├── BaseLayout.astro  # Layout with Header/Footer
│   │   └── _components/      # Layout components (Header, Footer)
│   ├── lib/
│   │   ├── config.ts         # Site configuration
│   │   ├── utils.ts          # Utility functions
│   │   └── i18n/            # Internationalization
│   │       ├── index.ts      # i18n utilities
│   │       ├── utils.ts      # Content filtering
│   │       ├── es.json       # Spanish translations
│   │       └── en.json       # English translations
│   ├── pages/               # File-based routing
│   │   ├── index.astro      # Homepage (Spanish)
│   │   ├── projects/        # Projects page (Spanish)
│   │   └── en/             # English routes
│   │       ├── index.astro  # Homepage (English)
│   │       └── projects/    # Projects page (English)
│   ├── shared/
│   │   └── components/      # Shared components across pages
│   ├── styles/
│   │   └── global.css       # Global styles and CSS variables
│   └── types/
│       └── index.ts         # TypeScript type definitions
├── astro.config.mjs         # Astro configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── vercel.json              # Vercel deployment config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended), npm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/sebitabravo/portfolio.git
cd portfolio

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) to see your portfolio!

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm astro check  # Check TypeScript types
```

## ⚙️ Configuration

### 1. Personal Information

Update your details in `src/lib/config.ts`:

```typescript
export const siteConfig: SiteConfig = {
  name: 'Your Name',
  title: 'Portfolio - Your Name',
  description: 'Your description',
  author: 'Your Name',
  email: 'your@email.com',
  social: {
    github: 'https://github.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourusername',
  },
}
```

### 2. Theme Customization

Customize colors in `src/styles/global.css`:

```css
:root {
  --primary: 221.2 83.2% 45%;        /* Main brand color */
  --primary-foreground: 0 0% 100%;   /* Text on primary */
  --background: 0 0% 100%;           /* Page background */
  --foreground: 240 10% 3.9%;        /* Main text color */
}
```

Or use Tailwind's color scale in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
  }
}
```

### 3. Add Content

#### Projects

Create `src/content/projects/es/my-project.md`:

```markdown
---
title: "Mi Proyecto"
description: "Descripción del proyecto"
tags: ["React", "TypeScript", "Tailwind"]
featured: true
publishDate: 2024-03-15
image: "/projects/my-project.jpg"
githubUrl: "https://github.com/you/project"
liveUrl: "https://project.com"
order: 1
---

Detalles del proyecto aquí...
```

Create the English version in `src/content/projects/en/my-project.md`

#### Work Experience

Create `src/content/work/es/company.md`:

```markdown
---
company: "Company Name"
position: "Your Position"
description: "Brief job description"
startDate: 2022-01-01
endDate: null
current: true
location: "Remote"
skills: ["React", "Node.js", "AWS"]
logo: "/companies/logo.png"
url: "https://company.com"
order: 1
---

Detailed work description...
```

## 🌍 Internationalization

This portfolio supports Spanish (default) and English.

### URL Structure

- Spanish: `/` (no prefix)
- English: `/en/`

### Usage in Components

```astro
---
import { getLocaleFromUrl, getTranslations } from '@/lib/i18n'
import { filterByLocale } from '@/lib/i18n/utils'

const locale = getLocaleFromUrl(Astro.url)
const t = getTranslations(locale)
const projects = filterByLocale(await getCollection('projects'), locale)
---

<h1>{t.projects.title}</h1>
```

### Add Translations

Edit `src/lib/i18n/es.json` and `src/lib/i18n/en.json`:

```json
{
  "nav": {
    "home": "Inicio",
    "projects": "Proyectos"
  },
  "hero": {
    "greeting": "Hola, soy"
  }
}
```

## 🎨 Component System

### UI Components (`src/components/ui/`)

Reusable, presentational components:

- `Button.astro` - Styled buttons with variants
- `Card.astro` - Container cards
- `Badge.astro` - Tag labels
- `Avatar.astro` - User avatars
- `Separator.astro` - Visual dividers

### Usage Example

```astro
---
import Button from '@/components/ui/Button.astro'
import Card from '@/components/ui/Card.astro'
---

<Card>
  <h2>Card Title</h2>
  <p>Card content</p>
  <Button variant="default" size="lg" href="/projects">
    View Projects
  </Button>
</Card>
```

### Layout Components (`src/layouts/_components/`)

- `Header.astro` - Site navigation with mobile menu
- `Footer.astro` - Footer with links and social icons
- `LanguagePicker.astro` - Language switcher
- `ThemeToggle.astro` - Dark/light mode toggle

## 🎯 Performance Optimizations

This portfolio is optimized for maximum performance:

### Implemented Optimizations

1. **View Transitions** - Instant page navigation without full reloads
2. **Async Font Loading** - Non-blocking Google Fonts with preconnect
3. **Code Splitting** - Separate chunks for vendor and app code
4. **Lazy Loading** - Images load only when needed
5. **Minimal JavaScript** - Only ~15KB of JavaScript for interactivity
6. **CSS Optimization** - Automatic purging of unused styles
7. **Preact Instead of React** - 3KB vs 40KB bundle size
8. **Optimized Images** - WebP format with lazy loading

### Performance Metrics

- **Lighthouse Performance:** 100/100 ✅
- **Lighthouse Accessibility:** 100/100 ✅
- **First Contentful Paint:** < 1s
- **Largest Contentful Paint:** < 2s
- **Time to Interactive:** < 2s
- **Total Bundle Size:** ~90KB

## ♿ Accessibility

All accessibility features implemented:

- ✅ **WCAG AA Compliant** - 4.5:1 contrast ratios
- ✅ **Keyboard Navigation** - Full keyboard support
- ✅ **Screen Reader Friendly** - Proper ARIA labels
- ✅ **Focus Indicators** - Clear focus states
- ✅ **Semantic HTML** - Proper heading hierarchy
- ✅ **Alt Text** - All images have descriptions
- ✅ **Reduced Motion** - Respects user preferences

## 📦 Deployment

### Build for Production

```bash
pnpm build
```

The static files will be in the `dist/` directory.

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sebitabravo/portfolio)

Or use the CLI:

```bash
npm i -g vercel
pnpm build
vercel --prod
```

### Deploy to Netlify

```bash
npm i -g netlify-cli
pnpm build
netlify deploy --prod
```

### Deploy to GitHub Pages

Add to `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://yourusername.github.io',
  base: '/repository-name',
})
```

Then deploy:

```bash
pnpm build
# Push dist/ to gh-pages branch
```

## 🏗️ Architecture

### Component Hierarchy

```
BaseLayout (includes Header & Footer)
  └── Section (container with spacing)
      └── UI Components (Button, Card, Badge)
```

### Content Collections

Content is managed through type-safe Markdown files:

```typescript
// src/content/config.ts
const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    publishDate: z.date(),
    image: z.string().optional(),
    githubUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    order: z.number().default(0),
  }),
})
```

### Styling System

Using TailwindCSS with custom design tokens:

- **Colors**: `primary`, `secondary`, `accent`, `muted`
- **Spacing**: Consistent scale from 0.5rem to 32rem
- **Typography**: Inter Variable font with responsive sizes
- **Dark Mode**: Class-based with CSS variables

### State Management

- **Theme**: localStorage + CSS classes
- **Navigation**: View Transitions API
- **Forms**: Local component state (Preact)
- No external state management needed

## 🔧 Advanced Usage

### Adding a New Page

```astro
---
// src/pages/about.astro
import BaseLayout from '@/layouts/BaseLayout.astro'
import Section from '@/shared/components/Section.astro'
---

<BaseLayout title="About">
  <Section>
    <h1>About Me</h1>
    <p>Your content here...</p>
  </Section>
</BaseLayout>
```

### Creating Custom Components

```astro
---
// src/components/ui/MyComponent.astro
import { cn } from '@/lib/utils'

interface Props {
  title: string
  variant?: 'default' | 'primary'
  class?: string
}

const { title, variant = 'default', class: className } = Astro.props
---

<div class={cn('my-component', variant, className)}>
  <h2>{title}</h2>
  <slot />
</div>

<style>
  .my-component {
    /* Component-specific styles */
  }
</style>
```

### Adding a New Content Type

1. Define schema in `src/content/config.ts`
2. Create directory `src/content/new-type/es/` and `src/content/new-type/en/`
3. Add TypeScript type in `src/types/index.ts`
4. Create display component
5. Query with `getCollection('new-type')`

## 🐛 Troubleshooting

### Dev Server Won't Start

```bash
# Clear cache and reinstall
rm -rf node_modules .astro
pnpm install
pnpm dev
```

### Styles Not Applying

- Verify Tailwind classes are valid
- Check `global.css` is imported in `Layout.astro`
- Clear browser cache (Cmd/Ctrl + Shift + R)

### Content Not Showing

- Check frontmatter format matches schema
- Verify file is in correct locale folder (`es/` or `en/`)
- Check console for Zod validation errors

### Build Errors

```bash
# Type check
pnpm astro check

# View detailed build output
pnpm build
```

## 📚 Resources

- [Astro Documentation](https://docs.astro.build)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Preact Documentation](https://preactjs.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own portfolio!

## 👤 Contact

- **GitHub:** [@sebitabravo](https://github.com/sebitabravo)
- **Email:** hello@sebastianbravo.dev
- **LinkedIn:** [Sebastian Bravo](https://linkedin.com/in/sebitabravo)

---

Built with ❤️ using Astro, Preact, and TailwindCSS
