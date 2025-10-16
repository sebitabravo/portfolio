# i18n Usage Examples

Complete examples of how to use internationalization in your portfolio.

## Example 1: Basic Page with Translations

```astro
---
// src/pages/about.astro
import BaseLayout from '@/layouts/BaseLayout.astro'
import { getLocaleFromUrl, getTranslations } from '@/lib/i18n'

const locale = getLocaleFromUrl(Astro.url)
const t = getTranslations(locale)
---

<BaseLayout title={`${t.nav.about} - Sebastian Bravo`}>
  <h1>{t.nav.about}</h1>
  <p>
    {locale === 'es' 
      ? 'Esta es la página sobre mí en español'
      : 'This is the about page in English'
    }
  </p>
</BaseLayout>
```

## Example 2: Component with Translations

```astro
---
// src/components/ContactButton.astro
import { getLocaleFromUrl, getTranslations } from '@/lib/i18n'

const locale = getLocaleFromUrl(Astro.url)
const t = getTranslations(locale)
---

<button>
  {t.hero.contact}
</button>
```

## Example 3: Content Collection with Locale Filter

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content'
import { getLocaleFromUrl } from '@/lib/i18n'
import { filterByLocale } from '@/lib/i18n/utils'

const locale = getLocaleFromUrl(Astro.url)

// Get all blog posts
const allPosts = await getCollection('blog')

// Filter by current locale
const posts = filterByLocale(allPosts, locale)

// Sort by date
const sortedPosts = posts.sort((a, b) => 
  b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
)
---

<div>
  {sortedPosts.map(post => (
    <article>
      <h2>{post.data.title}</h2>
      <p>{post.data.description}</p>
    </article>
  ))}
</div>
```

## Example 4: Dynamic Route with Locale

```astro
---
// src/pages/projects/[slug].astro
import { getCollection } from 'astro:content'
import { getLocaleFromUrl } from '@/lib/i18n'
import { filterByLocale, getSlugWithoutLocale } from '@/lib/i18n/utils'

export async function getStaticPaths() {
  const allProjects = await getCollection('projects')
  
  return allProjects.map(project => ({
    params: { 
      slug: getSlugWithoutLocale(project.id) 
    },
    props: { project },
  }))
}

const locale = getLocaleFromUrl(Astro.url)
const { project } = Astro.props
const { Content } = await project.render()
---

<article>
  <h1>{project.data.title}</h1>
  <Content />
</article>
```

## Example 5: Custom Component with Conditional Text

```astro
---
// src/components/AvailableForWork.astro
import { getLocaleFromUrl } from '@/lib/i18n'

interface Props {
  available: boolean
}

const locale = getLocaleFromUrl(Astro.url)
const { available } = Astro.props
---

<div class="badge">
  {available ? (
    locale === 'es' ? '✅ Disponible para trabajo' : '✅ Available for work'
  ) : (
    locale === 'es' ? '🔴 No disponible' : '🔴 Not available'
  )}
</div>
```

## Example 6: Navigation with Locale-aware Links

```astro
---
// src/components/Navigation.astro
import { getLocaleFromUrl, getTranslations } from '@/lib/i18n'

const locale = getLocaleFromUrl(Astro.url)
const t = getTranslations(locale)

// Create locale-aware URLs
const prefix = locale === 'es' ? '' : '/en'
const navItems = [
  { label: t.nav.home, href: `${prefix}/` },
  { label: t.nav.projects, href: `${prefix}/projects` },
  { label: t.nav.about, href: `${prefix}/about` },
]
---

<nav>
  {navItems.map(item => (
    <a href={item.href}>{item.label}</a>
  ))}
</nav>
```

## Example 7: SEO Meta Tags per Locale

```astro
---
// src/layouts/SEOLayout.astro
import { getLocaleFromUrl } from '@/lib/i18n'

interface Props {
  title: string
  description: string
}

const locale = getLocaleFromUrl(Astro.url)
const { title, description } = Astro.props

// Create alternate URLs for other languages
const currentPath = Astro.url.pathname
const alternateUrl = locale === 'es' 
  ? `/en${currentPath}`
  : currentPath.replace('/en', '')
---

<head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <html lang={locale} />
  
  <!-- Alternate language link -->
  <link 
    rel="alternate" 
    hreflang={locale === 'es' ? 'en' : 'es'} 
    href={`https://sebita.dev${alternateUrl}`} 
  />
</head>
```

## Example 8: Date Formatting by Locale

```astro
---
// src/components/FormattedDate.astro
import { getLocaleFromUrl } from '@/lib/i18n'

interface Props {
  date: Date
}

const locale = getLocaleFromUrl(Astro.url)
const { date } = Astro.props

// Format date based on locale
const formattedDate = new Intl.DateTimeFormat(
  locale === 'es' ? 'es-ES' : 'en-US',
  { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
).format(date)
---

<time datetime={date.toISOString()}>
  {formattedDate}
</time>
```

## Example 9: Adding a New Translation Key

**Step 1**: Add to Spanish translations (`es.json`)
```json
{
  "contact": {
    "title": "Contáctame",
    "subtitle": "¿Tienes un proyecto en mente?",
    "button": "Enviar mensaje"
  }
}
```

**Step 2**: Add to English translations (`en.json`)
```json
{
  "contact": {
    "title": "Contact Me",
    "subtitle": "Have a project in mind?",
    "button": "Send message"
  }
}
```

**Step 3**: Use in component
```astro
---
import { getLocaleFromUrl, getTranslations } from '@/lib/i18n'

const locale = getLocaleFromUrl(Astro.url)
const t = getTranslations(locale)
---

<section>
  <h2>{t.contact.title}</h2>
  <p>{t.contact.subtitle}</p>
  <button>{t.contact.button}</button>
</section>
```

## Example 10: Creating Content in Multiple Languages

**Spanish** (`src/content/projects/es/tienda-online.md`):
```markdown
---
title: "Tienda Online"
description: "Una plataforma de e-commerce completa"
tags: ["Next.js", "Stripe", "PostgreSQL"]
publishDate: 2024-03-15
featured: true
---

Una tienda online moderna con carrito de compras, procesamiento de pagos
y panel de administración.

## Características

- Sistema de autenticación
- Carrito de compras en tiempo real
- Integración con Stripe
- Panel de administración
```

**English** (`src/content/projects/en/online-store.md`):
```markdown
---
title: "Online Store"
description: "A complete e-commerce platform"
tags: ["Next.js", "Stripe", "PostgreSQL"]
publishDate: 2024-03-15
featured: true
---

A modern online store with shopping cart, payment processing,
and admin dashboard.

## Features

- Authentication system
- Real-time shopping cart
- Stripe integration
- Admin dashboard
```

## Best Practices

1. **Always filter content by locale** when querying collections
2. **Use translation keys** for all user-facing text
3. **Keep translation files in sync** - same structure in both
4. **Test both language versions** before deploying
5. **Use `getLocaleFromUrl`** at the top of pages/components
6. **Create locale-aware URLs** with proper prefixes
7. **Add proper SEO tags** with hreflang alternates
8. **Format dates/numbers** according to locale conventions

## Common Patterns

### Pattern: Conditional Text
```astro
{locale === 'es' ? 'Texto en español' : 'Text in English'}
```

### Pattern: Translation Object
```astro
const t = getTranslations(locale)
<h1>{t.section.title}</h1>
```

### Pattern: Content Filtering
```astro
const items = filterByLocale(await getCollection('items'), locale)
```

### Pattern: Locale-aware Link
```astro
const href = locale === 'es' ? '/contacto' : '/en/contact'
```
