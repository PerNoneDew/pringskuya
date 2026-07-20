'use client';

import { useState, useEffect } from 'react';
import { Room, Booking } from '../../lib/types';
import { Button } from '../ui/button';
import { X, AlertCircle } from 'lucide-react';
import { useBooking } from '../../lib/context';

interface BookingModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  onPaymentRequired?: (booking: Booking) => void;
}

// Helper function to check if dates overlap
const datesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  return s1 < e2 && s2 < e1;
};

export function BookingModal({
  room,
  isOpen,
  onClose,
  onConfirm,
  onPaymentRequired,
}: BookingModalProps) {
  const { bookings, currentUser } = useBooking();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [bookingConflict, setBookingConflict] = useState<Booking | null>(null);

  // Auto-fill form with current user data when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setGuestName(currentUser.name || currentUser.firstName || '');
      setGuestEmail(currentUser.email || '');
      setGuestPhone(currentUser.phone || '');
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !room) return null;

  // Check for booking conflicts whenever dates change
  const checkForConflicts = () => {
    if (!checkInDate || !checkOutDate) return null;

    const conflict = bookings.find(
      (booking) =>
        booking.roomId === room.id &&
        booking.status !== 'cancelled' &&
        booking.status !== 'checked-out' &&
        booking.status !== 'rejected' &&
        datesOverlap(checkInDate, checkOutDate, booking.checkInDate, booking.checkOutDate)
    );

    return conflict || null;
  };

  const handleDateChange = () => {
    setBookingConflict(checkForConflicts());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !guestName ||
      !guestEmail ||
      !guestPhone ||
      !checkInDate ||
      !checkOutDate ||
      numberOfGuests === 0
    ) {
      alert('Please fill in all fields');
      return;
    }

    // Check for conflicts before submission
    const conflict = checkForConflicts();
    if (conflict) {
      alert(
        `❌ BOOKING CONFLICT!\n\nThis room is already booked from ${conflict.checkInDate} to ${conflict.checkOutDate}.\n\nPlease select different dates.`
      );
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      alert('Check-out date must be after check-in date');
      return;
    }

    const totalPrice = nights * room.pricePerNight;

    // Create booking object
    const bookingData: Booking = {
      id: 'temp_' + Date.now(),
      guestName,
      guestEmail,
      guestPhone,
      roomId: room.id,
      roomNumber: room.roomNumber,
      checkInDate,
      checkOutDate,
      status: 'pending',
      totalPrice,
      numberOfGuests,
      bookingType: 'room',
      createdAt: new Date().toISOString(),
    };

    // First add the booking
    onConfirm({
      guestName,
      guestEmail,
      guestPhone,
      roomId: room.id,
      roomNumber: room.roomNumber,
      checkInDate,
      checkOutDate,
      status: 'pending',
      totalPrice,
      numberOfGuests,
      bookingType: 'room',
    });

    // Then trigger payment modal
    if (onPaymentRequired) {
      setTimeout(() => {
        onPaymentRequired(bookingData);
      }, 100);
    }

    // Reset form
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setCheckInDate('');
    setCheckOutDate('');
    setNumberOfGuests(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Book Room {room.roomNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-In
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => {
                  setCheckInDate(e.target.value);
                  handleDateChange();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-Out
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => {
                  setCheckOutDate(e.target.value);
                  handleDateChange();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {bookingConflict && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-800">Booking Conflict!</p>
                <p className="text-sm text-red-700 mt-1">
                  This room is already reserved from{' '}
                  <span className="font-medium">{bookingConflict.checkInDate}</span> to{' '}
                  <span className="font-medium">{bookingConflict.checkOutDate}</span>.
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Guest: <span className="font-medium">{bookingConflict.guestName}</span>
                </p>
                <p className="text-xs text-red-600 mt-2">
                  Please select different dates.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests
            </label>
            <select
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Price per night</p>
            <p className="text-2xl font-bold text-gray-800">₱{room.pricePerNight}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!!bookingConflict}
            >
              {bookingConflict ? 'Fix Conflict First' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
