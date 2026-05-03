import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(3, 'Password too short'),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name required'),
  org: z.string().min(2, 'Organization required'),
  role: z.string().min(1, 'Role required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  terms: z.literal(true, { errorMap: () => ({ message: 'You must accept terms' }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const passwordStrength = (pw = '') => {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', '#EF4444', '#F59E0B', '#10B981', '#10B981'];
  return { score, label: labels[score], color: colors[score] };
};

export const step1Schema = z.object({
  site_name: z.string().min(1, 'Site name required'),
  site_location: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  blast_date: z.string().optional(),
  blast_type: z.string().min(1, 'Blast type required'),
  engineer: z.string().optional(),
});

export const step2Schema = z.object({
  max_charge_delay: z.coerce.number().positive(),
  total_charge: z.coerce.number().positive(),
  hole_depth: z.coerce.number().min(3).max(20),
  hole_diameter: z.coerce.number().min(50).max(300),
  burden: z.coerce.number().min(1).max(5),
  spacing: z.coerce.number().min(1).max(6),
  stemming_length: z.coerce.number().min(0.5).max(5),
  number_of_rows: z.coerce.number().int().positive(),
  specific_charge: z.coerce.number().min(0.1).max(1.5),
  delay_interval: z.coerce.number().optional(),
  detonation_type: z.string().optional(),
});

export const step3Schema = z.object({
  rock_type: z.string().min(1),
  rmr: z.coerce.number().min(0).max(100),
  rqd: z.coerce.number().min(0).max(100),
  joint_spacing: z.coerce.number().positive(),
  joint_orientation: z.coerce.number().min(0).max(90),
  slope_angle: z.coerce.number().min(0).max(90),
  slope_height: z.coerce.number().positive(),
  groundwater: z.string().min(1),
  number_of_rows: z.coerce.number().int().positive().optional(),
});

export const step4Schema = z.object({
  distance_to_structure: z.coerce.number().positive(),
  distance_to_slope_crest: z.coerce.number().positive(),
  vibration_limit: z.coerce.number().positive().optional(),
  air_blast_limit: z.coerce.number().positive().optional(),
  soil_type: z.string().optional(),
  vegetation: z.string().optional(),
});
