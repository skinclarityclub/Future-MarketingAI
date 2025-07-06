/**
 * User Behavior Tracking Types
 * Comprehensive type definitions for tracking user interactions and behavior patterns
 */

export interface UserBehaviorEvent {
  id: string;
  session_id: string;
  user_id?: string; // Optional - for authenticated users
  event_type: UserBehaviorEventType;
  event_data: EventData;
  timestamp: string;
  page_url: string;
  page_title?: string;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
  device_info?: DeviceInfo;
  created_at: string;
}

export type UserBehaviorEventType =
  | "page_view"
  | "click"
  | "scroll"
  | "hover"
  | "form_submit"
  | "form_focus"
  | "form_blur"
  | "search"
  | "download"
  | "video_play"
  | "video_pause"
  | "video_complete"
  | "session_start"
  | "session_end"
  | "navigation"
  | "error"
  | "custom";

export interface EventData {
  // Common properties
  element_type?: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  element_position?: {
    x: number;
    y: number;
  };

  // Page view specific
  page_load_time?: number;
  viewport_size?: {
    width: number;
    height: number;
  };

  // Click specific
  click_coordinates?: {
    x: number;
    y: number;
  };

  // Scroll specific
  scroll_depth?: number;
  scroll_direction?: "up" | "down";
  max_scroll_depth?: number;

  // Form specific
  form_id?: string;
  field_name?: string;
  field_value?: string;
  validation_errors?: string[];

  // Search specific
  search_query?: string;
  search_results_count?: number;

  // Video specific
  video_id?: string;
  video_duration?: number;
  video_current_time?: number;

  // Navigation specific
  from_url?: string;
  to_url?: string;
  navigation_type?: "internal" | "external";

  // Error specific
  error_message?: string;
  error_stack?: string;

  // Custom properties
  [key: string]: any;
}

export interface DeviceInfo {
  screen_resolution: {
    width: number;
    height: number;
  };
  viewport_size: {
    width: number;
    height: number;
  };
  device_type: "desktop" | "tablet" | "mobile";
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  is_touch_device: boolean;
  language: string;
  timezone: string;
}

export interface UserSession {
  id: string;
  user_id?: string;
  start_time: string;
  end_time?: string;
  duration?: number; // in seconds
  page_views: number;
  clicks: number;
  scrolls: number;
  form_interactions: number;
  bounce_rate?: number;
  exit_page?: string;
  entry_page: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_info: DeviceInfo;
  is_returning_visitor: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBehaviorMetrics {
  user_id?: string;
  session_count: number;
  total_page_views: number;
  total_clicks: number;
  average_session_duration: number;
  bounce_rate: number;
  most_visited_pages: Array<{
    url: string;
    visits: number;
  }>;
  most_clicked_elements: Array<{
    element_id: string;
    element_text: string;
    clicks: number;
  }>;
  search_queries: Array<{
    query: string;
    count: number;
  }>;
  conversion_events: Array<{
    event_type: string;
    count: number;
  }>;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface HeatmapData {
  page_url: string;
  viewport_width: number;
  viewport_height: number;
  click_data: Array<{
    x: number;
    y: number;
    count: number;
  }>;
  scroll_data: Array<{
    depth: number;
    percentage: number;
  }>;
  hover_data: Array<{
    x: number;
    y: number;
    duration: number;
  }>;
  generated_at: string;
}

export interface TrackingConfig {
  enabled: boolean;
  track_page_views: boolean;
  track_clicks: boolean;
  track_scrolls: boolean;
  track_forms: boolean;
  track_videos: boolean;
  track_searches: boolean;
  track_errors: boolean;
  sample_rate: number; // 0-1, percentage of events to track
  batch_size: number;
  flush_interval: number; // milliseconds
  storage_type: "memory" | "localStorage" | "sessionStorage";
  endpoint_url?: string;
  api_key?: string;
  exclude_elements?: string[]; // CSS selectors to exclude
  include_pii: boolean; // whether to include personally identifiable information
}

export interface TrackingQueue {
  events: UserBehaviorEvent[];
  max_size: number;
  auto_flush: boolean;
  flush_interval: number;
}

// Utility types for analytics
export interface PageViewData {
  url: string;
  title: string;
  load_time: number;
  referrer?: string;
  utm_params?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface ClickTrackingData {
  element: HTMLElement;
  coordinates: { x: number; y: number };
  timestamp: number;
}

export interface FormTrackingData {
  form_id: string;
  field_name: string;
  action: "focus" | "blur" | "change" | "submit";
  value?: string;
  validation_state?: "valid" | "invalid";
  errors?: string[];
}

export interface ScrollTrackingData {
  depth: number;
  direction: "up" | "down";
  viewport_height: number;
  document_height: number;
  timestamp: number;
}
