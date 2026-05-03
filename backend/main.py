from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import os

app = FastAPI(title="BlastGuard Pro API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Try to load trained models, fall back to formula-based prediction
bisf_model = ppv_model = fragmentation_model = None
try:
    import joblib
    bisf_model = joblib.load('models/bisf_classifier.pkl')
    ppv_model = joblib.load('models/ppv_regressor.pkl')
    fragmentation_model = joblib.load('models/fragmentation_model.pkl')
    print("✅ ML models loaded successfully")
except Exception as e:
    print(f"⚠️  Models not found, using formula-based predictions: {e}")


class BlastInput(BaseModel):
    burden: float
    spacing: float
    hole_depth: float
    hole_diameter: float
    stemming_length: float
    total_charge: float
    max_charge_delay: float
    specific_charge: float
    slope_height: float
    slope_angle: float
    number_of_rows: int
    rmr: float
    rqd: float = 70.0
    rock_type: str = "Granite"
    groundwater: str = "Dry"
    joint_orientation: float = 45.0
    joint_spacing: float = 300.0
    distance_to_structure: float = 200.0
    distance_to_slope_crest: float = 50.0


ROCK_TYPE_MAP = {
    "Granite": 0, "Limestone": 1, "Sandstone": 2,
    "Basalt": 3, "Shale": 4, "Coal": 5, "Mixed": 6,
}
GROUNDWATER_MAP = {"Dry": 0, "Damp": 1, "Wet": 2, "Flooded": 3}


def formula_bisf(data: BlastInput) -> float:
    slope_risk = data.slope_angle / 90.0
    charge_risk = min(1.0, data.max_charge_delay / 100.0)
    rmr_protection = (100 - data.rmr) / 100.0
    gw_risk = {0: 0, 1: 0.1, 2: 0.25, 3: 0.4}.get(GROUNDWATER_MAP.get(data.groundwater, 0), 0)
    joint_risk = abs(data.slope_angle - data.joint_orientation) / 90.0
    stemming_ratio = data.stemming_length / max(data.hole_depth, 1)
    score = (slope_risk * 25 + charge_risk * 20 + rmr_protection * 20 +
             gw_risk * 15 + joint_risk * 10 + (1 - stemming_ratio) * 10)
    return max(2.0, min(98.0, score))


def formula_ppv(data: BlastInput) -> float:
    k, n = 1140.0, 1.6
    sd = data.distance_to_structure / (data.max_charge_delay ** 0.5)
    return min(200.0, max(0.1, k * (sd ** -n)))


def formula_fragmentation(data: BlastInput) -> float:
    charge_factor = min(1.0, data.specific_charge / 1.0)
    rmr_factor = 1 - data.rmr / 100.0
    return max(0.1, min(0.95, charge_factor * 0.5 + rmr_factor * 0.3 + 0.2))


@app.post("/api/predict")
async def predict(data: BlastInput):
    features = np.array([[
        data.burden, data.spacing, data.hole_depth,
        data.hole_diameter, data.stemming_length,
        data.total_charge, data.max_charge_delay,
        data.specific_charge, data.slope_height,
        data.slope_angle, data.number_of_rows,
        data.rmr, data.rqd, data.joint_orientation,
        data.joint_spacing, data.distance_to_structure,
        data.distance_to_slope_crest,
        ROCK_TYPE_MAP.get(data.rock_type, 0),
        GROUNDWATER_MAP.get(data.groundwater, 0),
    ]])

    if bisf_model:
        bisf_score = float(bisf_model.predict(features)[0])
        ppv = float(ppv_model.predict(features)[0])
        fragmentation_index = float(fragmentation_model.predict(features)[0])
        try:
            probability = float(bisf_model.predict_proba(features)[0][1])
            confidence = float(bisf_model.predict_proba(features).max())
        except Exception:
            probability = bisf_score / 100
            confidence = 0.80
    else:
        bisf_score = formula_bisf(data)
        ppv = formula_ppv(data)
        fragmentation_index = formula_fragmentation(data)
        probability = bisf_score / 100.0
        confidence = 0.72

    bisf_score = max(0, min(100, bisf_score))

    if bisf_score < 25:   risk_level = "Low"
    elif bisf_score < 50: risk_level = "Medium"
    elif bisf_score < 75: risk_level = "High"
    else:                 risk_level = "Critical"

    charge_ratio = data.stemming_length / max(data.hole_depth, 1)
    energy_distribution = {
        "high_energy_core":      round(max(0.1, 0.5 - charge_ratio * 0.2), 2),
        "primary_fragmentation": round(min(0.5, 0.3 + bisf_score / 500), 2),
        "secondary_scatter":     round(min(0.4, 0.15 + fragmentation_index * 0.1), 2),
        "stemming_loss":         round(max(0.01, charge_ratio * 0.15), 2),
    }

    diff = abs(data.slope_angle - data.joint_orientation)
    if diff < 15:              failure_mode = "Planar"
    elif diff < 30:            failure_mode = "Wedge"
    elif data.slope_angle > 70: failure_mode = "Toppling"
    else:                       failure_mode = "Circular"

    recommendations = []
    if risk_level in ("High", "Critical"):
        recommendations.append("Reduce maximum charge per delay below 20 kg")
        recommendations.append("Increase stemming length by at least 20%")
        recommendations.append("Conduct pre-blast survey of slope face")
    if data.slope_angle > 60:
        recommendations.append("Consider pre-split blasting to protect slope face")
    if data.rmr < 40:
        recommendations.append("Install slope monitoring instruments before blasting")
    if data.groundwater in ("Wet", "Flooded"):
        recommendations.append("Use water-resistant explosives and dewater the hole")
    if data.distance_to_structure < 100:
        recommendations.append("Implement blast mats and vibration monitoring at nearby structures")
    if not recommendations:
        recommendations.append("Parameters within acceptable safety limits")
        recommendations.append("Proceed with standard monitoring protocols")

    return {
        "risk_level":          risk_level,
        "bisf_score":          round(bisf_score, 2),
        "ppv":                 round(ppv, 2),
        "air_overpressure":    round(ppv * 9.5, 2),
        "probability":         round(probability, 3),
        "confidence":          round(confidence, 3),
        "fragmentation_index": round(fragmentation_index, 3),
        "failure_mode":        failure_mode,
        "energy_distribution": energy_distribution,
        "recommendations":     recommendations,
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "models_loaded": bisf_model is not None,
        "mode": "ML" if bisf_model else "formula",
    }
