/**
 * Obtiene el slug sin el prefijo de locale
 */
export function getSlugWithoutLocale(id: string): string {
  // Elimina el prefijo de locale (es/ o en/)
  return id.split('/').slice(1).join('/')
}
