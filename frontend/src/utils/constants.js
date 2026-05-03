export const MOCK_USERS = [
  { id: 'u1', name: 'Admin User', email: 'admin@blastguard.com', password: 'admin123', role: 'Admin', org: 'BlastGuard Corp' },
  { id: 'u2', name: 'Rajan Mehta', email: 'engineer@blastguard.com', password: 'eng123', role: 'Mining Engineer', org: 'Rajasthan Mines Ltd' },
  { id: 'u3', name: 'Priya Sharma', email: 'analyst@blastguard.com', password: 'analyst123', role: 'Geotechnical Analyst', org: 'GeoTech India' },
];

export const ROLES = ['Mining Engineer', 'Geotechnical Analyst', 'Safety Officer', 'Researcher', 'Admin'];
export const BLAST_TYPES = ['Surface Blast', 'Underground Blast', 'Quarry Blast', 'Construction Blast'];
export const ROCK_TYPES = ['Granite', 'Limestone', 'Sandstone', 'Basalt', 'Shale', 'Coal', 'Mixed'];
export const GROUNDWATER = ['Dry', 'Damp', 'Wet', 'Flooded'];
export const SOIL_TYPES = ['Hard Rock', 'Soft Rock', 'Dense Soil', 'Loose Soil'];
export const VEGETATION = ['None', 'Sparse', 'Moderate', 'Dense'];
export const DETONATION_TYPES = ['Electronic', 'Shock Tube', 'Electric'];

export const RISK_COLORS = {
  Low:      { border: '#10B981', glow: 'rgba(16,185,129,0.3)',  bg: 'rgba(16,185,129,0.15)',  text: '#10B981' },
  Medium:   { border: '#F59E0B', glow: 'rgba(245,158,11,0.3)',  bg: 'rgba(245,158,11,0.15)',  text: '#F59E0B' },
  High:     { border: '#FB923C', glow: 'rgba(251,146,60,0.3)',  bg: 'rgba(251,146,60,0.15)',  text: '#FB923C' },
  Critical: { border: '#EF4444', glow: 'rgba(239,68,68,0.5)',   bg: 'rgba(239,68,68,0.15)',   text: '#EF4444' },
};

export const WAVE_SPEED = { Low: '2s', Medium: '1.5s', High: '1s', Critical: '0.5s' };

export const SITES = [
  { id: 's1', name: 'Rajasthan Quarry Site A',      location: 'Rajasthan, India',    lat: 26.9124, lng: 75.7873, rockType: 'Granite',   slopeAngle: 55, status: 'Active' },
  { id: 's2', name: 'Karnataka Iron Mine Block 3',  location: 'Karnataka, India',    lat: 15.3173, lng: 75.7139, rockType: 'Basalt',    slopeAngle: 62, status: 'Active' },
  { id: 's3', name: 'Jharkhand Coal Block 7',       location: 'Jharkhand, India',    lat: 23.6102, lng: 85.2799, rockType: 'Coal',      slopeAngle: 38, status: 'Monitoring' },
  { id: 's4', name: 'Odisha Limestone Quarry',      location: 'Odisha, India',       lat: 20.9517, lng: 85.0985, rockType: 'Limestone', slopeAngle: 45, status: 'Active' },
  { id: 's5', name: 'Chhattisgarh Copper Mine',     location: 'Chhattisgarh, India', lat: 21.2787, lng: 81.8661, rockType: 'Sandstone', slopeAngle: 50, status: 'Inactive' },
];

export const LS_AUTH_KEY = 'bisf_auth_user';
export const LS_PREDICTIONS_KEY = 'bisf_predictions';

export const NAV_ITEMS = [
  { path: '/dashboard',   label: 'Dashboard',           icon: 'LayoutDashboard' },
  { path: '/predict',     label: 'New Prediction',       icon: 'Zap' },
  { path: '/history',     label: 'Prediction History',   icon: 'Clock' },
  { path: '/sites',       label: 'Site Management',      icon: 'MapPin' },
  { path: '/risk',        label: 'Risk Assessment',      icon: 'AlertTriangle' },
  { path: '/reports',     label: 'Reports & Export',     icon: 'FileText' },
  { path: '/parameters',  label: 'Blast Parameters',     icon: 'Settings2' },
  { path: '/analytics',   label: 'Analytics',            icon: 'BarChart2' },
  { path: '/alerts',      label: 'Alerts',               icon: 'Bell' },
  { path: '/admin',       label: 'Admin Panel',          icon: 'Shield',  adminOnly: true },
  { path: '/settings',    label: 'Settings',             icon: 'Settings' },
];
