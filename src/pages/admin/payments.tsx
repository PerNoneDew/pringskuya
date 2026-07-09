import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { useBooking } from '../../lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, XCircle, Clock, Printer, Eye, Check, X } from 'lucide-react';

export default function PaymentsPage() {
  const navigate = useNavigate();
  const { bookings, updateBooking } = useBooking();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);

  // Get payment data from bookings
  const payments = bookings.map((b) => ({
    id: b.id,
    bookingRef: `REF-${b.id.substring(0, 8)}`,
    guestName: b.guestName,
    guestEmail: b.guestEmail,
    amount: b.totalPrice,
    paymentDate: b.checkInDate,
    status: b.paymentStatus || (b.status === 'checked-out' || b.status === 'confirmed' ? 'completed' : b.status === 'pending' ? 'pending' : 'failed'),
    method: b.paymentMethod ? b.paymentMethod.toUpperCase() : 'Counter Payment',
    reference: b.paymentReference,
    screenshot: b.transactionScreenshot,
  }));

  // View All Payments
  const handleViewPayments = () => {
    alert(`Showing all payments (${payments.length} total)`);
  };

  // Verify Payment
  const handleVerifyPayment = (paymentId: string) => {
    updateBooking(paymentId, {
      paymentStatus: 'completed',
      status: 'confirmed'
    });
    alert(`Payment verified for booking: ${paymentId}`);
  };

  // Reject Payment
  const handleRejectPayment = (paymentId: string) => {
    updateBooking(paymentId, {
      paymentStatus: 'pending',
      status: 'pending'
    });
    alert(`Payment request returned for review`);
  };

  // Generate Receipt
  const handleGenerateReceipt = (paymentId: string) => {
    alert(`Receipt generated for booking: ${paymentId}\nReceipt has been sent to guest email.`);
  };

  // View Screenshot
  const handleViewScreenshot = (screenshot: string) => {
    setSelectedScreenshot(screenshot);
    setShowScreenshotModal(true);
  };

  const filteredPayments = payments.filter((p) =>
    filterStatus === 'all' ? true : p.status === filterStatus
  );

  const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const completedPayments = filteredPayments.filter((p) => p.status === 'completed').length;
  const pendingPayments = filteredPayments.filter((p) => p.status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'pending':
        return <Clock size={18} className="text-yellow-600" />;
      case 'failed':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Payment Management</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ₱{totalRevenue}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">All payments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {filteredPayments.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">All bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Completed Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {completedPayments}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Verified</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pending Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {pendingPayments}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
                </CardContent>
              </Card>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Payments Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Payment Transactions</span>
                  <button
                    onClick={handleViewPayments}
                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    View All
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Booking Ref
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Guest Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Payment Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Method
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Details
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {payment.bookingRef}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <div>
                              <p className="font-medium">{payment.guestName}</p>
                              <p className="text-sm text-gray-500">{payment.guestEmail}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 font-semibold">
                            ₱{payment.amount}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {payment.method}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {payment.method !== 'COUNTER PAYMENT' && (
                              <div className="text-xs space-y-1">
                                <p><span className="font-medium">Account:</span> {payment.reference}</p>
                                {payment.screenshot && (
                                  <button
                                    onClick={() => handleViewScreenshot(payment.screenshot!)}
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <Eye size={14} />
                                    View Proof
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={getStatusColor(payment.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(payment.status)}
                                {payment.status.charAt(0).toUpperCase() +
                                  payment.status.slice(1)}
                              </div>
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 flex-wrap">
                              {payment.status === 'pending' && payment.method !== 'COUNTER PAYMENT' && (
                                <>
                                  <button
                                    onClick={() => handleVerifyPayment(payment.id)}
                                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition flex items-center gap-1"
                                  >
                                    <Check size={14} />
                                    Verify
                                  </button>
                                  <button
                                    onClick={() => handleRejectPayment(payment.id)}
                                    className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition flex items-center gap-1"
                                  >
                                    <X size={14} />
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleGenerateReceipt(payment.id)}
                                className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                title="Print Receipt"
                              >
                                <Printer size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Screenshot Modal */}
        {showScreenshotModal && selectedScreenshot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Payment Proof</h2>
                <button
                  onClick={() => {
                    setShowScreenshotModal(false);
                    setSelectedScreenshot(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <img
                  src={selectedScreenshot}
                  alt="Transaction proof"
                  className="w-full rounded-lg border border-gray-300 shadow-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
