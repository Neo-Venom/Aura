export type Role = 'user' | 'assistant';
export type InputMode = 'text' | 'voice';
export type Band = 'low' | 'mild' | 'moderate' | 'high';
export type SafetyLevel = 'none' | 'low' | 'medium' | 'high' | 'imminent';

export interface Profile {
  id: string; email: string; display_name: string | null; country_code: string | null;
  consent_given: boolean; assessment_status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  accent: 'apricot' | 'sage' | 'lavender' | 'butter' | 'sky';
  theme_mode: 'light' | 'night' | 'system'; text_size: 'sm' | 'md' | 'lg';
  auto_send_voice: boolean; created_at: string;
  // NOTE: addition beyond the original contract; BCP-47 tag for voice input, null = browser default.
  stt_language?: string | null;
}
export interface QuestionItem {
  id: string; text: string; scale: 'frequency_week' | 'frequency_2wk'; section: 'main' | 'extra' | 'safety';
}
export interface Questionnaire {
  instrument_version: string;
  scales: Record<string, { value: number; label: string; short_label: string }[]>;
  items: QuestionItem[];
}
export interface AnswerInput { item_id: string; value: number | null }
export interface DimensionResult { key: 'stress'|'anxiety'|'low_mood'|'anger'|'tiredness'|'grief'|'sadness'|'brightness'; score_pct: number; band: Band }
export interface AssessmentResult {
  id: string; created_at: string; dimensions: DimensionResult[]; show_support_card: boolean;
}
export interface ChatSession { id: string; title: string; last_message_at: string; created_at: string }
export interface ChatMessage { id: string; session_id: string; role: Role; content: string; input_mode: InputMode; safety_level: SafetyLevel; created_at: string }
export interface CrisisResource {
  id: string; country_code: string; name: string; description: string;
  phone: string | null; sms: string | null; url: string | null; hours: string; is_emergency: boolean;
}
export type StreamEvent =
  | { type: 'meta'; user_message_id: string; assistant_message_id: string }
  | { type: 'token'; delta: string }
  | { type: 'safety'; level: SafetyLevel; show_crisis_card: boolean }
  | { type: 'title'; title: string }
  | { type: 'done'; finish_reason: 'stop' | 'length' | 'stopped' }
  | { type: 'error'; code: 'rate_limited' | 'daily_limit_reached' | 'llm_unavailable' | 'internal'; message: string };
