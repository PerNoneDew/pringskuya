import { AdminSidebar } from '../components/admin/sidebar';
import { AdminHeader } from '../components/admin/header';
import { MetricCard } from '../components/admin/metric-card';
import { RecentReservations } from '../components/admin/recent-reservations';
import { RevenueChart } from '../components/admin/revenue-chart';
import { OccupancyChart } from '../components/admin/occupancy-chart';
import { useBooking } from '../lib/context';
import { Calendar, DoorOpen, Users, CreditCard, Gift, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function AdminDashboard() {
  const { getMetrics, eventBookings, bookings, services } = useBooking();
  const metrics = getMetrics();

  const totalEventRevenue = eventBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalRoomRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const confirmedEvents = eventBookings.filter((b) => b.status === 'confirmed').length;

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-0">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <MetricCard
                title="Today's Bookings"
                value={metrics.todaysBookings}
                icon={<Calendar size={32} />}
                backgroundColor="bg-red-500"
              />
              <MetricCard
                title="Available Rooms"
                value={metrics.availableRooms}
                icon={<DoorOpen size={32} />}
                backgroundColor="bg-blue-500"
              />
              <MetricCard
                title="Checked-in Guests"
                value={metrics.checkedInGuests}
                icon={<Users size={32} />}
                backgroundColor="bg-green-500"
              />
              <MetricCard
                title="Pending Payments"
                value={metrics.pendingPayments}
                icon={<CreditCard size={32} />}
                backgroundColor="bg-red-500"
              />
              <MetricCard
                title="Confirmed Events"
                value={confirmedEvents}
                icon={<Gift size={32} />}
                backgroundColor="bg-purple-500"
              />
              <MetricCard
                title="Active Services"
                value={services.filter((s) => s.available).length}
                icon={<Utensils size={32} />}
                backgroundColor="bg-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentReservations />
              </div>
              <div>
                <RevenueChart />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OccupancyChart />
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Room Bookings</p>
                    <p className="text-2xl font-bold text-blue-600">PHP {totalRoomRevenue}</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-1">Event Bookings</p>
                    <p className="text-2xl font-bold text-purple-600">PHP {totalEventRevenue}</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">PHP {totalRoomRevenue + totalEventRevenue}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
