# Content Strategy Evaluation

## Context

Current portfolio content lives in `src/lib/data.ts`. Issue #2 asks to evaluate whether a headless CMS or Markdown/MDX should replace this approach.

## Option A: Headless CMS (Sanity/Contentful)

- Pros:
  - Update content without code changes
  - Editorial workflows and draft/publish controls
  - Scales when multiple contributors edit content
- Cons:
  - Extra infrastructure and vendor dependency
  - More moving parts for a personal static portfolio
  - Higher complexity in local development and CI

## Option B: Markdown/MDX content files

- Pros:
  - Keeps repository as source of truth
  - Better maintainability than long TypeScript object literals
  - Native fit for Astro content collections
- Cons:
  - Requires redeploy to publish changes
  - Still needs migration effort and content schema definition

## Option C: Keep `data.ts` (current state)

- Pros:
  - Fastest to edit for small content volume
  - Zero extra tooling
- Cons:
  - Harder long-term scalability
  - Less content governance
  - Mixing data and logic in one file increases maintenance cost

## Decision

For this project stage, **Option B (Markdown/MDX)** is the recommended next step.

- It keeps architecture simple while improving maintainability.
- It avoids operational overhead of a CMS.
- It aligns with Astro strengths and allows future migration to headless CMS if content operations grow.

## Next Iteration Plan

1. Create Astro content collections for `projects`, `experience`, and `certifications`.
2. Move bilingual content into structured MDX files per locale.
3. Replace `getProjects/getWorkExperience/getCertifications` with collection queries.
4. Add schema validation for collection entries in CI.
