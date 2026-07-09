import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../lib/context';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Calendar, Users, DollarSign, Edit2, CheckCircle, XCircle, X, CreditCard } from 'lucide-react';
import { EventBooking } from '../../lib/types';
import { showSuccessNotification } from '../../lib/notifications';

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const { eventBookings, updateEventBooking, services, eventTypePrices, setEventTypePrice } = useBooking();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingBooking, setEditingBooking] = useState<EventBooking | null>(null);
  const [editBasePrice, setEditBasePrice] = useState<number>(0);
  const [editAdditionalCharges, setEditAdditionalCharges] = useState<number>(0);
  const [showPricingSection, setShowPricingSection] = useState<boolean>(false);
  const [birthdayPrice, setBirthdayPrice] = useState(eventTypePrices.find(p => p.type === 'birthday')?.price || 0);
  const [weddingPrice, setWeddingPrice] = useState(eventTypePrices.find(p => p.type === 'wedding')?.price || 0);
  const [normalPrice, setNormalPrice] = useState(eventTypePrices.find(p => p.type === 'normal')?.price || 0);

  const filteredBookings = eventBookings.filter((booking) => {
    const statusMatch = filterStatus === 'all' || booking.status === filterStatus;
    const typeMatch = filterType === 'all' || booking.eventType === filterType;
    return statusMatch && typeMatch;
  });

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    updateEventBooking(bookingId, { status: newStatus as any });
  };

  const handleEditClick = (booking: EventBooking) => {
    setEditingBooking(booking);
    setEditBasePrice(booking.basePrice || 0);
    const serviceTotal = booking.serviceIds.reduce((sum, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);
    setEditAdditionalCharges(booking.totalPrice - (booking.basePrice || 0));
  };

  const handleSavePrice = () => {
    if (editingBooking) {
      const newTotal = editBasePrice + editAdditionalCharges;
      updateEventBooking(editingBooking.id, {
        basePrice: editBasePrice,
        totalPrice: newTotal,
      });
      setEditingBooking(null);
    }
  };

  const handleUpdateEventPrices = () => {
    setEventTypePrice('birthday', birthdayPrice);
    setEventTypePrice('wedding', weddingPrice);
    setEventTypePrice('normal', normalPrice);
    showSuccessNotification({
      title: 'Event Prices Updated',
      description: 'Event type prices have been saved successfully.',
    });
    setShowPricingSection(false);
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'birthday':
        return 'bg-pink-100 text-pink-800';
      case 'wedding':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalEventRevenue = filteredBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const confirmedEvents = filteredBookings.filter((b) => b.status === 'confirmed').length;
  const totalGuests = filteredBookings.reduce((sum, b) => sum + b.numberOfGuests, 0);

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <AdminHeader />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Event Bookings Management</h1>
            <p className="text-gray-600 mt-2">Track and manage all event bookings</p>
          </div>

          {/* Event Type Pricing Section */}
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={24} className="text-green-600" />
                  <CardTitle>Event Type Pricing</CardTitle>
                </div>
                <button
                  onClick={() => setShowPricingSection(!showPricingSection)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showPricingSection ? 'Hide' : 'Manage'}
                </button>
              </div>
            </CardHeader>
            {showPricingSection && (
              <CardContent className="space-y-6 border-t">
                <p className="text-sm text-gray-600 pt-4">
                  Set the base prices for different event types. These prices will be displayed to customers when they create events.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birthday Party Base Price (₱)
                    </label>
                    <input
                      type="number"
                      value={birthdayPrice}
                      onChange={(e) => setBirthdayPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wedding Base Price (₱)
                    </label>
                    <input
                      type="number"
                      value={weddingPrice}
                      onChange={(e) => setWeddingPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Normal Event Base Price (₱)
                    </label>
                    <input
                      type="number"
                      value={normalPrice}
                      onChange={(e) => setNormalPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900">
                    <span className="font-semibold">Note:</span> These are the base prices shown to customers. Additional services can be added on top of these prices.
                  </p>
                </div>

                <button
                  onClick={handleUpdateEventPrices}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Save Event Prices
                </button>
              </CardContent>
            )}
          </Card>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800">{filteredBookings.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Confirmed Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{confirmedEvents}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Guests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{totalGuests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Event Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">₱{totalEventRevenue}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Types</option>
                <option value="birthday">Birthday</option>
                <option value="wedding">Wedding</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Event Bookings Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Event Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Host
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Guests
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Base Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Additional Charges
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Total Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No event bookings found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <Badge className={getEventTypeColor(booking.eventType)}>
                              {booking.eventType.toUpperCase()}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-2">
                              {new Date(booking.eventDate).toLocaleDateString()} to{' '}
                              {new Date(booking.eventEndDate).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">{booking.guestName}</p>
                            <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {booking.numberOfGuests}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(booking.eventDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-semibold">
                          ₱{booking.basePrice || 0}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          ₱{booking.totalPrice - (booking.basePrice || 0)}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-semibold text-blue-600">
                          ₱{booking.totalPrice}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(booking)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                              title="Edit Price"
                            >
                              <Edit2 size={18} />
                            </button>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                                  title="Confirm"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                  title="Cancel"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                title="Complete"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Price Modal */}
          {editingBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader className="flex flex-row justify-between items-center pb-4 border-b">
                  <CardTitle>Edit Event Price</CardTitle>
                  <button
                    onClick={() => setEditingBooking(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Event: {editingBooking.guestName}</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Date: {new Date(editingBooking.eventDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Event Price (₱)
                      </label>
                      <input
                        type="number"
                        value={editBasePrice}
                        onChange={(e) => setEditBasePrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">Base price for the event itself</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Charges (₱)
                      </label>
                      <input
                        type="number"
                        value={editAdditionalCharges}
                        onChange={(e) => setEditAdditionalCharges(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">Services, add-ons, and other charges</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Base Price:</span>
                      <span className="font-semibold text-gray-800">₱{editBasePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">Additional Charges:</span>
                      <span className="font-semibold text-gray-800">₱{editAdditionalCharges.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                      <span className="font-semibold text-gray-800">Total:</span>
                      <span className="text-lg font-bold text-blue-600">
                        ₱{(editBasePrice + editAdditionalCharges).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setEditingBooking(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSavePrice} className="flex-1">
                      Save Price
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
