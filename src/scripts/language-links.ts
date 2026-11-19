// El par de idioma del header apunta a la ruta actual, que en build es la misma
// para los dos locales. El head ya emite los `hreflang` con el slug traducido y
// el `x-default`, así que acá se copia ese destino y se le suma lo que solo
// existe en el navegador: query, hash y anclas traducidas.
//
// Contrato (lo fija tests/blog-language-switch.spec.ts):
// 1. Si el alternado trae su propio query o hash, ganan esos.
// 2. Si no trae, se hereda el query y el hash del visitante.
// 3. Las anclas del home se traducen entre locales (#proyectos <-> #projects).
// 4. Un artículo sin alternado cae al índice del blog del otro idioma, no a una
//    ruta inexistente.
// 5. Elegir el idioma que ya está activo no navega.
//
// Sin JavaScript los enlaces siguen funcionando por prefijo de ruta: se pierden
// el fragmento y los parámetros, no el cambio de idioma.

const LANGUAGE_SELECTOR = ".lang a[href]"
const ACTIVE_LANGUAGE_SELECTOR = ".lang a[aria-current='true']"

/** Anclas del home en ambos sentidos. Los ids del diseño son neutros en el DOM
 * y se traducen acá, así el visitante ve #projects en inglés y #proyectos en
 * español sin duplicar markup. */
const SECTION_ALIASES: Record<string, string> = {
  proyectos: "projects",
  projects: "proyectos",
  experiencia: "experience",
  experience: "experiencia",
  "sobre-mi": "about",
  about: "sobre-mi",
  formacion: "education",
  education: "formacion",
  contacto: "contact",
  contact: "contacto",
}

const BLOG_INDEX: Record<string, string> = { es: "/blog", en: "/en/blog" }

/** Astro emite `/en/blog/x/`; el contrato de los specs es sin barra final, pero
 * la raíz y los prefijos de idioma conservan la suya. */
function normalizePath(pathname: string): string {
  if (pathname === "/" || /^\/[a-z]{2}\/$/.test(pathname)) return pathname
  return pathname.replace(/\/+$/, "")
}

function translateHash(hash: string): string {
  const id = hash.replace(/^#/, "")
  if (id === "") return ""
  const alias = SECTION_ALIASES[id]
  return alias ? `#${alias}` : hash
}

function isArticlePath(pathname: string): boolean {
  return /^(\/en)?\/blog\/[^/]+$/.test(normalizePath(pathname))
}

function targetFor(link: HTMLAnchorElement): string {
  const language = (link.textContent ?? "").trim()
  const params = window.location.search
  const hash = window.location.hash
  const isActive = link.getAttribute("aria-current") === "true"
  const alternate = document.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${language}"]`,
  )

  if (isActive) return normalizePath(window.location.pathname) + params + hash

  if (alternate) {
    const url = new URL(alternate.href, window.location.origin)
    return normalizePath(url.pathname) + (url.search || params) + (url.hash || translateHash(hash))
  }

  if (isArticlePath(window.location.pathname)) {
    // El alternado del head existe para SEO y no anuncia el fallback inglés a
    // propósito. El par de idioma sí puede ofrecerlo, así que se resuelve acá:
    // hacia inglés siempre existe la ruta generada con el mismo slug; hacia
    // español no se puede saber, y un 404 es peor que el índice.
    const slug = normalizePath(window.location.pathname).split("/").filter(Boolean).pop()
    const prefix = language === "en" ? "/en" : ""
    const candidate = slug !== undefined ? `${prefix}/blog/${slug}` : BLOG_INDEX[language]
    return (language === "en" ? candidate : BLOG_INDEX[language] ?? candidate) + params + hash
  }

  return normalizePath(window.location.pathname) + params + hash
}

function syncLanguageLinks(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>(LANGUAGE_SELECTOR)

  for (const link of links) {
    if ((link.textContent ?? "").trim() === "") continue
    link.setAttribute("href", targetFor(link))
  }
}

// El idioma activo es parte del par de control, no un enlace muerto: el click
// se cancela para que no recargue la misma página y no ensucie el historial.
// Para el otro idioma el destino se recalcula en `pointerdown` porque el
// ClientRouter lee el href al comienzo del click: mutarlo ahí llega tarde.
document.addEventListener(
  "pointerdown",
  (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const link = target.closest<HTMLAnchorElement>(LANGUAGE_SELECTOR)
    if (link !== null) link.setAttribute("href", targetFor(link))
  },
  true,
)

document.addEventListener(
  "click",
  (event) => {
    const target = event.target
    if (!(target instanceof Element)) return

    // En captura: el ClientRouter cancela la propagación al interceptar el
    // enlace, así que un listener burbujeante nunca llegaría a tiempo.
    const active = target.closest(ACTIVE_LANGUAGE_SELECTOR)
    if (active !== null) event.preventDefault()
  },
  true,
)

document.addEventListener("astro:page-load", syncLanguageLinks)
syncLanguageLinks()
