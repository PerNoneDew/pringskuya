export function AdminHeader() {
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
      </div>
    </header>
  );
}
