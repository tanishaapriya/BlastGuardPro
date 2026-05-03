import { SITES, RISK_COLORS } from './constants';
import { subDays, subHours, format } from 'date-fns';

const rng = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const RISK_DIST = ['Low','Low','Low','Medium','Medium','Medium','Medium','High','High','Critical'];

function makePrediction(i) {
  const site = pick(SITES);
  const riskLevel = pick(RISK_DIST);
  const bisfScore = riskLevel === 'Low' ? rng(5,24) : riskLevel === 'Medium' ? rng(25,49) :
                    riskLevel === 'High' ? rng(50,74) : rng(75,98);
  const ts = subHours(new Date(), i * 14 + Math.random() * 8);
  return {
    id: `pred_${ts.getTime()}`,
    timestamp: ts.toISOString(),
    site: site.name,
    siteId: site.id,
    blast_type: pick(['Surface Blast','Quarry Blast','Underground Blast']),
    inputs: {
      burden: parseFloat(rng(1.5,4).toFixed(1)),
      spacing: parseFloat(rng(1.5,5).toFixed(1)),
      hole_depth: parseFloat(rng(4,18).toFixed(1)),
      hole_diameter: Math.round(rng(75,250)),
      stemming_length: parseFloat(rng(0.8,4).toFixed(1)),
      total_charge: parseFloat(rng(20,120).toFixed(1)),
      max_charge_delay: parseFloat(rng(10,80).toFixed(1)),
      specific_charge: parseFloat(rng(0.15,1.2).toFixed(2)),
      slope_height: parseFloat(rng(8,40).toFixed(1)),
      slope_angle: Math.round(rng(25,80)),
      number_of_rows: Math.round(rng(1,6)),
      rmr: Math.round(rng(20,90)),
      rqd: Math.round(rng(30,95)),
      rock_type: site.rockType,
      groundwater: pick(['Dry','Damp','Wet','Flooded']),
      joint_orientation: Math.round(rng(10,80)),
      joint_spacing: Math.round(rng(50,500)),
      distance_to_structure: Math.round(rng(50,500)),
      distance_to_slope_crest: Math.round(rng(20,200)),
    },
    outputs: {
      risk_level: riskLevel,
      bisf_score: parseFloat(bisfScore.toFixed(2)),
      ppv: parseFloat(rng(2,45).toFixed(2)),
      air_overpressure: parseFloat(rng(50,200).toFixed(2)),
      probability: parseFloat((bisfScore/100).toFixed(3)),
      confidence: parseFloat(rng(0.65,0.95).toFixed(3)),
      fragmentation_index: parseFloat(rng(0.2,0.9).toFixed(3)),
      failure_mode: pick(['Planar','Wedge','Toppling','Circular']),
      energy_distribution: { high_energy_core:0.45, primary_fragmentation:0.30, secondary_scatter:0.20, stemming_loss:0.05 },
      recommendations: riskLevel === 'Low'
        ? ['Parameters within acceptable safety limits','Proceed with standard monitoring protocols']
        : ['Reduce maximum charge per delay below 20kg','Increase stemming length by at least 20%','Conduct pre-blast survey of slope face'],
    },
  };
}

export const MOCK_PREDICTIONS = Array.from({ length: 50 }, (_, i) => makePrediction(i));

export const MOCK_ALERTS = [
  { id:'a1', type:'critical', title:'PPV Threshold Exceeded',      desc:'PPV of 48.2 mm/s recorded at Rajasthan Quarry Site A, exceeding limit of 25 mm/s.', site:'Rajasthan Quarry Site A', ts: subHours(new Date(),2).toISOString(),  read:false },
  { id:'a2', type:'high',     title:'BISF Score Alert',            desc:'BISF score of 78.4 classified as Critical at Karnataka Iron Mine Block 3.',         site:'Karnataka Iron Mine Block 3', ts: subHours(new Date(),5).toISOString(),  read:false },
  { id:'a3', type:'info',     title:'Prediction Complete',         desc:'New prediction run completed for Jharkhand Coal Block 7. Risk level: Medium.',        site:'Jharkhand Coal Block 7',      ts: subHours(new Date(),8).toISOString(),  read:false },
  { id:'a4', type:'warning',  title:'Groundwater Level Rising',    desc:'Wet conditions detected at Odisha Limestone Quarry. Review blast plan.',             site:'Odisha Limestone Quarry',     ts: subHours(new Date(),12).toISOString(), read:true  },
  { id:'a5', type:'info',     title:'Report Generated',            desc:'Monthly safety report for Chhattisgarh Copper Mine has been generated.',             site:'Chhattisgarh Copper Mine',    ts: subHours(new Date(),18).toISOString(), read:true  },
  { id:'a6', type:'critical', title:'Slope Instability Warning',   desc:'Slope angle of 82° at Karnataka Iron Mine Block 3 exceeds safe limits.',            site:'Karnataka Iron Mine Block 3', ts: subHours(new Date(),24).toISOString(), read:true  },
  { id:'a7', type:'system',   title:'System Update',               desc:'BlastGuard Pro model v2.4 deployed. Prediction accuracy improved by 3.2%.',          site:'System',                      ts: subHours(new Date(),36).toISOString(), read:true  },
  { id:'a8', type:'info',     title:'New User Registered',         desc:'Safety Officer joined Rajasthan Mines Ltd.',                                          site:'System',                      ts: subHours(new Date(),48).toISOString(), read:true  },
];

