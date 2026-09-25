import type { Locale } from "./i18n"

interface PageMetadata {
  title: string
  description: string
  canonical: string
  locale: Locale
}

export function getWebPageSchema(noindex: boolean, page: PageMetadata) {
  return noindex
    ? []
    : [
        {
          "@type": "WebPage",
          name: page.title,
          description: page.description,
          url: page.canonical,
          inLanguage: page.locale,
        },
      ]
}

interface LayoutJsonLdInput {
  title: string
  siteName: string
  description: string
  canonical: string
  locale: Locale
  profileUrl: string
  personName: string
  jobTitle: string
  email: string
  imageUrl: string
  sameAs: string[]
  noindex: boolean
}

const PERSON_KNOWS_ABOUT = [
  "React",
  "TypeScript",
  "Astro",
  "Next.js",
  "Django",
  "NestJS",
  "FastAPI",
  "PostgreSQL",
  "Docker",
  "Tailwind CSS",
  "REST APIs",
  "Frontend Development",
  "Web Performance",
  "Accessibility",
  "WCAG",
] as const

export function buildLayoutJsonLd(input: LayoutJsonLdInput): string {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: input.personName,
        alternateName: "sebitabravo",
        url: input.profileUrl,
        jobTitle: input.jobTitle,
        email: `mailto:${input.email}`,
        image: input.imageUrl,
        sameAs: input.sameAs,
        nationality: {
          "@type": "Country",
          name: "Chile",
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "CL",
        },
        alumniOf: [
          {
            "@type": "CollegeOrUniversity",
            name: "INACAP",
          },
          {
            "@type": "HighSchool",
            name: "Liceo Politécnico Pueblo Nuevo",
          },
        ],
        hasCredential: [
          {
            "@type": "EducationalOccupationalCredential",
            name: "AWS Academy Cloud Foundations",
            credentialCategory: "Certification",
            recognizedBy: {
              "@type": "Organization",
              name: "Amazon Web Services (AWS)",
            },
          },
        ],
        hasOccupation: {
          "@type": "Occupation",
          name: input.jobTitle,
          occupationLocation: {
            "@type": "Country",
            name: "Chile",
          },
        },
        knowsAbout: [...PERSON_KNOWS_ABOUT],
        description: input.description,
      },
      {
        "@type": "WebSite",
        name: input.siteName,
        url: "https://sebita.dev",
        inLanguage: input.locale,
        description: input.description,
      },
      ...getWebPageSchema(input.noindex, {
        title: input.title,
        description: input.description,
        canonical: input.canonical,
        locale: input.locale,
      }),
    ],
  }
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c")
}
