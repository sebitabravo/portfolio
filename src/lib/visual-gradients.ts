export const visualGradients: Record<string, string> = {
  manttoai: "linear-gradient(140deg, #0e5f66 0%, #3d9f7a 100%)",
  vulcania: "linear-gradient(140deg, #7a2a0a 0%, #e35b25 45%, #f3aa3a 100%)",
  "rapido-sur": "linear-gradient(140deg, #1e3a8a 0%, #3730a3 50%, #6d28d9 100%)",
  wenuke: "linear-gradient(140deg, #075e54 0%, #128c7e 50%, #25d366 100%)",
}

export const fallbackGradient =
  "linear-gradient(140deg, #2b2b2b 0%, #5a5a5a 100%)"

export function projectGradient(slug: string): string {
  return visualGradients[slug] ?? fallbackGradient
}
