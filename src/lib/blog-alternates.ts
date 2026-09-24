import type { CollectionEntry } from 'astro:content'
import type { Locale } from './i18n'

interface BlogAlternateOptions {
  locale: Locale
  postId: string
  translationId?: string
  isFallback?: boolean
}

/** Return a counterpart only when the explicit key identifies exactly one post per locale. */
export function getBlogTranslationId(
  post: CollectionEntry<'blog'>,
  posts: CollectionEntry<'blog'>[],
): string | undefined {
  const key = post.data.translationKey
  if (!key || (post.data.locale !== 'es' && post.data.locale !== 'en')) return undefined

  const matches = posts.filter((candidate) => candidate.data.translationKey === key)
  if (matches.length !== 2 || !matches.some((candidate) => candidate.id === post.id)) return undefined

  const counterpart = matches.find((candidate) => candidate.id !== post.id)
  const oppositeLocale = post.data.locale === 'es' ? 'en' : 'es'
  return counterpart?.data.locale === oppositeLocale ? counterpart.id : undefined
}

export function createBlogAlternates({
  locale,
  postId,
  translationId,
  isFallback = false,
}: BlogAlternateOptions): Array<{ hreflang: string; href: string }> {
  const spanishUrl = (id: string) => `https://sebita.dev/blog/${id}`
  const englishUrl = (id: string) => `https://sebita.dev/en/blog/${id}`

  if (isFallback) {
    const url = spanishUrl(postId)
    return [
      { hreflang: 'es', href: url },
      { hreflang: 'x-default', href: url },
    ]
  }

  const ownUrl = locale === 'es' ? spanishUrl(postId) : englishUrl(postId)
  if (!translationId) {
    return [
      { hreflang: locale, href: ownUrl },
      { hreflang: 'x-default', href: ownUrl },
    ]
  }

  const translatedUrl = locale === 'es' ? englishUrl(translationId) : spanishUrl(translationId)
  return [
    { hreflang: locale, href: ownUrl },
    { hreflang: locale === 'es' ? 'en' : 'es', href: translatedUrl },
    { hreflang: 'x-default', href: locale === 'es' ? ownUrl : translatedUrl },
  ]
}
