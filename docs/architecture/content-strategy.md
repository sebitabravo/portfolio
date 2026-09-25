# Content Strategy Evaluation

## Context

The portfolio uses two complementary content paths. Blog posts are MDX files in
`src/content/blog/`, validated by the Astro/Zod `blog` collection schema in
`src/content.config.ts`. Structured portfolio content, including projects, work
experience and certifications, lives in typed modules under `src/lib/data/` and
is exposed to consumers through the stable `src/lib/data.ts` facade. Issue #2
asks whether a headless CMS or Markdown/MDX should replace this approach.

## Options

### Headless CMS (Sanity/Contentful)

A CMS could support editing without code changes, drafts and multi-contributor
workflows, but adds infrastructure, a vendor dependency and CI/local complexity.
The current editorial workflow does not justify that cost.

### More Astro collections / Markdown or MDX

Astro collections already fit the blog: prose and frontmatter benefit from an
explicit schema. Moving other domains could make sense if editing or schema
needs emerge, but would require migrating typed bilingual data, defining new
schemas and changing the facade's consumers. It is not inherently simpler for
structured portfolio records.

### Keep the current split

Blog prose remains in MDX with collection validation. Projects, work,
certifications and other structured content remain typed TypeScript domain
modules rather than one large data file. The facade keeps existing consumers
independent of the module layout. Changes still require a redeploy.

## Decision

Retain the current split. Do not add a CMS or migrate all portfolio domains to
collections now. The existing blog schema does not validate projects, work or
certifications; their TypeScript types and domain modules serve that role.

Re-evaluate an individual domain for a collection or CMS only when a concrete
editorial workflow, contributor need or schema-validation gap warrants the
migration. Scope any future change to that need rather than treating a wholesale
collection migration as the next task.
