import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { User, Booking, Room, DashboardMetrics, EventBooking, Service, PaymentConfig, PaymentMethod, StaffAccount } from './types';
import type {
  DatabaseRoom,
  DatabaseService,
  DatabaseBooking,
  DatabaseEventBooking,
  DatabaseStaffAccount,
  DatabaseCustomer,
  DatabaseEventTypePrice,
  DatabasePaymentConfig,
  DatabaseAppSettings
} from './supabase';

interface EventTypePrice {
  type: 'birthday' | 'wedding' | 'normal';
  price: number;
}

export interface BookingContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  bookings: Booking[];
  eventBookings: EventBooking[];
  rooms: Room[];
  eventRooms: Room[];
  services: Service[];
  eventTypePrices: EventTypePrice[];
  staffAccounts: StaffAccount[];
  customerAccounts: (User & { password?: string })[];
  addCustomerAccount: (user: User & { password: string }) => void;
  paymentConfig: PaymentConfig;
  setPaymentConfig: (config: PaymentConfig) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  recordPayment: (bookingId: string, method: PaymentMethod, amount: number, reference?: string, screenshot?: string) => void;
  recordEventPayment: (eventId: string, method: PaymentMethod, amount: number, reference?: string, screenshot?: string) => void;
  addEventBooking: (booking: EventBooking) => void;
  updateEventBooking: (id: string, booking: Partial<EventBooking>) => void;
  deleteEventBooking: (id: string) => void;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addService: (service: Service) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  setEventTypePrice: (type: 'birthday' | 'wedding' | 'normal', price: number) => void;
  addStaffAccount: (staffAccount: StaffAccount) => void;
  updateStaffAccount: (id: string, staffAccount: Partial<StaffAccount>) => void;
  deleteStaffAccount: (id: string) => void;
  changeAdminPassword: (newPassword: string) => void;
  changeStaffPassword: (staffId: string, newPassword: string) => void;
  changeCustomerPassword: (customerId: string, newPassword: string) => void;
  adminPassword: string;
  getMetrics: () => DashboardMetrics;
  isLoading: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Helper functions to convert between database and app types
const dbRoomToRoom = (db: DatabaseRoom): Room => ({
  id: db.id,
  roomNumber: db.room_number,
  type: db.type,
  pricePerNight: Number(db.price_per_night),
  capacity: db.capacity,
  amenities: db.amenities,
  status: db.status,
  image: db.image_url || undefined,
});

const dbServiceToService = (db: DatabaseService): Service => ({
  id: db.id,
  name: db.name,
  category: db.category,
  description: db.description,
  price: Number(db.price),
  capacity: db.capacity || undefined,
  available: db.available,
});

const dbBookingToBooking = (db: DatabaseBooking): Booking => ({
  id: db.id,
  guestName: db.guest_name,
  guestEmail: db.guest_email,
  guestPhone: db.guest_phone,
  bookingType: db.booking_type,
  roomId: db.room_id || undefined,
  roomNumber: db.room_number || undefined,
  checkInDate: db.check_in_date,
  checkOutDate: db.check_out_date,
  status: db.status,
  totalPrice: Number(db.total_price),
  numberOfGuests: db.number_of_guests,
  createdAt: db.created_at,
  paymentMethod: db.payment_method || undefined,
  paymentReference: db.payment_reference || undefined,
  paymentStatus: db.payment_status || undefined,
  checkInTime: db.checked_in_at || undefined,
  checkOutTime: db.checked_out_at || undefined,
  createdBy: (db.created_by as 'staff' | 'customer' | null) ?? null,
  assignedStaffId: (db as { assigned_staff_id?: string }).assigned_staff_id || undefined,
});

