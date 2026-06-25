import type {
  UserOut, EmergencyContact, PendingTwoFAResponse, TokenResponse,
  SpeechAnalysisResponse, CommandResponse, BloodSugarResponse, PredictionResponse,
  BloodSugarRecord, VoiceCommandRecord, SpeechHistoryRecord,
} from "./types"

const BASE = "/api/backend"

function getToken(): string {
  if (typeof document === "undefined") return ""
  const match = document.cookie.match(/(?:^|;\s*)sentinel_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ""
}

async function req<T>(path: string, init: RequestInit = {}, isFormData = false): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(init.headers ?? {}),
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as unknown as T
  }
  return res.json() as Promise<T>
}

export const api = {
  auth: {
    register: (data: { email: string; name: string; password: string }) =>
      req<UserOut>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

    login: (data: { email: string; password: string }) =>
      req<PendingTwoFAResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

    verifyOtp: (data: { partial_token: string; otp_code: string }) =>
      req<TokenResponse>("/auth/verify-otp", { method: "POST", body: JSON.stringify(data) }),

    googleUrl: () => req<{ auth_url: string }>("/auth/google"),

    updateProfile: (data: { name?: string }) =>
      req<UserOut>("/auth/profile", { method: "PATCH", body: JSON.stringify(data) }),

    emergencyContacts: () => req<EmergencyContact[]>("/auth/emergency-contacts"),

    addEmergencyContact: (data: { email: string; name?: string }) =>
      req<EmergencyContact>("/auth/emergency-contacts", { method: "POST", body: JSON.stringify(data) }),

    removeEmergencyContact: (contactId: string) =>
      req<void>(`/auth/emergency-contacts/${contactId}`, { method: "DELETE" }),
  },

  speech: {
    analyze: async (blob: Blob, filename: string): Promise<SpeechAnalysisResponse> => {
      const fd = new FormData()
      fd.append("file", blob, filename)
      return req<SpeechAnalysisResponse>("/speech/analyze", { method: "POST", body: fd }, true)
    },

    command: async (blob: Blob, filename: string): Promise<CommandResponse> => {
      const fd = new FormData()
      fd.append("file", blob, filename)
      return req<CommandResponse>("/speech/command", { method: "POST", body: fd }, true)
    },

    submitBloodSugar: (glucose: number): Promise<BloodSugarResponse> => {
      const fd = new FormData()
      fd.append("glucose_value", String(glucose))
      return req<BloodSugarResponse>("/speech/submit-blood-sugar", { method: "POST", body: fd }, true)
    },
  },

  predict: {
    run: async (blob?: Blob): Promise<PredictionResponse> => {
      if (blob) {
        const fd = new FormData()
        fd.append("file", blob, "snapshot.jpg")
        return req<PredictionResponse>("/predict/", { method: "POST", body: fd }, true)
      }
      return req<PredictionResponse>("/predict/", { method: "POST" })
    },
  },

  history: {
    speech: () => req<SpeechHistoryRecord[]>("/usage_history/speech_history"),
    bloodSugar: () => req<BloodSugarRecord[]>("/usage_history/blood_sugar_history"),
    voiceCommands: () => req<VoiceCommandRecord[]>("/usage_history/voice_command_history"),
  },
}
