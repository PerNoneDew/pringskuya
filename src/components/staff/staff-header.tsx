import { useBooking } from '../../lib/context';

export function StaffHeader() {
  const { currentUser } = useBooking();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Pring Kuyas Inn Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-800">PRING KUYA'S INN</h1>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-lg">
          <span className="text-sm text-gray-700">{currentUser.firstName || currentUser.name || 'Staff'}</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Staff
          </span>
        </div>
      </div>
    </header>
  );
}
