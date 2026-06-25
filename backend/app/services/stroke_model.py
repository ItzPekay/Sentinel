import io
import numpy as np
from PIL import Image
from ultralytics import YOLO

from app.services.config_service import logger


class StrokeModel:
    def __init__(self, model_path: str):
        logger.info(f"[StrokeModel] Loading YOLO model from {model_path}")
        self.model = YOLO(model_path)
        logger.info("[StrokeModel] YOLO model loaded")

    def predict(self, image_bytes: bytes) -> dict:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results = self.model(np.array(image), verbose=False)

        detections = []
        top_confidence = 0.0
        top_label = "no_detection"

        for result in results:
            for box in result.boxes:
                conf = float(box.conf[0])
                class_id = int(box.cls[0])
                label = result.names[class_id]
                detections.append({
                    "box": box.xyxy[0].tolist(),
                    "confidence": conf,
                    "class_id": class_id,
                    "label": label,
                })
                if conf > top_confidence:
                    top_confidence = conf
                    top_label = label

        return {"label": top_label, "confidence": top_confidence, "detections": detections}
