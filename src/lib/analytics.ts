import { track } from "@vercel/analytics"

export type AnalyticsEvent =
  | { name: "project_view"; props: { project: string; action: "live" | "code" | "casestudy" } }
  | { name: "cv_download"; props: { locale: string } }
  | { name: "social_click"; props: { platform: string } }

export function trackEvent(event: AnalyticsEvent): void {
  try {
    track(event.name, event.props)
  } catch {
    // Analytics must never break the main functionality
  }
}
