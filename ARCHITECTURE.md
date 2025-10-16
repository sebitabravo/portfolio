# Portfolio Architecture Guide

This document explains the architecture and design decisions of this portfolio project.

## Architecture Overview

This portfolio follows a **modular, component-based architecture** designed for:
- **Easy content management** - Add projects, blog posts, and work experience through Markdown files
- **Type safety** - Full TypeScript support with strict typing
- **Performance** - Minimal JavaScript, static generation, and optimized assets
- **Maintainability** - Clear separation of concerns and reusable components
- **Scalability** - Easy to extend with new features and content types
- **Internationalization** - Full i18n support with Spanish (default) and English

## Tech Stack Decisions

### Astro
- **Why**: Ships minimal JavaScript, perfect for content-focused sites
- **Benefits**: Fast builds, flexible, framework-agnostic
- **Use case**: Static site generation with occasional interactivity

### Preact
- **Why**: Lightweight React alternative (3KB vs 40KB)
- **Benefits**: React-like API, minimal bundle size
- **Use case**: Interactive components (ThemeToggle, ContactForm)

### TailwindCSS v4
- **Why**: Utility-first CSS with excellent DX
- **Benefits**: Fast development, consistent design system
- **Use case**: All styling with custom design tokens

### TypeScript
- **Why**: Type safety and better DX
- **Benefits**: Catch errors early, better autocomplete
- **Use case**: All code except Markdown content

## Directory Structure

```
src/
├── components/          # All React/Astro components
│   ├── interactive/    # Preact components (client-side JS)
│   │   ├── ThemeToggle.tsx
│   │   └── ContactForm.tsx
│   ├── sections/       # Page section components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ProjectCard.astro
│   │   ├── BlogCard.astro
│   │   └── WorkCard.astro
│   └── ui/             # Reusable UI primitives
│       ├── Button.astro
│       ├── Card.astro
│       ├── Container.astro
│       ├── Section.astro
│       ├── Badge.astro
│       └── SectionTitle.astro
├── content/            # Content Collections (type-safe)
│   ├── blog/          # Blog posts in Markdown
│   ├── projects/      # Project entries in Markdown
│   │   ├── es/        # Spanish projects
│   │   └── en/        # English projects
│   ├── work/          # Work experience in Markdown
│   │   ├── es/        # Spanish work experience
│   │   └── en/        # English work experience
│   └── config.ts      # Content schemas with Zod
├── layouts/           # Page layouts
│   ├── Layout.astro   # Base HTML layout
│   └── BaseLayout.astro # Layout with Header/Footer
├── lib/               # Utilities and configuration
│   ├── config.ts      # Site configuration
│   ├── utils.ts       # Helper functions
│   └── i18n/          # Internationalization
│       ├── index.ts   # i18n utilities
│       ├── utils.ts   # Content filtering
│       ├── es.json    # Spanish translations
│       └── en.json    # English translations
├── pages/             # File-based routing
│   ├── index.astro    # Homepage (Spanish)
│   ├── projects/
│   │   └── index.astro    # Projects list (Spanish)
│   └── en/            # English pages
│       ├── index.astro    # Homepage (English)
│       └── projects/
│           └── index.astro # Projects list (English)
├── styles/            # Global CSS
│   └── global.css     # Base styles and utilities
└── types/             # TypeScript type definitions
    └── index.ts       # Shared types
```

## Component Architecture

### Component Types

1. **UI Components** (`src/components/ui/`)
   - Pure presentational components
   - Reusable across the entire site
   - No client-side JavaScript
   - Examples: Button, Card, Badge

2. **Section Components** (`src/components/sections/`)
   - Compose UI components
   - Specific to certain page sections
   - May contain business logic
   - Examples: Header, Footer, ProjectCard

3. **Interactive Components** (`src/components/interactive/`)
   - Preact components with client-side JS
   - Use `client:load` directive
   - Handle user interactions
   - Examples: ThemeToggle, ContactForm

### Component Patterns

#### Props Pattern
All components use TypeScript interfaces for props:

```astro
---
interface Props {
  title: string
  description?: string
  class?: string
}

const { title, description, class: className } = Astro.props
---
```

#### Composition Pattern
Components compose smaller components:

```astro
<Card>
  <Badge>Featured</Badge>
  <SectionTitle title="Hello" />
</Card>
```

#### Slot Pattern
Components use slots for flexible content:

```astro
<Container>
  <slot />
</Container>
```

## Content Collections

Content Collections provide **type-safe content management** with automatic TypeScript types.

### Schema Definition
Defined in `src/content/config.ts`:

```typescript
const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    // ...
  }),
})
```

### Content Organization

1. **Projects** (`src/content/projects/`)
   - Technical projects and portfolio pieces
   - Supports featured flag for homepage
   - Optional GitHub and live URLs

2. **Blog** (`src/content/blog/`)
   - Technical articles and tutorials
   - Draft support for unpublished posts
   - Reading time estimation

3. **Work Experience** (`src/content/work/`)
   - Professional experience
   - Current position flag
   - Skills and responsibilities

### Content Usage

```typescript
// Get all items
const projects = await getCollection('projects')

// Filter and sort
const featured = projects
  .filter(p => p.data.featured)
  .sort((a, b) => b.data.publishDate - a.data.publishDate)
```

## Styling System

### Design Tokens
Custom colors defined in `tailwind.config.ts`:

```typescript
colors: {
  primary: { ... },    // Main brand color
  secondary: { ... },  // Accent color
  neutral: { ... },    // Gray scale
}
```

