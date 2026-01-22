export type User = {
  id: number;
  first_name: string;
  last_name: string;
  name?: string;
  email: string;
  phone?: string;
  sexe?: 'homme' | 'femme'; // Nouveau : sexe obligatoire
  role: 'user' | 'admin' | 'superadmin' | 'therapy' | 'donation' | 'client';
  roles?: string[]; // Rôles depuis la table roles (many-to-many)
  email_verified_at?: string;
  avatar?: string;
  bio?: string;
  specialization?: string;
};

export type RegisterData = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  sexe: 'homme' | 'femme'; // Nouveau : obligatoire
  password: string;
  password_confirmation: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  user: User;
  token: string;
};

// ===== STRUCTURE V2 =====

// TherapySlot
export type TherapySlot = {
  id: number;
  therapy_user_id: number;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  max_clients: number;
  booked_count: number;
  statut: 'available' | 'full' | 'cancelled';
  location?: string;
  price?: string;
  notes?: string;
  sexe_therapeute?: 'homme' | 'femme'; // Nouveau
  hijama_type?: string; // Nouveau
  therapist?: User;
  created_at: string;
  updated_at: string;
};

// AppointmentPerson
export type AppointmentPerson = {
  id: number;
  appointment_id: number;
  prenom: string;
  sexe: 'homme' | 'femme';
  ordre: number;
  created_at: string;
  updated_at: string;
};

// Appointment V2
export type Appointment = {
  id: number;
  slot_id: number;
  therapy_user_id: number;
  client_user_id: number;
  total_personnes?: number; // Nouveau
  statut: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  montant_acompte: string;
  payment_intent_id?: string;
  payment_method?: string;
  client_notes?: string;
  therapist_notes?: string;
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  slot?: TherapySlot;
  therapist?: User;
  client?: User;
  payment?: Payment;
  persons?: AppointmentPerson[]; // Nouveau
};

// TherapistProfile
export type TherapistProfile = {
  id: number;
  user_id: number;
  sexe: 'homme' | 'femme';
  hijama_types: string[];
  autres_types?: string;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: number;
  appointment_id: number;
  payment_intent_id: string;
  amount: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
};

// DonationProject
export type DonationProject = {
  id: number;
  donation_user_id: number;
  type: 'puit' | 'arbre' | 'mosquee' | 'ecole' | 'orphelinat' | 'eau' | 'nourriture' | 'autre';
  pays: string;
  nom: string;
  description?: string;
  image?: string;
  montant_requis: string;
  montant_collecte: string;
  statut: 'draft' | 'active' | 'completed' | 'cancelled';
  progress_percentage: number | string; // Peut être string depuis l'API
  is_featured: boolean;
  start_date?: string;
  end_date?: string;
  beneficiaries_count?: number;
  donation_user?: User;
  created_at: string;
  updated_at: string;
};

// DonationContribution (remplace Donation)
export type DonationContribution = {
  id: number;
  project_id: number;
  client_user_id: number;
  montant: string;
  nom_sadaqa?: string;
  statut: 'pending' | 'succeeded' | 'failed';
  payment_intent_id?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  project?: DonationProject;
  client?: User;
};

// Types pour création
export type AppointmentPersonData = {
  prenom: string;
  sexe: 'homme' | 'femme';
};

export type CreateAppointmentData = {
  slot_id: number;
  persons: AppointmentPersonData[]; // Nouveau : obligatoire
  client_notes?: string;
};

export type CreateContributionData = {
  project_id: number;
  montant: number;
  nom_sadaqa?: string;
};

// Anciens types (pour compatibilité)
export type CreateDonationData = CreateContributionData;

// Alias pour compatibilité
export type Donation = DonationContribution;

// DonationDocument
export type DonationDocument = {
  id: number;
  project_id: number;
  uploaded_by: number;
  title: string;
  description?: string;
  file_path: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  file_url?: string;
  formatted_file_size?: string;
  created_at: string;
  updated_at: string;
  project?: DonationProject;
  uploadedBy?: User;
};

// AvailabilitySlot (ancien système - gardé pour compatibilité admin)
export type AvailabilitySlot = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  gender: 'homme' | 'femme';
  is_available: boolean;
  max_appointments: number;
  current_appointments: number;
  created_at: string;
  updated_at: string;
};

export type CreateAvailabilitySlotData = {
  date: string;
  start_time: string;
  end_time: string;
  gender: 'homme' | 'femme';
  max_appointments?: number;
};
