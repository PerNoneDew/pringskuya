// User and Role Types
export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: UserRole;
}

// Staff Account Type
export interface StaffAccount {
  id: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  email: string;
  position: string;
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
  password?: string;
}

// Room Types
export interface Room {
  id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'suite';
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  status: 'available' | 'reserved' | 'occupied' | 'maintenance';
  image?: string;
}

// Reservation/Booking Types
export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingType: 'room' | 'event';
  roomId?: string | null;
  roomNumber?: string | null;
  checkInDate: string;
  checkOutDate: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'rejected';
  totalPrice: number;
  numberOfGuests: number;
  createdAt: string;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  transactionScreenshot?: string; // Base64 encoded screenshot for GCASH/MAYA
  paymentStatus?: 'pending' | 'completed' | 'cancelled';
  checkInTime?: string;
  checkOutTime?: string;
  createdBy?: 'staff' | 'customer' | null;
  assignedStaffId?: string | null;
}
export interface EventBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  eventType: 'birthday' | 'wedding' | 'normal';
  eventName?: string;
  eventDate: string;
  eventEndDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  basePrice: number; // Base price for the event
  totalPrice: number;
  numberOfGuests: number;
  serviceIds: string[];
  selectedRooms: string[]; // For event rooms like ballroom, banquet hall, etc
  createdAt: string;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  transactionScreenshot?: string; // Base64 encoded screenshot for GCASH/MAYA
  paymentStatus?: 'pending' | 'completed' | 'cancelled';
}

// Service Types (add-ons)
export interface Service {
  id: string;
  name: string;
  category: 'swimming-pool' | 'videoke' | 'cottages' | 'foods';
  description: string;
  price: number;
  capacity?: number;
  available: boolean;
}

// Payment Types
export type PaymentMethod = 'counter' | 'gcash' | 'maya';

export interface Payment {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  amount: number;
  reference?: string; // For GCASH/MAYA reference number
  transactionScreenshot?: string; // Base64 encoded screenshot for GCASH/MAYA
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface PaymentConfig {
  gcashNumber?: string;
  mayaNumber?: string;
  lastUpdated?: string;
}

// Dashboard Metrics
export interface DashboardMetrics {
  todaysBookings: number;
  availableRooms: number;
  checkedInGuests: number;
  pendingPayments: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

// Chart Data Types
export interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

export interface OccupancyData {
  name: string;
  value: number;
  color: string;
}
