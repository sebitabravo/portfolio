/**
 * Módulo de analytics con eventos personalizados para Vercel Analytics.
 * Centraliza todos los eventos del portfolio para consistencia.
 */
import { track } from "@vercel/analytics"

export type AnalyticsEvent =
  | { name: "project_view"; props: { project: string; action: "live" | "code" } }
  | { name: "cv_download"; props: { locale: string } }
  | { name: "social_click"; props: { platform: string } }

/**
 * Trackea un evento tipado. Silencia errores para no romper la UX.
 */
export function trackEvent(event: AnalyticsEvent): void {
  try {
    track(event.name, event.props)
  } catch {
    // analytics nunca debe romper la funcionalidad principal
  }
}
