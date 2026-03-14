import { useState } from 'react';
import { Download, FileText, BarChart3, TrendingUp, Users } from 'lucide-react';
import { UserRole } from '../../App';

interface FirmReportsProps {
  userRole: UserRole;
}

export default function FirmReports({ userRole }: FirmReportsProps) {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('monthly');

  const reportTypes = [
    { id: 'overview', label: 'Firm Overview', icon: BarChart3 },
    { id: 'financial', label: 'Financial Summary', icon: TrendingUp },
    { id: 'productivity', label: 'Productivity Report', icon: Users },
    { id: 'cases', label: 'Case Analytics', icon: FileText },
  ];

  const firmStats = [
    { label: 'Active Cases', value: '47', change: '+6.3%', trend: 'up' },
    { label: 'Total Revenue (MTD)', value: '$284.5K', change: '+12.1%', trend: 'up' },
    { label: 'Billable Hours', value: '1,847', change: '+8.5%', trend: 'up' },
    { label: 'Client Satisfaction', value: '4.7/5', change: '+0.2', trend: 'up' },
  ];

  const teamPerformance = [
    { name: 'Michael Chen', cases: 8, tasksCompleted: 42, hours: 142, rating: 4.8 },
    { name: 'Lisa Martinez', cases: 6, tasksCompleted: 38, hours: 128, rating: 4.7 },
    { name: 'Sarah Mitchell', cases: 12, tasksCompleted: 56, hours: 168, rating: 4.9 },
  ];

  const caseAnalytics = [
    { type: 'Civil Litigation', active: 12, closed: 3, avgDuration: 180, successRate: 92 },
    { type: 'Employment Law', active: 8, closed: 2, avgDuration: 120, successRate: 88 },
    { type: 'Personal Injury', active: 9, closed: 4, avgDuration: 240, successRate: 95 },
    { type: 'Commercial', active: 7, closed: 2, avgDuration: 90, successRate: 86 },
    { type: 'Estate Planning', active: 6, closed: 5, avgDuration: 60, successRate: 98 },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Firm Reports</h1>
            <p className="text-gray-600">Comprehensive analytics and performance reports</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="weekly">Last Week</option>
              <option value="monthly">Last Month</option>
              <option value="quarterly">Last Quarter</option>
              <option value="yearly">Last Year</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="flex gap-2 border-b border-gray-200">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`
                  flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors
                  ${selectedReport === type.id 
                    ? 'border-gray-900 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {firmStats.map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Team Performance */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Team Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Attorney</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Active Cases</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tasks Completed</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Billable Hours</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teamPerformance.map((member, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{member.cases}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{member.tasksCompleted}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{member.hours}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">★ {member.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Case Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Case Distribution by Type</h2>
            <div className="space-y-3">
              {caseAnalytics.map((item, index) => {
                const total = item.active + item.closed;
                const percentage = (item.active / total) * 100;
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">{item.type}</span>
                      <span className="text-gray-600">{item.active} active / {item.closed} closed</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'financial' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Financial Summary - January 2026</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-2">Total Billed</div>
                <div className="text-3xl font-semibold text-gray-900 mb-1">$284,500</div>
                <div className="text-sm text-green-600">+12.1% from last month</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Total Collected</div>
                <div className="text-3xl font-semibold text-green-600 mb-1">$267,400</div>
                <div className="text-sm text-gray-600">94% collection rate</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Outstanding</div>
                <div className="text-3xl font-semibold text-yellow-600 mb-1">$17,100</div>
                <div className="text-sm text-gray-600">6% of total billed</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Revenue by Case Type</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Civil Litigation</span>
                <span className="text-sm font-semibold text-gray-900">$98,400 (34.6%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Personal Injury</span>
                <span className="text-sm font-semibold text-gray-900">$85,200 (29.9%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Employment Law</span>
                <span className="text-sm font-semibold text-gray-900">$56,800 (20.0%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Commercial</span>
                <span className="text-sm font-semibold text-gray-900">$28,500 (10.0%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estate Planning</span>
                <span className="text-sm font-semibold text-gray-900">$15,600 (5.5%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'productivity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="text-sm text-gray-600 mb-1">Total Tasks</div>
              <div className="text-2xl font-semibold text-gray-900">136</div>
              <div className="text-xs text-green-600 mt-1">+8.5% vs last month</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
              <div className="text-2xl font-semibold text-gray-900">92%</div>
              <div className="text-xs text-green-600 mt-1">Above target (90%)</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="text-sm text-gray-600 mb-1">Avg. Task Duration</div>
              <div className="text-2xl font-semibold text-gray-900">3.2 days</div>
              <div className="text-xs text-gray-600 mt-1">Within expected range</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Team Productivity Metrics</h2>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Team Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tasks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Completion %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamPerformance.map((member, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.tasksCompleted}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.hours}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">95%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReport === 'cases' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Case Analytics by Type</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Case Type</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Active</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Closed</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Avg Duration</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {caseAnalytics.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">{item.type}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{item.active}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{item.closed}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{item.avgDuration} days</td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-green-600">{item.successRate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
