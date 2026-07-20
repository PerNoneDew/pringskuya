import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../lib/context';
import { Download } from 'lucide-react';

export function AdminHeader() {
  const navigate = useNavigate();
  const { currentUser, logout } = useBooking();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Pring Kuyas Inn Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-800">PRING KUYAS INN</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Download size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-lg">
            <span className="text-sm text-gray-700">{currentUser.firstName || currentUser.name || 'Admin'}</span>
            <span className="text-gray-400">▼</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-2 py-1"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