### Global Styles
Base styles in `src/styles/global.css`:
- Typography
- Dark mode
- Custom utilities
- Scrollbar styling

### Custom Utilities
- `.text-gradient` - Gradient text effect
- `.glass` - Glassmorphism effect
- `.card-hover` - Hover animation
- `.focus-ring` - Accessible focus styles

## Layouts System

### Base Layout (`Layout.astro`)
- HTML structure
- Meta tags and SEO
- Dark mode initialization
- Font loading

### Base Layout with Navigation (`BaseLayout.astro`)
- Includes Header and Footer
- Main content wrapper
- Used by all pages

## State Management

### Theme State
- Managed by `ThemeToggle.tsx`
- Persisted in localStorage
- Initialized on page load
- No external state library needed

### Form State
- Managed by `ContactForm.tsx`
- Local component state
- Form validation
- Error handling

## Performance Optimizations

1. **Minimal JavaScript**
   - Only interactive components use JS
   - Preact for small bundle size
   - Most pages are static HTML

2. **Image Optimization**
   - Lazy loading by default
   - Proper aspect ratios
   - Responsive images

3. **CSS Optimization**
   - Tailwind purges unused styles
   - Critical CSS inline
   - No runtime CSS-in-JS

4. **Build Optimization**
   - Static generation
   - Asset hashing
   - Compression

## SEO Strategy

1. **Meta Tags**
   - Dynamic title and description
   - Open Graph tags
   - Twitter cards
   - Canonical URLs

2. **Semantic HTML**
   - Proper heading hierarchy
   - Landmark regions
   - Descriptive links

3. **Performance**
   - Fast page loads
   - Optimized images
   - Minimal JavaScript

## Accessibility

1. **Keyboard Navigation**
   - Focus visible styles
   - Tab order
   - Skip links (can be added)

2. **ARIA Labels**
   - Descriptive button labels
   - Icon-only buttons
   - Form labels

3. **Color Contrast**
   - WCAG AA compliant
   - Dark mode support
   - No color-only indicators

## Internationalization (i18n)

The portfolio supports **Spanish (default)** and **English** with full i18n capabilities.

### URL Structure
- Spanish (default): `/` (no prefix)
- English: `/en/`

### Translation System
1. **Translation Files** (`src/lib/i18n/`)
   - `es.json` - Spanish translations
   - `en.json` - English translations
   - JSON structure with nested keys

2. **Content Organization**
   - Content collections organized by locale
   - `projects/es/` and `projects/en/`
   - `work/es/` and `work/en/`

3. **Helper Functions**
   - `getLocaleFromUrl()` - Extract locale from URL
   - `getTranslations()` - Get translations for locale
   - `filterByLocale()` - Filter content by locale

4. **Language Picker**
   - Automatic alternate URL generation
   - Preserves current page when switching
   - Accessible with ARIA labels

### Usage Example
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

For detailed i18n documentation, see [I18N.md](./I18N.md).

## Adding New Features

### New Content Type

1. Define schema in `src/content/config.ts`
2. Create content directory
3. Add TypeScript type in `src/types/index.ts`
4. Create display component
5. Create collection page

### New Page

1. Create file in `src/pages/`
2. Use `BaseLayout`
3. Compose existing components
4. Add to navigation if needed

### New Component

1. Decide component type (UI/Section/Interactive)
2. Create in appropriate directory
3. Define Props interface
4. Use TypeScript for type safety
5. Document with comments

## Testing Strategy

While not implemented yet, recommended approach:

1. **Unit Tests**
   - Test utility functions
   - Test complex logic
   - Use Vitest

2. **Component Tests**
   - Test interactive components
   - Use Preact Testing Library
   - Focus on user interactions

3. **E2E Tests**
   - Test critical user flows
   - Use Playwright
   - Test on multiple browsers

## Deployment

### Build Process
```bash
pnpm build      # Generates static files in dist/
```

### Deployment Targets
- **Vercel** (recommended) - Automatic deployments
- **Netlify** - Alternative static hosting
- **GitHub Pages** - Free hosting option

### Environment Variables
None required for basic setup. Add as needed for:
- Contact form endpoint
- Analytics
- CMS integration

## Future Enhancements

Potential additions:
1. **Search** - Fuse.js for client-side search
2. **RSS Feed** - For blog posts
3. **Sitemap** - Automatic generation
4. **Analytics** - Privacy-focused analytics
5. **Comments** - Giscus or similar
6. **Newsletter** - Email subscription
7. ~~**i18n** - Multi-language support~~ ✅ **IMPLEMENTED** (Spanish/English)
8. **CMS** - Decap CMS or similar

## Development Workflow

1. **Start dev server**: `pnpm dev`
2. **Add content**: Create Markdown files
3. **Customize**: Update components/styles
4. **Test build**: `pnpm build`
5. **Preview**: `pnpm preview`
6. **Deploy**: Push to Git

## Troubleshooting

### Common Issues

1. **Path aliases not working**
   - Check `tsconfig.json` and `astro.config.mjs`
   - Restart dev server

2. **Tailwind classes not applied**
   - Check content paths in `tailwind.config.ts`
   - Verify CSS import in layout

3. **Dark mode not working**
   - Check browser console
   - Verify localStorage access
   - Check script in `Layout.astro`

## Conclusion

This architecture prioritizes:
- **Developer Experience** - Easy to understand and extend
- **Performance** - Fast loading and minimal JavaScript
- **Maintainability** - Clear structure and type safety
- **User Experience** - Fast, accessible, and beautiful

The modular design makes it easy to add new features, content types, and customizations while maintaining code quality and performance.
