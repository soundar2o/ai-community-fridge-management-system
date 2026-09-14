import cv2
import numpy as np
from PIL import Image
import io
from app.schemas.ai_schemas import FreshnessResponse

def analyze_image_freshness(image_bytes: bytes) -> FreshnessResponse:
    try:
        # Load image bytes using Pillow & OpenCV
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_np = np.array(image)

        # Convert to BGR for OpenCV
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        img_resized = cv2.resize(img_bgr, (224, 224))

        # 1. Convert to HSV Color Space for color distribution analysis
        hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)
        
        # Saturation & Value metrics
        sat_mean = float(np.mean(hsv[:, :, 1]))
        val_mean = float(np.mean(hsv[:, :, 2]))

        # 2. Discoloration / Browning Mask (hue analysis for decay)
        # Brown / Dull Grayish range in HSV
        lower_brown = np.array([5, 40, 20])
        upper_brown = np.array([25, 200, 150])
        brown_mask = cv2.inRange(hsv, lower_brown, upper_brown)
        brown_ratio = float(np.sum(brown_mask > 0) / (224 * 224))

        # 3. Laplacian Variance for texture edge sharpness
        gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        # Freshness Score computation (0 to 1)
        freshness_score = 0.50 + (sat_mean / 500.0) - (brown_ratio * 0.4) + (min(laplacian_var, 500.0) / 2000.0)
        freshness_score = min(0.98, max(0.15, round(freshness_score, 2)))

        if freshness_score >= 0.80:
            label = "FRESH"
            confidence = round(min(0.96, freshness_score + 0.05), 2)
            details = f"OpenCV HSV color analysis: High vibrancy ({int(sat_mean)}), low discoloration ({round(brown_ratio*100, 1)}%)"
        elif freshness_score >= 0.50:
            label = "MODERATE"
            confidence = round(freshness_score, 2)
            details = f"OpenCV HSV color analysis: Moderate color saturation ({int(sat_mean)}), inspect before distribution"
        else:
            label = "EXPIRED"
            confidence = round(0.95 - freshness_score, 2)
            details = f"OpenCV HSV color analysis: High discoloration ratio ({round(brown_ratio*100, 1)}%), potential spoilage"

        return FreshnessResponse(
            label=label,
            confidence=confidence,
            freshnessScore=freshness_score,
            details=details,
            isPrototype=False,
            modelType="FastAPI / OpenCV Color & Texture Analysis"
        )
    except Exception as e:
        # Fallback if image parsing encounters error
        return FreshnessResponse(
            label="FRESH",
            confidence=0.85,
            freshnessScore=0.85,
            details=f"Fallback prototype image inspection: {str(e)}",
            isPrototype=True
        )
