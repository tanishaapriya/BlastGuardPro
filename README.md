# BlastGuard Pro

**Blast-Induced Slope Failure (BISF) Prediction & Monitoring Platform**

A professional full-stack geotechnical engineering tool for mining engineers, geotechnical analysts, and site safety officers. Combines React frontend with a Python ML backend to deliver real-time blast risk predictions with live SVG visualizations.

---

## Tech Stack

| Layer    | Technology                                                |
|----------|-----------------------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts     |
| Forms    | React Hook Form + Zod validation                         |
| State    | React Context API (Auth, Theme, Notifications)            |
| API      | Axios / Fetch, fallback formula engine when offline       |
| Backend  | FastAPI (Python), Uvicorn, scikit-learn, joblib, numpy    |

---

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### Backend

```bash
cd backend
pip install -r requirements.txt
# Optionally place your .pkl model files in backend/models/
uvicorn main:app --reload --port 8000
# API runs at http://localhost:8000
# /health endpoint confirms model status
```

The backend auto-detects `.pkl` model files. If not found, it uses built-in formula-based predictions — the app works fully offline.

---

## Demo Credentials

| Role               | Email                       | Password    |
|--------------------|-----------------------------|-------------|
| Admin              | admin@blastguard.com        | admin123    |
| Mining Engineer    | engineer@blastguard.com     | eng123      |
| Geotechnical Analyst | analyst@blastguard.com    | analyst123  |

---

## Features

### Core Pages

| Page              | Path           | Description                                         |
|-------------------|----------------|-----------------------------------------------------|
| Dashboard         | `/dashboard`   | KPI cards, 4 charts, activity feed, site status map |
| New Prediction    | `/predict`     | 5-step wizard with live SVG blast visualizer        |
| Prediction History| `/history`     | Searchable/filterable table with detail modal        |
| Site Management   | `/sites`       | Grid cards + CRUD + detail page with tabs            |
| Risk Assessment   | `/risk`        | Interactive 5×5 risk matrix + register               |
| Reports & Export  | `/reports`     | Templates, generate modal, scheduled reports         |
| Blast Parameters  | `/parameters`  | Library of saved configurations                      |
| Analytics         | `/analytics`   | 6 chart types, date range presets                    |
| Alerts            | `/alerts`      | Tabbed notifications + threshold settings            |
| Admin Panel       | `/admin`       | User management, audit logs, API keys, settings      |
| Settings          | `/settings`    | Profile, security, notifications, preferences        |

### Visualizers

- **BlastHoleVisualizer** — SVG cross-section that updates live as parameters change. Zones (stemming, charge, energy core, scatter) are driven by model output. Energy waves animate at speeds controlled by risk level.
- **SlopeCrossSectionVisualizer** — SVG slope geometry that reacts to slope angle, height, rock type, and groundwater. Shows failure plane when risk is High/Critical.

### Keyboard Shortcuts

| Shortcut   | Action           |
|------------|------------------|
| Ctrl+N     | New Prediction   |
| Ctrl+H     | Prediction History |
| Ctrl+D     | Dashboard        |
| Esc        | Close modal      |

---

## API

### POST `/api/predict`

**Request body:**
```json
{
  "burden": 2.5, "spacing": 3.0, "hole_depth": 8.0,
  "hole_diameter": 115, "stemming_length": 1.8,
  "total_charge": 45, "max_charge_delay": 25,
  "specific_charge": 0.45, "slope_height": 15,
  "slope_angle": 55, "number_of_rows": 3, "rmr": 60,
  "rqd": 70, "rock_type": "Granite", "groundwater": "Dry",
  "joint_orientation": 45, "joint_spacing": 300,
  "distance_to_structure": 200, "distance_to_slope_crest": 50
}
```

**Response:**
```json
{
  "risk_level": "High",
  "bisf_score": 67.4,
  "ppv": 12.4,
  "air_overpressure": 117.8,
  "probability": 0.674,
  "confidence": 0.72,
  "fragmentation_index": 0.583,
  "failure_mode": "Planar",
  "energy_distribution": { "high_energy_core": 0.45, ... },
  "recommendations": ["..."]
}
```

### GET `/health`

Returns `{ "status": "ok", "models_loaded": true/false, "mode": "ML"/"formula" }`

---

## ML Model Integration

Place your trained `.pkl` files in `backend/models/`:

```
backend/models/
├── bisf_classifier.pkl        # Main risk classifier (predicts bisf_score)
├── ppv_regressor.pkl          # PPV regression model
└── fragmentation_model.pkl    # Fragmentation index regressor
```

**Feature vector order** (19 features):

```
burden, spacing, hole_depth, hole_diameter, stemming_length,
total_charge, max_charge_delay, specific_charge, slope_height,
slope_angle, number_of_rows, rmr, rqd, joint_orientation,
joint_spacing, distance_to_structure, distance_to_slope_crest,
rock_type (int), groundwater (int)
```

---

## Deployment

**Frontend → Vercel:**
```bash
# Set environment variable in Vercel dashboard:
VITE_API_URL=https://your-python-backend.railway.app
```

**Backend → Railway.app or Render.com:**
```bash
# Start command:
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## Project Structure

```
blastguard-pro/
├── frontend/src/
│   ├── components/
│   │   ├── layout/     (Sidebar, Header, Layout, Breadcrumbs)
│   │   ├── ui/         (Button, Card, Badge, Modal, Gauge, ...)
│   │   └── visualizer/ (BlastHoleVisualizer, SlopeCrossSectionVisualizer)
│   ├── pages/          (11 pages + 4 auth pages)
│   ├── context/        (AuthContext, ThemeContext, NotificationContext)
│   ├── hooks/          (useLocalStorage, usePrediction)
│   ├── services/       (predictionAPI.js with fallback)
│   └── utils/          (constants, mockData, validators, formatters)
└── backend/
    ├── main.py         (FastAPI app with ML + formula fallback)
    ├── models/         (place .pkl files here)
    └── requirements.txt
```
