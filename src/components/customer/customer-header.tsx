import { Link } from 'react-router-dom';

interface CustomerHeaderProps {
  currentPage?: 'rooms' | 'events' | 'bookings';
}

export function CustomerHeader({ currentPage = 'rooms' }: CustomerHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
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
