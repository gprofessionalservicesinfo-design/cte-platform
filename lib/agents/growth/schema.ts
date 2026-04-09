import { z } from 'zod'

export const CONTENT_TYPES    = ['reel', 'carousel', 'video_largo', 'blog_post', 'email'] as const
export const PLATFORMS        = ['instagram', 'tiktok', 'youtube', 'facebook', 'email', 'blog'] as const
export const CONTENT_STATUSES = ['planned', 'in_progress', 'published', 'cancelled'] as const
export const SEARCH_INTENTS   = ['informational', 'transactional', 'navigational'] as const
export const TREND_DIRECTIONS = ['up', 'stable', 'down'] as const

export const GeoPrioritySchema = z.object({
  country:        z.string(),
  priority_score: z.number().min(0).max(10),
  top_service:    z.string(),
  reasoning:      z.string(),
})

export const ServicePrioritySchema = z.object({
  service:         z.string(),
  priority_score:  z.number().min(0).max(10),
  trend_direction: z.enum(TREND_DIRECTIONS),
  reasoning:       z.string(),
})

export const KeywordClusterSchema = z.object({
  cluster_name:   z.string(),
  keywords:       z.array(z.string()).min(1),
  target_country: z.string(),
  search_intent:  z.enum(SEARCH_INTENTS),
  priority:       z.number().int().min(1).max(5),
})

export const ContentItemSchema = z.object({
  content_id:     z.string(),
  type:           z.enum(CONTENT_TYPES),
  title:          z.string(),
  hook:           z.string(),
  cta:            z.string(),
  target_country: z.string(),
  target_service: z.string(),
  platform:       z.enum(PLATFORMS),
  status:         z.enum(CONTENT_STATUSES),
  scheduled_date: z.string().nullable(),
})

export const LandingPageSchema = z.object({
  slug:           z.string(),
  title:          z.string(),
  target_service: z.string(),
  target_country: z.string(),
  priority:       z.number().int().min(1).max(5),
  reasoning:      z.string(),
})

export const GrowthOutputSchema = z.object({
  week_start:                      z.string(),
  geo_priority:                    z.array(GeoPrioritySchema).min(1),
  service_priority:                z.array(ServicePrioritySchema).min(1),
  keyword_clusters:                z.array(KeywordClusterSchema).min(1),
  content_calendar:                z.array(ContentItemSchema).min(6),
  landing_page_recommendations:    z.array(LandingPageSchema).min(1),
  master_recommendation:           z.string(),
  organic_cost_per_lead_estimate:  z.number().nullable(),
  growth_version:                  z.literal('growth-v1.0').default('growth-v1.0'),
})

export type GrowthOutput      = z.infer<typeof GrowthOutputSchema>
export type GeoPriority       = z.infer<typeof GeoPrioritySchema>
export type ServicePriority   = z.infer<typeof ServicePrioritySchema>
export type KeywordCluster    = z.infer<typeof KeywordClusterSchema>
export type ContentItem       = z.infer<typeof ContentItemSchema>
export type LandingPage       = z.infer<typeof LandingPageSchema>
export type TrendDirection    = typeof TREND_DIRECTIONS[number]
export type ContentType       = typeof CONTENT_TYPES[number]
export type Platform          = typeof PLATFORMS[number]
