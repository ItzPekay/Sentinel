export type Classification = "Non Stroke" | "Warning" | "Stroke"

export interface UserOut {
  user_id: string
  email: string
  name: string
}

export interface EmergencyContact {
  id: string
  user_id: string
  email: string
  name: string | null
  created_at: string
}

export interface PendingTwoFAResponse {
  pending_2fa: boolean
  partial_token: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface AlertPayload {
  trigger_alarm: boolean
  alert_level: string
  message: string
}

export interface SpeechData {
  transcription: string
  overall_slur_score: number
  classification: Classification
}

export interface SpeechAnalysisResponse {
  status: string
  db_record_id: string
  data: SpeechData
  alert: AlertPayload
  alert_sent: boolean
}

export interface CommandResponse {
  status: string
  user_id: string
  raw_audio_heard: string
  matched_intent: string
  frontend_ui_direction: string
  alert_sent: boolean
  alert_skipped_reason: string | null
}

export interface BloodSugarResponse {
  status: string
  patient_id: string
  logged_value: number
  emergency_alert_dispatched: boolean
  medical_assessment: string
}

export interface DetectionItem {
  box: number[]
  confidence: number
  class_id: number
  label: string
}

export interface PredictionResponse {
  label: string
  confidence: number
  detections: DetectionItem[]
  source: "upload" | "live_frame"
  db_record_id: string
  created_at: string
}

export interface StrokeHistoryRecord {
  id: string
  user_id: string
  stroke_event: Record<string, unknown>
  date: string
}

export interface BloodSugarRecord {
  id: string
  user_id: string
  event: string
  blood_sugar_reading: number | null
  critical_alert: boolean
  message: string | null
  date: string
}

export interface VoiceCommandRecord {
  id: string
  user_id: string
  voice_command: string
  date: string
}

export interface SpeechHistoryRecord {
  id: string
  user_id: string
  timestamp: string
  filename: string
  transcribed_text: string
  transcription_discrepancy_score: number
  pacing_score: number
  combined_slur_score: number
  classification: Classification
  alert_triggered: boolean
  alert_level: string
}
