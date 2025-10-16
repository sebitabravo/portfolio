# Quick Start Guide

Get your portfolio up and running in minutes!

## Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit [http://localhost:4321](http://localhost:4321) to see your portfolio!

## First Steps

### 1. Update Your Information

Edit `src/lib/config.ts`:

```typescript
export const siteConfig: SiteConfig = {
  name: 'Your Name',           // Your full name
  title: 'Portfolio - Your Name',
  description: 'Your description',
  author: 'Your Name',
  email: 'your@email.com',     // Your email
  social: {
    github: 'https://github.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourusername',
    twitter: 'https://twitter.com/yourusername',
  },
}
```

### 2. Add Your Projects

Create a file in `src/content/projects/my-project.md`:

```markdown
---
title: "My Awesome Project"
description: "A brief description of what this project does"
tags: ["React", "TypeScript", "Tailwind"]
featured: true  # Shows on homepage
publishDate: 2024-03-15
image: "/projects/my-project.jpg"  # Optional
githubUrl: "https://github.com/you/project"  # Optional
liveUrl: "https://project-demo.com"  # Optional
---

# My Awesome Project

Add detailed information about your project here...

## Features
- Feature 1
- Feature 2

## Tech Stack
- Technology 1
- Technology 2
```

### 3. Write Blog Posts

Create a file in `src/content/blog/my-post.md`:

```markdown
---
title: "My First Blog Post"
description: "An introduction to my blog"
publishDate: 2024-03-15
tags: ["Web Development", "React"]
featured: true  # Shows on homepage
draft: false    # Set to true to hide
author: "Your Name"
readingTime: "5 min read"
---

Your blog post content here...
```

### 4. Add Work Experience

Create a file in `src/content/work/company-name.md`:

```markdown
---
company: "Company Name"
position: "Your Position"
description: "Brief description of your role"
startDate: 2022-01-01
endDate: null  # null for current position
current: true
location: "Remote"
skills: ["React", "TypeScript", "Node.js"]
logo: "/companies/logo.png"  # Optional
url: "https://company.com"    # Optional
---

Detailed information about your work experience...
```

### 5. Customize Colors

Edit `tailwind.config.ts` to change your color scheme:

```typescript
colors: {
  primary: {
    // Your brand colors
    500: '#your-color',
    600: '#your-color',
  },
}
```

### 6. Add Images

Place images in the `public/` directory:

```
public/
├── projects/
│   └── project-image.jpg
├── blog/
│   └── post-image.jpg
├── companies/
│   └── company-logo.png
└── favicon.svg
```

Reference them in your content with `/projects/image.jpg`

## Common Tasks

### Add a New Page

1. Create a file in `src/pages/`:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import Section from '@/components/ui/Section.astro'
---

<BaseLayout title="New Page">
  <Section>
    <h1>My New Page</h1>
    <p>Content here...</p>
  </Section>
</BaseLayout>
```

2. Add to navigation in `src/lib/config.ts`:

```typescript
export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'New Page', href: '/new-page' },
  // ...
]
```

### Customize Homepage

Edit `src/pages/index.astro`:

- Change hero text
- Add/remove sections
- Modify CTA buttons

### Update About Page

Edit `src/pages/about.astro`:

- Update bio
- Modify skills
- Change contact information

## Build and Deploy

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy!

Or use the CLI:

```bash
npm i -g vercel
vercel
```

### Deploy to Netlify

```bash
npm i -g netlify-cli
pnpm build
netlify deploy --prod
```

## Tips

### Development

- Hot reload is automatic - save files to see changes
- Content changes require page refresh
- Build errors show in terminal

### Content

- Use featured: true for homepage items
- Use draft: true for unpublished blog posts
- Dates should be in YYYY-MM-DD format
- Tags are case-sensitive

### Styling

- Use Tailwind classes for styling
- Custom CSS goes in `src/styles/global.css`
- Component-specific styles in `<style>` tags

### Images

- Optimize images before uploading
- Use WebP format for better compression
- Add alt text for accessibility
- Recommended sizes:
  - Project images: 1200x630
  - Blog images: 1200x630
  - Company logos: 200x200

## Troubleshooting

### Dev server won't start

```bash
# Clear cache and restart
rm -rf node_modules .astro
pnpm install
pnpm dev
```

### Build fails

```bash
# Check for TypeScript errors
pnpm astro check

# View build output
pnpm build
```

### Styles not applying

- Check Tailwind classes are valid
- Verify global.css is imported
- Clear browser cache

### Content not showing

- Check frontmatter format
- Verify file is in correct directory
- Check draft status for blog posts

## Next Steps

1. **Customize Design**
   - Update colors in `tailwind.config.ts`
   - Modify components in `src/components/`
   - Add your own styling

2. **Add Content**
   - Write blog posts
   - Add projects
   - Update work experience

3. **Extend Features**
   - Add contact form backend
   - Integrate analytics
   - Add RSS feed
   - Implement search

4. **Optimize**
   - Add og:images for social sharing
   - Configure sitemap
   - Set up redirects
   - Enable compression

## Resources

- [Astro Documentation](https://docs.astro.build)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Preact Documentation](https://preactjs.com)
- [Markdown Guide](https://www.markdownguide.org)

## Get Help

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed structure
- Read [README.md](./README.md) for full documentation
- Open an issue on GitHub
- Join Astro Discord

## Commands Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Type checking
pnpm astro check      # Check TypeScript types

# Astro commands
pnpm astro add        # Add integration
pnpm astro info       # Show project info
```

Happy building! 🚀
