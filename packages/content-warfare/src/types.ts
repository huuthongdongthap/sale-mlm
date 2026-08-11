/**
 * Content Warfare Engine — Types
 * KingContent Spy + Sophia AI Production + Funnel OS Conversion
 */

// ============ NICHE & CONFIG ============

export interface Niche {
  id: string;
  name: string;
  keywords: string[];
  kingcontent_category: string;
  funnel_level: 'L0' | 'L1' | 'L2' | 'L3';
  droppii_products: string[];
  content_formats: ContentFormat[];
  cta_template: 'quiz' | 'shop' | 'shop_l2' | 'partner';
  target_audience: string;
}

export type ContentFormat =
  | 'list_tips'
  | 'recipe'
  | 'before_after'
  | 'morning_routine'
  | 'myth_busting'
  | 'review'
  | 'comparison'
  | 'unboxing'
  | 'daily_vlog'
  | 'progress_update'
  | 'testimonial'
  | 'interview'
  | 'transformation';

// ============ SPY SCOUT ============

export interface TrendingTopic {
  rank: number;
  channel_name: string;
  views: number;
  shares: number;
  url: string;
  category: string;
  discovered_at: string;
}

export interface SpyResult {
  niche_id: string;
  date: string;
  topics: TrendingTopic[];
  recommended_angles: string[];
}

// ============ SCRIPT WRITER ============

export interface VideoScript {
  id: string;
  niche_id: string;
  title: string;
  duration_seconds: 30 | 45 | 60;
  hook: string;
  body: string;
  cta: string;
  cta_link: string;
  utm_params: Record<string, string>;
  target_product_ids: string[];
  funnel_level: string;
  format: ContentFormat;
  status: 'draft' | 'approved' | 'producing' | 'published';
  created_at: string;
}

// ============ VIDEO DISPATCH ============

export interface VideoJob {
  id: string;
  script_id: string;
  platform: 'kingcontent_veo3' | 'kingcontent_slide' | 'sophia';
  frame: '9:16' | '16:9';
  voice: string;
  style: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  submitted_at: string;
  completed_at?: string;
}

// ============ DISTRIBUTION ============

export interface PostSchedule {
  id: string;
  video_job_id: string;
  platform: 'facebook' | 'tiktok' | 'youtube_shorts' | 'zalo_oa';
  scheduled_at: string;
  caption: string;
  hashtags: string[];
  cta_link: string;
  status: 'scheduled' | 'posted' | 'failed';
  post_url?: string;
  posted_at?: string;
}

// ============ ANALYTICS ============

export interface ContentCampaign {
  id: string;
  niche: string;
  script: string;
  video_url: string;
  platform: string;
  funnel_level: string;
  views: number;
  clicks: number;
  leads_generated: number;
  orders_generated: number;
  revenue: number;
  created_at: string;
}

export interface DailyReport {
  date: string;
  videos_produced: number;
  total_views: number;
  total_clicks: number;
  new_leads: number;
  new_orders: number;
  revenue: number;
  best_niche: string;
  best_format: ContentFormat;
  recommendations: string[];
}

// ============ PIPELINE ============

export interface PipelineConfig {
  niches: Niche[];
  daily_quota: {
    videos_per_day: number;
    niches_rotation: string[];
    weekend_niches: string[];
  };
  kingcontent: {
    base_url: string;
    account: string;
    plan: string;
    video_style: string;
    frame: string;
    voice: string;
  };
  sophia: {
    base_url: string;
    fallback: boolean;
  };
}