const dbEventBookingToEventBooking = (db: DatabaseEventBooking): EventBooking => ({
  id: db.id,
  guestName: db.guest_name,
  guestEmail: db.guest_email,
  guestPhone: db.guest_phone,
  eventType: db.event_type,
  eventName: db.event_name || undefined,
  eventDate: db.event_date,
  eventEndDate: db.event_end_date,
  status: db.status,
  basePrice: Number(db.base_price),
  totalPrice: Number(db.total_price),
  numberOfGuests: db.number_of_guests,
  serviceIds: db.service_ids,
  selectedRooms: db.selected_rooms,
  createdAt: db.created_at,
  paymentMethod: db.payment_method || undefined,
  paymentReference: db.payment_reference || undefined,
  paymentStatus: db.payment_status || undefined,
});

const dbStaffToStaff = (db: DatabaseStaffAccount): StaffAccount => ({
  id: db.id,
  firstName: db.first_name,
  middleInitial: db.middle_initial,
  lastName: db.last_name,
  email: db.email,
  phone: db.phone,
  position: db.position,
  status: db.status,
  joinDate: db.join_date,
  password: db.password_hash,
});

const dbCustomerToUser = (db: DatabaseCustomer): User & { password: string } => ({
  id: db.id,
  firstName: db.first_name,
  lastName: db.last_name,
  email: db.email,
  phone: db.phone || undefined,
  password: db.password_hash,
  role: 'customer',
});

