import numpy as np
import librosa
from datetime import datetime, timezone
from scipy.signal import find_peaks
from faster_whisper import WhisperModel

from app.services import config_service


class SpeechService:
    def __init__(self):
        self.model = WhisperModel("base", device="cpu", compute_type="int8")

    def transcribe_audio(self, file_path: str) -> str:
        segments, _ = self.model.transcribe(file_path)
        return " ".join(s.text for s in segments).strip().lower()

    def clean_text(self, text: str) -> str:
        return text.lower().strip().replace(".", "").replace(",", "")

    def analyze_transcription(self, audio_path: str) -> tuple[float, str]:
        transcribed_text = self.transcribe_audio(audio_path)
        expected_words = config_service.STANDARD_PHRASE.split()
        heard_words = transcribed_text.split()

        matched = 0
        for i, expected_word in enumerate(expected_words):
            if i < len(heard_words):
                heard_word = heard_words[i]
                if expected_word in heard_word or heard_word in expected_word:
                    matched += 1

        match_pct = 0.0 if not expected_words else (matched / len(expected_words)) * 100.0
        return float(100.0 - match_pct), transcribed_text

    def analyze_audio_features(self, audio_path: str) -> float:
        audio, sr = librosa.load(audio_path, sr=16000)
        hop_length = 512
        energy = librosa.feature.rms(y=audio, hop_length=hop_length)[0]
        peaks, _ = find_peaks(energy, height=np.mean(energy), distance=5)
        duration = len(audio) / sr
        syllables_per_second = len(peaks) / duration if duration > 0 else 0

        if syllables_per_second < 2.0:
            return 80.0
        if syllables_per_second < 3.0:
            return 40.0
        return 10.0

    def evaluate_risk_and_alerts(self, transcription_score: float, audio_score: float) -> tuple[str, float, dict]:
        final_score = (transcription_score + audio_score) / 2.0
        alert_payload = {
            "trigger_alarm": False,
            "alert_level": "GREEN",
            "message": "Speech parameters are healthy",
        }

        if final_score >= config_service.RED_THRESHOLD:
            classification = "Stroke"
            alert_payload["trigger_alarm"] = True
            alert_payload["alert_level"] = "RED"
            alert_payload["message"] = "CRITICAL ALERT: Severe slurring and problems found!"
        elif final_score >= config_service.YELLOW_THRESHOLD:
            classification = "Warning"
            alert_payload["trigger_alarm"] = True
            alert_payload["alert_level"] = "YELLOW"
            alert_payload["message"] = "WARNING: Noticeable problems in speech"
        else:
            classification = "Non Stroke"

        return classification, float(final_score), alert_payload

    def detect_command(self, cleaned_text: str) -> dict:
        if any(p in cleaned_text for p in ["guardian", "call guardian", "contact guardian", "contact family", "emergency"]):
            return {"intent": "contact_guardian", "message": "Phrase matched. Starting emergency communications."}
        return {"intent": "unknown", "message": "Command not recognized, please repeat your command based on the prompt"}

    def save_to_history(
        self,
        filename: str,
        text: str,
        t_score: float,
        a_score: float,
        final_score: float,
        classification: str,
        alert_payload: dict,
        user_id: str | None = None,
    ) -> str:
        from app.services import database_service
        return database_service.save_speech_history({
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "filename": str(filename),
            "transcribed_text": str(text),
            "transcription_discrepancy_score": float(t_score),
            "pacing_score": float(a_score),
            "combined_slur_score": float(final_score),
            "classification": str(classification),
            "alert_triggered": bool(alert_payload["trigger_alarm"]),
            "alert_level": str(alert_payload["alert_level"]),
        })
