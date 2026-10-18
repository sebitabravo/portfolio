export type ArticleTitleTransitionName = `vt-article-title-${string}`

/**
 * Una `view-transition-name` debe ser única por documento y coincidir entre la
 * card y el detalle. Los ids de contenido pueden traer mayúsculas o separadores
 * que no forman un custom-ident válido, así que se normalizan una sola vez acá.
 */
export function articleTitleTransitionName(postId: string): ArticleTitleTransitionName {
  const token = postId
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `vt-article-title-${token || "article"}`
}
