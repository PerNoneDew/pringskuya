import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../../lib/context';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';

interface CustomerHeaderProps {
  currentPage?: 'rooms' | 'events' | 'bookings';
}

export function CustomerHeader({ currentPage = 'rooms' }: CustomerHeaderProps) {
  const navigate = useNavigate();
  const { currentUser, logout } = useBooking();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 py-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Pring Kuyas Inn Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">PRING KUYA'S INN</h1>
              <p className="text-sm text-gray-600">Online Booking System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{currentUser.firstName || currentUser.name || 'Guest'}</span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100 transition"
            >
              <LogOut size={20} className="text-gray-600" />
            </Button>
          </div>
        </div>

        <nav className="flex gap-6">
          <Link
            to="/customer"
            className={`pb-2 font-medium transition-colors duration-0 ${
              currentPage === 'rooms'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Room Bookings
          </Link>
          <Link
            to="/customer/events"
            className={`pb-2 font-medium transition-colors duration-0 ${
              currentPage === 'events'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Events
          </Link>
          <Link
            to="/customer/my-bookings"
            className={`pb-2 font-medium transition-colors duration-0 ${
              currentPage === 'bookings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Bookings
          </Link>
        </nav>
      </div>
    </header>
  );
}
