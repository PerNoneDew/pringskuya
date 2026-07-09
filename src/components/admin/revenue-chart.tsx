'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', revenue: 100 },
  { month: 'Feb', revenue: 150 },
  { month: 'Mar', revenue: 200 },
  { month: 'Apr', revenue: 250 },
  { month: 'May', revenue: 300 },
  { month: 'Jun', revenue: 280 },
  { month: 'Jul', revenue: 320 },
  { month: 'Aug', revenue: 350 },
];

export function RevenueChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Revenue</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            fill="#dbeafe"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
