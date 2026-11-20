// Íconos de interfaz: Tabler Icons v3.52.0 (outline, MIT, ver third-party/LICENSE-tabler.txt).
// Solo se copian los glifos usados; no hay dependencia del paquete (postura de supply chain del repo).
import type { IconDef } from "./types"

export const uiIcons = {
  "mail": { style: "stroke", paths: ["M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10", "M3 7l9 6l9 -6"] },
  "brand-github": { style: "stroke", paths: ["M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"] },
  "brand-linkedin": { style: "stroke", paths: ["M8 11v5", "M8 8v.01", "M12 16v-5", "M16 16v-3a2 2 0 1 0 -4 0", "M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4l0 -10"] },
  "download": { style: "stroke", paths: ["M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2", "M7 11l5 5l5 -5", "M12 4l0 12"] },
  "external-link": { style: "stroke", paths: ["M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6", "M11 13l9 -9", "M15 4h5v5"] },
  "file-text": { style: "stroke", paths: ["M14 3v4a1 1 0 0 0 1 1h4", "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2", "M9 9l1 0", "M9 13l6 0", "M9 17l6 0"] },
  "file-type-pdf": { style: "stroke", paths: ["M14 3v4a1 1 0 0 0 1 1h4", "M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4", "M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6", "M17 18h2", "M20 15h-3v6", "M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1"] },
  "arrow-right": { style: "stroke", paths: ["M5 12l14 0", "M13 18l6 -6", "M13 6l6 6"] },
  "arrow-down": { style: "stroke", paths: ["M12 5l0 14", "M18 13l-6 6", "M6 13l6 6"] },
  "brand-aws": { style: "stroke", paths: ["M17 18.5a15.198 15.198 0 0 1 -7.37 1.44a14.62 14.62 0 0 1 -6.63 -2.94", "M19.5 21c.907 -1.411 1.451 -3.323 1.5 -5c-1.197 -.773 -2.577 -.935 -4 -1", "M3 11v-4.5a1.5 1.5 0 0 1 3 0v4.5", "M3 9h3", "M9 5l1.2 6l1.8 -4l1.8 4l1.2 -6", "M18 10.25c0 .414 .336 .75 .75 .75h1.25a1 1 0 0 0 1 -1v-1a1 1 0 0 0 -1 -1h-1a1 1 0 0 1 -1 -1v-1a1 1 0 0 1 1 -1h1.25a.75 .75 0 0 1 .75 .75"] },
} as const satisfies Record<string, IconDef>

export type UiIconName = keyof typeof uiIcons