export const MOCK_ANALYTICS = Array.from({ length: 30 }, (_, i) => {
  const d = subDays(new Date(), 29 - i);
  return {
    date: format(d, 'MMM dd'),
    low: Math.round(rng(2,8)),
    medium: Math.round(rng(3,10)),
    high: Math.round(rng(1,6)),
    critical: Math.round(rng(0,3)),
    avgBisf: parseFloat(rng(30,65).toFixed(1)),
    accuracy: parseFloat(rng(82,96).toFixed(1)),
    blasts: Math.round(rng(5,20)),
  };
});

export const MOCK_AUDIT_LOGS = [
  { id:'log1', ts: subHours(new Date(),1).toISOString(),  user:'Admin User',    action:'Generated monthly report', ip:'192.168.1.10', status:'Success' },
  { id:'log2', ts: subHours(new Date(),3).toISOString(),  user:'Rajan Mehta',   action:'Run prediction',           ip:'192.168.1.22', status:'Success' },
  { id:'log3', ts: subHours(new Date(),6).toISOString(),  user:'Priya Sharma',  action:'Updated site parameters',  ip:'192.168.1.31', status:'Success' },
  { id:'log4', ts: subHours(new Date(),12).toISOString(), user:'Rajan Mehta',   action:'Exported CSV report',      ip:'192.168.1.22', status:'Success' },
  { id:'log5', ts: subHours(new Date(),18).toISOString(), user:'Admin User',    action:'Invited new user',         ip:'192.168.1.10', status:'Success' },
  { id:'log6', ts: subHours(new Date(),24).toISOString(), user:'Unknown',       action:'Failed login attempt',     ip:'45.33.32.156', status:'Failed'  },
  { id:'log7', ts: subHours(new Date(),30).toISOString(), user:'Priya Sharma',  action:'Deleted prediction',       ip:'192.168.1.31', status:'Success' },
  { id:'log8', ts: subHours(new Date(),36).toISOString(), user:'Admin User',    action:'System settings updated',  ip:'192.168.1.10', status:'Success' },
];

export const MOCK_BLAST_PARAMS = [
  { id:'bp1', name:'Standard Granite Blast',    rockType:'Granite',   blastType:'Surface Blast',    maxCharge:25, burden:2.5, spacing:3.0, createdBy:'Rajan Mehta',  lastUsed: subDays(new Date(),2).toISOString()  },
  { id:'bp2', name:'Deep Underground Config',   rockType:'Basalt',    blastType:'Underground Blast',maxCharge:15, burden:1.8, spacing:2.2, createdBy:'Priya Sharma', lastUsed: subDays(new Date(),5).toISOString()  },
  { id:'bp3', name:'Coal Mine Soft Blast',      rockType:'Coal',      blastType:'Surface Blast',    maxCharge:10, burden:2.0, spacing:2.5, createdBy:'Rajan Mehta',  lastUsed: subDays(new Date(),8).toISOString()  },
  { id:'bp4', name:'Limestone Quarry Standard', rockType:'Limestone', blastType:'Quarry Blast',     maxCharge:30, burden:3.0, spacing:3.5, createdBy:'Admin User',   lastUsed: subDays(new Date(),10).toISOString() },
  { id:'bp5', name:'Construction Pre-Split',    rockType:'Sandstone', blastType:'Construction Blast',maxCharge:8, burden:1.2, spacing:1.5, createdBy:'Priya Sharma', lastUsed: subDays(new Date(),15).toISOString() },
];
