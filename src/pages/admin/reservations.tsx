import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { useBooking } from '../../lib/context';
import { Badge } from '../../components/ui/badge';
import { Trash2 } from 'lucide-react';
import { showSuccessNotification, showErrorNotification, showWarningNotification } from '../../lib/notifications';
import { DeleteConfirmDialog } from '../../components/delete-confirm-dialog';
import { Booking } from '../../lib/types';

const statusColors: { [key: string]: string } = {
  confirmed: 'bg-blue-100 text-blue-800',
  'checked-in': 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  'checked-out': 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function ReservationsPage() {
  const navigate = useNavigate();
  const { bookings, updateBooking, deleteBooking } = useBooking();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);


  // Approve Reservation
  const handleApproveReservation = (id: string) => {
    updateBooking(id, { status: 'confirmed' });
    showSuccessNotification({
      title: 'Reservation Approved',
      description: 'The reservation has been successfully approved.',
    });
  };

  // Reject Reservation
  const handleRejectReservation = (id: string) => {
    if (confirm('Are you sure you want to reject this reservation?')) {
      updateBooking(id, { status: 'cancelled' });
      showWarningNotification({
        title: 'Reservation Rejected',
        description: 'The reservation has been rejected and cancelled.',
      });
    }
  };

  // Cancel Reservation
  const handleCancelReservation = (id: string) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      updateBooking(id, { status: 'cancelled' });
      showWarningNotification({
        title: 'Reservation Cancelled',
        description: 'The reservation has been successfully cancelled.',
      });
    }
  };

  // Delete Reservation - Open Dialog
  const handleDeleteClick = (id: string) => {
    setBookingToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (bookingToDelete) {
      deleteBooking(bookingToDelete);
      showErrorNotification({
        title: 'Reservation Deleted',
        description: 'The reservation has been permanently deleted.',
      });
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {bookings.length} reservations
                </p>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Guest Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Check-In
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Check-Out
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Total Price
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-gray-800 font-medium">
                          {booking.guestName}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {booking.guestEmail}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-semibold">
                          {booking.roomNumber}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`${
                              statusColors[booking.status]
                            }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-semibold">
                          ₱{booking.totalPrice}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveReservation(booking.id)}
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                  title="Approve"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectReservation(booking.id)}
                                  className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                                  title="Reject"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {booking.status !== 'cancelled' && booking.status !== 'checked-out' && (
                              <button
                                onClick={() => handleCancelReservation(booking.id)}
                                className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition"
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClick(booking.id)}
                              className="p-1 hover:bg-gray-200 rounded transition"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {bookings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No reservations found</p>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">{booking.guestName}</h3>
                          <p className="text-xs text-gray-600">{booking.guestEmail}</p>
                        </div>
                        <Badge
                          className={`${
                            statusColors[booking.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Room:</span>
                          <p className="font-semibold">{booking.roomNumber}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <p className="font-semibold">₱{booking.totalPrice}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Check-In:</span>
                          <p className="font-semibold text-xs">
                            {new Date(booking.checkInDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Check-Out:</span>
                          <p className="font-semibold text-xs">
                            {new Date(booking.checkOutDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteClick(booking.id)}
                          className="flex-1 px-2 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition flex items-center justify-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          title="Delete Reservation"
          description="Are you sure you want to delete this reservation? This action cannot be undone and the booking record will be permanently removed from the system."
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setBookingToDelete(null);
          }}
        />
      </div>
    </div>
  );
}
