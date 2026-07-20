import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper types for database tables
export interface DatabaseRoom {
  id: string;
  room_number: string;
  type: 'single' | 'double' | 'suite';
  price_per_night: number;
  capacity: number;
  amenities: string[];
  status: 'available' | 'reserved' | 'occupied' | 'maintenance';
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseService {
  id: string;
  name: string;
  category: 'swimming-pool' | 'videoke' | 'cottages' | 'foods';
  description: string;
  price: number;
  capacity: number | null;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBooking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  booking_type: 'room' | 'event';
  room_id: string | null;
  room_number: string | null;
  check_in_date: string;
  check_out_date: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  total_price: number;
  number_of_guests: number;
  payment_method: 'counter' | 'gcash' | 'maya' | null;
  payment_reference: string | null;
  payment_status: 'pending' | 'completed' | 'cancelled' | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEventBooking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  event_type: 'birthday' | 'wedding' | 'normal';
  event_name: string | null;
  event_date: string;
  event_end_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  base_price: number;
  total_price: number;
  number_of_guests: number;
  service_ids: string[];
  selected_rooms: string[];
  payment_method: 'counter' | 'gcash' | 'maya' | null;
  payment_reference: string | null;
  payment_status: 'pending' | 'completed' | 'cancelled' | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseStaffAccount {
  id: string;
  first_name: string;
  middle_initial?: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  status: 'active' | 'inactive';
  join_date: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEventTypePrice {
  id: string;
  event_type: 'birthday' | 'wedding' | 'normal';
  price: number;
  updated_at: string;
}

export interface DatabasePaymentConfig {
  id: string;
  gcash_number: string | null;
  maya_number: string | null;
  updated_at: string;
}

export interface DatabaseAppSettings {
  id: string;
  admin_password: string;
  updated_at: string;
}