export function BookingProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>({
    id: '1',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@gmail.com',
    role: 'admin',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [adminPassword, setAdminPassword] = useState('admin123');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [eventRooms, setEventRooms] = useState<Room[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([]);
  const [customerAccounts, setCustomerAccounts] = useState<(User & { password?: string })[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ gcashNumber: '', mayaNumber: '' });
  const [eventTypePrices, setEventTypePrices] = useState<EventTypePrice[]>([
    { type: 'birthday', price: 5000 },
    { type: 'wedding', price: 15000 },
    { type: 'normal', price: 3000 },
  ]);

  // Fetch all data from Supabase on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [
          roomsData,
          servicesData,
          bookingsData,
          eventBookingsData,
          staffData,
          customersData,
          eventPricesData,
          paymentConfigData,
          appSettingsData
        ] = await Promise.all([
          supabase.from('rooms').select('*').order('room_number'),
          supabase.from('services').select('*').order('name'),
          supabase.from('bookings').select('*').order('created_at', { ascending: false }),
          supabase.from('event_bookings').select('*').order('created_at', { ascending: false }),
          supabase.from('staff_accounts').select('*').order('created_at', { ascending: false }),
          supabase.from('customers').select('*').order('created_at', { ascending: false }),
          supabase.from('event_type_prices').select('*'),
          supabase.from('payment_config').select('*').limit(1),
          supabase.from('app_settings').select('*').limit(1),
        ]);

        // Set rooms
        if (roomsData.data) {
          setRooms(roomsData.data.map(dbRoomToRoom));
        }

        // Set services
        if (servicesData.data) {
          setServices(servicesData.data.map(dbServiceToService));
        }

        // Set bookings
        if (bookingsData.data) {
          setBookings(bookingsData.data.map(dbBookingToBooking));
        }

        // Set event bookings
        if (eventBookingsData.data) {
          setEventBookings(eventBookingsData.data.map(dbEventBookingToEventBooking));
        }

        // Set staff accounts
        if (staffData.data) {
          setStaffAccounts(staffData.data.map(dbStaffToStaff));
        }

        // Set customers
        if (customersData.data) {
          setCustomerAccounts(customersData.data.map(dbCustomerToUser));
        }

        // Set event type prices
        if (eventPricesData.data && eventPricesData.data.length > 0) {
          setEventTypePrices(eventPricesData.data.map((p: DatabaseEventTypePrice) => ({
            type: p.event_type,
            price: Number(p.price),
          })));
        }

        // Set payment config
        if (paymentConfigData.data && paymentConfigData.data.length > 0) {
          const config = paymentConfigData.data[0] as DatabasePaymentConfig;
          setPaymentConfig({
            gcashNumber: config.gcash_number || '',
            mayaNumber: config.maya_number || '',
          });
        }

        // Set admin password
        if (appSettingsData.data && appSettingsData.data.length > 0) {
          const settings = appSettingsData.data[0] as DatabaseAppSettings;
          setAdminPassword(settings.admin_password);
        }

      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Restore current user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const handleSetCurrentUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser({ id: '', name: '', email: '', role: 'customer' });
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userCredentials');
  };

  // Customer accounts
  const addCustomerAccount = async (user: User & { password: string }) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          email: user.email,
          phone: user.phone || null,
          password_hash: user.password,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCustomer = dbCustomerToUser(data as DatabaseCustomer);
        setCustomerAccounts(prev => [...prev, newCustomer]);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  // Bookings
  const addBooking = async (booking: Booking) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          guest_name: booking.guestName,
          guest_email: booking.guestEmail,
          guest_phone: booking.guestPhone,
          booking_type: 'room',
          room_id: booking.roomId || null,
          room_number: booking.roomNumber || null,
          check_in_date: booking.checkInDate,
          check_out_date: booking.checkOutDate,
          status: booking.status,
          total_price: booking.totalPrice,
          number_of_guests: booking.numberOfGuests,
          payment_method: booking.paymentMethod || null,
          payment_reference: booking.paymentReference || null,
          payment_status: booking.paymentStatus || null,
          created_by: booking.createdBy || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newBooking = dbBookingToBooking(data as DatabaseBooking);
        const next = [...bookings, newBooking];
        setBookings(prev => [...prev, newBooking]);

        // Update room status against the post-insert snapshot
        if (newBooking.roomId) {
          updateRoomStatus(newBooking.roomId, next);
        }
      }
    } catch (error) {
      console.error('Error adding booking:', error);
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.status) dbUpdates.status = updates.status;
      if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;
      if (updates.paymentReference) dbUpdates.payment_reference = updates.paymentReference;
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.roomId !== undefined) dbUpdates.room_id = updates.roomId || null;
      if (updates.roomNumber !== undefined) dbUpdates.room_number = updates.roomNumber || null;
      if (updates.guestName) dbUpdates.guest_name = updates.guestName;
      if (updates.guestEmail) dbUpdates.guest_email = updates.guestEmail;
      if (updates.guestPhone) dbUpdates.guest_phone = updates.guestPhone;
      if (updates.checkInDate) dbUpdates.check_in_date = updates.checkInDate;
      if (updates.checkOutDate) dbUpdates.check_out_date = updates.checkOutDate;
      if (updates.numberOfGuests !== undefined) dbUpdates.number_of_guests = updates.numberOfGuests;
      if (updates.totalPrice !== undefined) dbUpdates.total_price = updates.totalPrice;
      if (updates.assignedStaffId !== undefined) dbUpdates.assigned_staff_id = updates.assignedStaffId || null;

      const { error } = await supabase
        .from('bookings')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      const updatedBookings = bookings.map(b => b.id === id ? { ...b, ...updates } : b);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

      // Update room status against the post-update snapshot
      const booking = updatedBookings.find(b => b.id === id);
      if (booking?.roomId) {
        updateRoomStatus(booking.roomId, updatedBookings);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const booking = bookings.find(b => b.id === id);

      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const remaining = bookings.filter(b => b.id !== id);
      setBookings(prev => prev.filter(b => b.id !== id));

      // Update room status against the post-delete snapshot
      if (booking?.roomId) {
        updateRoomStatus(booking.roomId, remaining);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  // Event Bookings
  const addEventBooking = async (booking: EventBooking) => {
    try {
      const { data, error } = await supabase
        .from('event_bookings')
        .insert({
          guest_name: booking.guestName,
          guest_email: booking.guestEmail,
          guest_phone: booking.guestPhone,
          event_type: booking.eventType,
          event_name: booking.eventName || null,
          event_date: booking.eventDate,
          event_end_date: booking.eventEndDate,
          status: booking.status,
          base_price: booking.basePrice,
          total_price: booking.totalPrice,
          number_of_guests: booking.numberOfGuests,
          service_ids: booking.serviceIds,
          selected_rooms: booking.selectedRooms,
          payment_method: booking.paymentMethod || null,
          payment_reference: booking.paymentReference || null,
          payment_status: booking.paymentStatus || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newBooking = dbEventBookingToEventBooking(data as DatabaseEventBooking);
        setEventBookings(prev => [...prev, newBooking]);
      }
    } catch (error) {
      console.error('Error adding event booking:', error);
    }
  };

  const updateEventBooking = async (id: string, updates: Partial<EventBooking>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.status) dbUpdates.status = updates.status;
      if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;
      if (updates.paymentReference) dbUpdates.payment_reference = updates.paymentReference;
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;

      const { error } = await supabase
        .from('event_bookings')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setEventBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    } catch (error) {
      console.error('Error updating event booking:', error);
    }
  };

  const deleteEventBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEventBookings(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting event booking:', error);
    }
  };

  // Rooms
  const addRoom = async (room: Room) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          room_number: room.roomNumber,
          type: room.type,
          price_per_night: room.pricePerNight,
          capacity: room.capacity,
          amenities: room.amenities,
          status: room.status,
          image_url: room.image || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newRoom = dbRoomToRoom(data as DatabaseRoom);
        setRooms(prev => [...prev, newRoom]);
      }
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const updateRoom = async (id: string, updates: Partial<Room>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.roomNumber) dbUpdates.room_number = updates.roomNumber;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.pricePerNight !== undefined) dbUpdates.price_per_night = updates.pricePerNight;
      if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
      if (updates.amenities) dbUpdates.amenities = updates.amenities;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.image !== undefined) dbUpdates.image_url = updates.image;

      const { error } = await supabase
        .from('rooms')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  // Helper to update room status based on bookings. Accepts an explicit
  // bookings snapshot so callers can pass the post-update state and avoid
  // reading a stale closure value.
  const updateRoomStatus = async (roomId: string, snapshot?: Booking[]) => {
    const source = snapshot ?? bookings;
    const roomBookings = source.filter(
      b => b.roomId === roomId && ['pending', 'confirmed', 'checked-in'].includes(b.status)
    );

    let newStatus: 'available' | 'reserved' | 'occupied' = 'available';

    if (roomBookings.some(b => b.status === 'checked-in')) {
      newStatus = 'occupied';
    } else if (roomBookings.length > 0) {
      newStatus = 'reserved';
    }

    await updateRoom(roomId, { status: newStatus });
  };

  // Services
  const addService = async (service: Service) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: service.name,
          category: service.category,
          description: service.description,
          price: service.price,
          capacity: service.capacity || null,
          available: service.available,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newService = dbServiceToService(data as DatabaseService);
        setServices(prev => [...prev, newService]);
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.name) dbUpdates.name = updates.name;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
      if (updates.available !== undefined) dbUpdates.available = updates.available;

      const { error } = await supabase
        .from('services')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  // Staff Accounts
  const addStaffAccount = async (staffAccount: StaffAccount) => {
    try {
      const { data, error } = await supabase
        .from('staff_accounts')
        .insert({
          first_name: staffAccount.firstName,
          middle_initial: staffAccount.middleInitial || null,
          last_name: staffAccount.lastName,
          email: staffAccount.email,
          phone: staffAccount.phone,
          position: staffAccount.position,
          status: staffAccount.status,
          join_date: staffAccount.joinDate,
          password_hash: staffAccount.password || '',
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newStaff = dbStaffToStaff(data as DatabaseStaffAccount);
        setStaffAccounts(prev => [...prev, newStaff]);
      }
    } catch (error) {
      console.error('Error adding staff account:', error);
    }
  };

  const updateStaffAccount = async (id: string, updates: Partial<StaffAccount>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.firstName) dbUpdates.first_name = updates.firstName;
      if ('middleInitial' in updates) dbUpdates.middle_initial = updates.middleInitial || null;
      if (updates.lastName) dbUpdates.last_name = updates.lastName;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.position) dbUpdates.position = updates.position;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.password) dbUpdates.password_hash = updates.password;

      const { error } = await supabase
        .from('staff_accounts')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setStaffAccounts(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (error) {
      console.error('Error updating staff account:', error);
    }
  };

  const deleteStaffAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStaffAccounts(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting staff account:', error);
    }
  };

  // Payment methods
  const recordPayment = async (bookingId: string, method: PaymentMethod, _amount: number, reference?: string, _screenshot?: string) => {
    await updateBooking(bookingId, {
      paymentMethod: method,
      paymentReference: reference,
      paymentStatus: method === 'counter' ? 'completed' : 'pending',
      status: method === 'counter' ? 'confirmed' : 'pending',
    });
  };

  const recordEventPayment = async (eventId: string, method: PaymentMethod, _amount: number, reference?: string, _screenshot?: string) => {
    await updateEventBooking(eventId, {
      paymentMethod: method,
      paymentReference: reference,
      paymentStatus: method === 'counter' ? 'completed' : 'pending',
    });
  };

  // Admin password
  const changeAdminPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ admin_password: newPassword })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows

      if (error) throw error;

      setAdminPassword(newPassword);
    } catch (error) {
      console.error('Error changing admin password:', error);
    }
  };

  const changeStaffPassword = async (staffId: string, newPassword: string) => {
    await updateStaffAccount(staffId, { password: newPassword });
  };

  const changeCustomerPassword = async (customerId: string, newPassword: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ password_hash: newPassword })
        .eq('id', customerId);

      if (error) throw error;

      setCustomerAccounts(prev => prev.map(c => c.id === customerId ? { ...c, password: newPassword } : c));
    } catch (error) {
      console.error('Error changing customer password:', error);
    }
  };

  // Event type prices
  const handleSetEventTypePrice = async (type: 'birthday' | 'wedding' | 'normal', price: number) => {
    try {
      const { error } = await supabase
        .from('event_type_prices')
        .update({ price })
        .eq('event_type', type);

      if (error) throw error;

      setEventTypePrices(prev => prev.map(p => p.type === type ? { ...p, price } : p));
    } catch (error) {
      console.error('Error setting event type price:', error);
    }
  };

  // Payment config
  const handleSetPaymentConfig = async (config: PaymentConfig) => {
    try {
      const { error } = await supabase
        .from('payment_config')
        .update({
          gcash_number: config.gcashNumber || null,
          maya_number: config.mayaNumber || null,
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      setPaymentConfig(config);
    } catch (error) {
      console.error('Error setting payment config:', error);
    }
  };

  // Metrics
  const getMetrics = useCallback((): DashboardMetrics => {
    const today = new Date().toISOString().split('T')[0];
    const todaysBookings = bookings.filter(
      (b) => b.checkInDate === today || (b.checkInDate <= today && b.checkOutDate >= today)
    ).length;

    const availableRooms = rooms.filter((r) => r.status === 'available').length;
    const checkedInGuests = bookings.filter((b) => b.status === 'checked-in').length;
    const pendingPayments = bookings.filter((b) => b.status === 'pending').length;
    const monthlyRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const occupancyRate = rooms.length > 0 ? ((rooms.length - availableRooms) / rooms.length) * 100 : 0;

    return {
      todaysBookings,
      availableRooms,
      checkedInGuests,
      pendingPayments,
      monthlyRevenue,
      occupancyRate: Math.round(occupancyRate),
    };
  }, [bookings, rooms]);

  const value: BookingContextType = {
    currentUser,
    setCurrentUser: handleSetCurrentUser,
    logout,
    isAuthenticated,
    bookings,
    eventBookings,
    rooms,
    eventRooms,
    services,
    eventTypePrices,
    staffAccounts,
    customerAccounts,
    addCustomerAccount,
    paymentConfig,
    setPaymentConfig: handleSetPaymentConfig,
    addBooking,
    updateBooking,
    deleteBooking,
    recordPayment,
    recordEventPayment,
    addEventBooking,
    updateEventBooking,
    deleteEventBooking,
    addRoom,
    updateRoom,
    deleteRoom,
    addService,
    updateService,
    deleteService,
    setEventTypePrice: handleSetEventTypePrice,
    addStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
    changeAdminPassword,
    changeStaffPassword,
    changeCustomerPassword,
    adminPassword,
    getMetrics,
    isLoading,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
