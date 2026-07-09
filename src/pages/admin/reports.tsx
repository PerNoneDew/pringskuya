import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../lib/context';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Download, FileText, BarChart3 } from 'lucide-react';

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const { bookings, rooms, eventBookings } = useBooking();
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalEventRevenue = eventBookings.reduce((sum, e) => sum + e.totalPrice, 0);
  const combinedRevenue = totalRevenue + totalEventRevenue;
  const totalBookings = bookings.length;
  const totalEvents = eventBookings.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const avgOccupancy = rooms.length > 0 ? ((occupiedRooms / rooms.length) * 100).toFixed(1) : 0;

  // Generate Reservation Report
  const handleGenerateReservationReport = () => {
    const reportData = {
      title: 'Reservation Report',
      generatedDate: new Date().toLocaleDateString(),
      totalBookings: bookings.length,
      bookings: bookings.map((b) => ({
        id: b.id,
        guestName: b.guestName,
        email: b.guestEmail,
        phone: b.guestPhone,
        rooms: b.roomNumber || 'N/A',
        checkIn: new Date(b.checkInDate).toLocaleDateString(),
        checkOut: new Date(b.checkOutDate).toLocaleDateString(),
        status: b.status,
        totalPrice: b.totalPrice,
      })),
    };
    setGeneratedReport(reportData);
  };

  // Generate Sales Report
  const handleGenerateSalesReport = () => {
    const reportData = {
      title: 'Sales Report',
      generatedDate: new Date().toLocaleDateString(),
      totalRevenue: combinedRevenue,
      roomBookings: totalBookings,
      eventBookings: totalEvents,
      roomRevenue: totalRevenue,
      eventRevenue: totalEventRevenue,
      paymentBreakdown: [
        { status: 'Pending', count: bookings.filter((b) => b.paymentStatus === 'pending').length },
        { status: 'Completed', count: bookings.filter((b) => b.paymentStatus === 'completed').length },
        { status: 'Cancelled', count: bookings.filter((b) => b.paymentStatus === 'cancelled').length },
      ],
      details: bookings.map((b) => ({
        bookingId: b.id,
        guestName: b.guestName,
        amount: b.totalPrice,
        method: b.paymentMethod || 'Not specified',
        status: b.paymentStatus || 'pending',
        date: new Date(b.checkInDate).toLocaleDateString(),
      })),
    };
    setGeneratedReport(reportData);
  };

  // Generate Customer Report
  const handleGenerateCustomerReport = () => {
    const customers = bookings.map((b) => ({
      name: b.guestName,
      email: b.guestEmail,
      phone: b.guestPhone,
      bookings: bookings.filter((booking) => booking.guestEmail === b.guestEmail).length,
      totalSpent: bookings
        .filter((booking) => booking.guestEmail === b.guestEmail)
        .reduce((sum, booking) => sum + booking.totalPrice, 0),
    }));

    const reportData = {
      title: 'Customer Report',
      generatedDate: new Date().toLocaleDateString(),
      totalCustomers: [...new Set(bookings.map((b) => b.guestEmail))].length,
      customers: Array.from(
        new Map(customers.map((item) => [item.email, item])).values()
      ),
    };
    setGeneratedReport(reportData);
  };

  // Generate Room/Facility Usage Report
  const handleGenerateRoomUsageReport = () => {
    const reportData = {
      title: 'Room Usage Report',
      generatedDate: new Date().toLocaleDateString(),
      totalRooms: rooms.length,
      occupiedRooms: occupiedRooms,
      availableRooms: rooms.length - occupiedRooms,
      occupancyRate: avgOccupancy,
      roomBreakdown: [
        {
          type: 'Single',
          total: rooms.filter((r) => r.type === 'single').length,
          occupied: rooms.filter((r) => r.type === 'single' && r.status === 'occupied').length,
        },
        {
          type: 'Double',
          total: rooms.filter((r) => r.type === 'double').length,
          occupied: rooms.filter((r) => r.type === 'double' && r.status === 'occupied').length,
        },
        {
          type: 'Suite',
          total: rooms.filter((r) => r.type === 'suite').length,
          occupied: rooms.filter((r) => r.type === 'suite' && r.status === 'occupied').length,
        },
      ],
    };
    setGeneratedReport(reportData);
  };

  // Export as PDF
  const handleExportPDF = async () => {
    if (!generatedReport) return;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      pdf.setFontSize(18);
      pdf.text(`${generatedReport.title}`, margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.text(`Generated: ${generatedReport.generatedDate}`, margin, yPosition);
      yPosition += 10;

      pdf.setDrawColor(200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);

      if (generatedReport.title === 'Sales Report') {
        pdf.text('Revenue Summary:', margin, yPosition);
        yPosition += 7;
        pdf.setFontSize(10);
        pdf.text(`Room Revenue: ₱${generatedReport.roomRevenue}`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`Event Revenue: ₱${generatedReport.eventRevenue}`, margin + 5, yPosition);
        yPosition += 6;
        pdf.setFontSize(12);
        pdf.text(`Total Revenue: ₱${generatedReport.totalRevenue}`, margin + 5, yPosition);
        yPosition += 12;

        pdf.setFontSize(11);
        pdf.text('Payment Status:', margin, yPosition);
        yPosition += 7;
        pdf.setFontSize(10);
        generatedReport.paymentBreakdown.forEach((p: any) => {
          pdf.text(`${p.status}: ${p.count}`, margin + 5, yPosition);
          yPosition += 6;
        });
      }

      yPosition = pageHeight - 10;
      pdf.setFontSize(8);
      pdf.text(
        `Generated on ${new Date().toLocaleString()}`,
        margin,
        yPosition
      );

      pdf.save(
        `${generatedReport.title || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Export as Excel
  const handleExportExcel = () => {
    if (!generatedReport) return;

    const worksheet = XLSX.utils.json_to_sheet(
      generatedReport.details || generatedReport.customers || generatedReport.roomBreakdown || generatedReport.bookings || []
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${generatedReport?.title || 'Report'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Clear generated report
  const handleClearReport = () => {
    setGeneratedReport(null);
  };

  // Monthly data
  const monthlyData = [
    { month: 'Jan', bookings: 25, revenue: 2500 },
    { month: 'Feb', bookings: 28, revenue: 2800 },
    { month: 'Mar', bookings: 32, revenue: 3200 },
    { month: 'Apr', bookings: 35, revenue: 3500 },
  ];

  // Room type data
  const roomTypeData = [
    {
      type: 'Single',
      booked: rooms.filter((r) => r.type === 'single' && r.status === 'occupied').length,
      available: rooms.filter((r) => r.type === 'single' && r.status === 'available').length,
    },
    {
      type: 'Double',
      booked: rooms.filter((r) => r.type === 'double' && r.status === 'occupied').length,
      available: rooms.filter((r) => r.type === 'double' && r.status === 'available').length,
    },
    {
      type: 'Suite',
      booked: rooms.filter((r) => r.type === 'suite' && r.status === 'occupied').length,
      available: rooms.filter((r) => r.type === 'suite' && r.status === 'available').length,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Reports & Analytics</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Export PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Export Excel
                </button>
              </div>
            </div>

            {/* Generated Report Display Section */}
            {generatedReport && (
              <div
                ref={reportRef}
                className="bg-white rounded-lg p-8 mb-8 border-2 border-purple-200"
              >
                <div className="text-center mb-8 border-b pb-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {generatedReport.title}
                  </h2>
                  <p className="text-gray-600">
                    Generated: {generatedReport.generatedDate}
                  </p>
                </div>

                {/* Reservation Report */}
                {generatedReport.title === 'Reservation Report' && (
                  <div>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Reservations</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {generatedReport.totalBookings}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sales Report */}
                {generatedReport.title === 'Sales Report' && (
                  <div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Room Revenue</p>
                        <p className="text-2xl font-bold text-green-600">₱{generatedReport.roomRevenue}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Event Revenue</p>
                        <p className="text-2xl font-bold text-purple-600">₱{generatedReport.eventRevenue}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">₱{generatedReport.totalRevenue}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Report */}
                {generatedReport.title === 'Customer Report' && (
                  <div>
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Customers</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {generatedReport.totalCustomers}
                      </p>
                    </div>
                  </div>
                )}

                {/* Room Usage Report */}
                {generatedReport.title === 'Room Usage Report' && (
                  <div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Occupied Rooms</p>
                        <p className="text-3xl font-bold text-green-600">{generatedReport.occupiedRooms}</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Available Rooms</p>
                        <p className="text-3xl font-bold text-yellow-600">{generatedReport.availableRooms}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Occupancy Rate</p>
                        <p className="text-3xl font-bold text-blue-600">{generatedReport.occupancyRate}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Export Buttons - Show when report is generated */}
            {generatedReport && (
              <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Options</h3>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
                  >
                    <Download size={18} />
                    Download Excel
                  </button>
                  <button
                    onClick={handleClearReport}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition font-medium"
                  >
                    <FileText size={18} />
                    Clear Report
                  </button>
                </div>
              </div>
            )}

            {/* Generate Reports Section */}
            <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={handleGenerateReservationReport}
                  className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FileText size={16} />
                  Reservation Report
                </button>
                <button
                  onClick={handleGenerateSalesReport}
                  className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <BarChart3 size={16} />
                  Sales Report
                </button>
                <button
                  onClick={handleGenerateCustomerReport}
                  className="px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FileText size={16} />
                  Customer Report
                </button>
                <button
                  onClick={handleGenerateRoomUsageReport}
                  className="px-4 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <BarChart3 size={16} />
                  Room Usage Report
                </button>
              </div>
            </div>

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
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {totalBookings}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">All bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Avg Occupancy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {avgOccupancy}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Current rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Occupied Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {occupiedRooms}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Of {rooms.length} total</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Monthly Bookings & Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Bookings & Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="bookings"
                        stroke="#3b82f6"
                        name="Bookings"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Room Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Type Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={roomTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="booked" fill="#ef4444" name="Occupied" />
                      <Bar dataKey="available" fill="#10b981" name="Available" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Booking Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Status Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {bookings.filter((b) => b.status === 'pending').length}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {bookings.filter((b) => b.status === 'confirmed').length}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Checked-In</p>
                    <p className="text-2xl font-bold text-green-600">
                      {bookings.filter((b) => b.status === 'checked-in').length}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Checked-Out</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {bookings.filter((b) => b.status === 'checked-out').length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">
                      {bookings.filter((b) => b.status === 'cancelled').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
