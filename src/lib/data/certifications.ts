import type { Locale } from "@/lib/i18n"

// CERTIFICACIONES
// ============================================

const certificationsData = {
  es: [
    {
      name: "AWS Academy Graduate - AWS Academy Cloud Foundations",
      organization: "Amazon Web Services (AWS)",
      pdfUrl: "/certifications/aws-cloud-foundations.pdf",
      order: 1,
      category: 'professional' as const,
    },
    {
      name: "Git de noob a pro",
      organization: "Mastermind",
      pdfUrl: "/certifications/git-noob-pro.pdf",
      order: 2,
      category: 'professional' as const,
    },
    {
      name: "Desarrollador Full Stack",
      organization: "INACAP",
      pdfUrl: "/certifications/full-stack-developer.pdf",
      order: 3,
      category: 'academic' as const,
    },
    {
      name: "Diseño y Gestión de Base de Datos",
      organization: "INACAP",
      pdfUrl: "/certifications/database-design.pdf",
      order: 4,
      category: 'academic' as const,
    },
    {
      name: "Diseño Ágil de Sistemas",
      organization: "INACAP",
      pdfUrl: "/certifications/agile-systems-design.pdf",
      order: 5,
      category: 'academic' as const,
    },
  ],
  en: [
    {
      name: "AWS Academy Graduate - AWS Academy Cloud Foundations",
      organization: "Amazon Web Services (AWS)",
      pdfUrl: "/certifications/aws-cloud-foundations.pdf",
      order: 1,
      category: 'professional' as const,
    },
    {
      name: "Git from Noob to Pro",
      organization: "Mastermind",
      pdfUrl: "/certifications/git-noob-pro.pdf",
      order: 2,
      category: 'professional' as const,
    },
    {
      name: "Full Stack Developer",
      organization: "INACAP",
      pdfUrl: "/certifications/full-stack-developer.pdf",
      order: 3,
      category: 'academic' as const,
    },
    {
      name: "Database Design and Management",
      organization: "INACAP",
      pdfUrl: "/certifications/database-design.pdf",
      order: 4,
      category: 'academic' as const,
    },
    {
      name: "Agile Systems Design",
      organization: "INACAP",
      pdfUrl: "/certifications/agile-systems-design.pdf",
      order: 5,
      category: 'academic' as const,
    },
  ]
}

export function getCertifications(locale: Locale = 'es') {
  return certificationsData[locale]
}

// ============================================
