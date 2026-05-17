import React from 'react';
import { cn } from '@/lib/utils';

export default function StatsCard({ title, value, icon: Icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={cn("p-3 rounded-xl bg-gradient-to-br shadow-lg", colorClasses[color])}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}