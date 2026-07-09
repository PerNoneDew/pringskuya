import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useBooking } from '../../lib/context';
import { Settings, User, Bell, Lock, LogOut, CreditCard } from 'lucide-react';
import { showSuccessNotification, showErrorNotification } from '../../lib/notifications';

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const { currentUser, paymentConfig, setPaymentConfig, adminPassword, changeAdminPassword } = useBooking();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gcashNumber, setGcashNumber] = useState(paymentConfig.gcashNumber || '');
  const [mayaNumber, setMayaNumber] = useState(paymentConfig.mayaNumber || '');

  // Log Out
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      showSuccessNotification({
        title: 'Logged Out',
        description: 'You have been logged out successfully.',
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  };

  // Update Personal Information
  const handleUpdatePersonalInfo = () => {
    showSuccessNotification({
      title: 'Profile Updated',
      description: 'Your personal information has been saved successfully.',
    });
  };

  // Change Password
  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showErrorNotification({
        title: 'Missing Fields',
        description: 'Please fill in all password fields.',
      });
      return;
    }
    if (currentPassword !== adminPassword) {
      showErrorNotification({
        title: 'Invalid Current Password',
        description: 'The current password you entered is incorrect.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorNotification({
        title: 'Password Mismatch',
        description: 'New passwords do not match. Please try again.',
      });
      return;
    }
    changeAdminPassword(newPassword);
    showSuccessNotification({
      title: 'Password Changed',
      description: 'Your password has been changed successfully. The new password will be used for your next login.',
    });
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Update Payment Configuration
  const handleUpdatePaymentConfig = () => {
    if (!gcashNumber && !mayaNumber) {
      showErrorNotification({
        title: 'Missing Information',
        description: 'Please enter at least one payment method number.',
      });
      return;
    }
    setPaymentConfig({
      gcashNumber,
      mayaNumber,
      lastUpdated: new Date().toISOString(),
    });
    showSuccessNotification({
      title: 'Payment Methods Updated',
      description: 'Your payment methods have been saved successfully.',
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              System Settings
            </h2>

            {/* Admin Profile */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={24} className="text-blue-600" />
                  Admin Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={currentUser.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    defaultValue="System Administrator"
                    readOnly
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdatePersonalInfo}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods Configuration */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard size={24} className="text-purple-600" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-600">
                  Configure payment methods available to customers. Customers will be able to send payments to these numbers or pay at the counter.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GCash Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={gcashNumber}
                    onChange={(e) => setGcashNumber(e.target.value)}
                    placeholder="e.g., +63 917 123 4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to disable GCash payments
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maya Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={mayaNumber}
                    onChange={(e) => setMayaNumber(e.target.value)}
                    placeholder="e.g., +63 917 234 5678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to disable Maya payments
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Note:</span> Customers will always have the option to pay over the counter, regardless of these settings.
                  </p>
                </div>

                <button
                  onClick={handleUpdatePaymentConfig}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Save Payment Methods
                </button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={24} className="text-orange-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-700">
                    Email alerts for new bookings
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-700">Email alerts for cancellations</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-700">
                    Daily occupancy reports
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-700">Weekly revenue reports</span>
                </label>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock size={24} className="text-red-600" />
                  Security & Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {showChangePassword ? 'Cancel' : 'Change Password'}
                </button>

                {showChangePassword && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="w-full px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      Update Password
                    </button>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Active Sessions</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      Current: Web Browser - Last active: Just now
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
