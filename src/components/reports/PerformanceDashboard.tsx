import { TrendingUp, CheckSquare, Clock, Award } from 'lucide-react';
import { UserRole } from '../../App';

interface PerformanceDashboardProps {
  userRole: UserRole;
}

export default function PerformanceDashboard({ userRole }: PerformanceDashboardProps) {
  const stats = [
    { label: 'Tasks Completed', value: '42', target: '50', icon: CheckSquare, percentage: 84 },
    { label: 'Billable Hours', value: '142', target: '160', icon: Clock, percentage: 89 },
    { label: 'On-time Completion', value: '95%', target: '90%', icon: TrendingUp, percentage: 105 },
    { label: 'Client Satisfaction', value: '4.8', target: '4.5', icon: Award, percentage: 107 },
  ];

  const monthlyData = [
    { month: 'Aug', tasks: 38, hours: 135, rating: 4.6 },
    { month: 'Sep', tasks: 41, hours: 142, rating: 4.7 },
    { month: 'Oct', tasks: 39, hours: 138, rating: 4.5 },
    { month: 'Nov', tasks: 44, hours: 148, rating: 4.8 },
    { month: 'Dec', tasks: 40, hours: 140, rating: 4.7 },
    { month: 'Jan', tasks: 42, hours: 142, rating: 4.8 },
  ];

  const tasksByCategory = [
    { category: 'Legal Research', completed: 12, total: 15, hours: 42 },
    { category: 'Document Drafting', completed: 10, total: 12, hours: 38 },
    { category: 'Client Communication', completed: 8, total: 8, hours: 24 },
    { category: 'Court Appearances', completed: 5, total: 6, hours: 22 },
    { category: 'Case Review', completed: 7, total: 9, hours: 16 },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Performance</h1>
        <p className="text-gray-600">Track your productivity and achievements</p>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isAboveTarget = stat.percentage >= 100;
          
          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <div className={`flex items-center text-xs ${isAboveTarget ? 'text-green-600' : 'text-yellow-600'}`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.percentage}%
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
              <div className="text-xs text-gray-500">Target: {stat.target}</div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isAboveTarget ? 'bg-green-600' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Performance Trend</h2>
          <div className="space-y-4">
            {monthlyData.map((data, index) => {
              const maxTasks = 50;
              const taskPercentage = (data.tasks / maxTasks) * 100;
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900">{data.month}</span>
                    <div className="flex gap-4 text-xs text-gray-600">
                      <span>{data.tasks} tasks</span>
                      <span>{data.hours}h</span>
                      <span>★ {data.rating}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-700"
                      style={{ width: `${taskPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks by Category */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tasks by Category (Jan 2026)</h2>
          <div className="space-y-4">
            {tasksByCategory.map((item, index) => {
              const completionRate = (item.completed / item.total) * 100;
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900">{item.category}</span>
                    <div className="flex gap-3 text-xs text-gray-600">
                      <span>{item.completed}/{item.total}</span>
                      <span>{item.hours}h</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${completionRate === 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Top Performer</p>
              <p className="text-xs text-gray-500">Highest completion rate in Q4 2025</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">100 Tasks Milestone</p>
              <p className="text-xs text-gray-500">Completed 100+ tasks this quarter</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Consistent Growth</p>
              <p className="text-xs text-gray-500">Performance improved 15% YoY</p>
            </div>
          </div>
        </div>

        {/* Feedback Summary */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
  <h2 className="font-semibold text-gray-900 mb-4">Recent Feedback</h2>
  <div className="space-y-4">
    
    <div className="border-l-4 border-green-500 pl-4 py-2">
      <p className="text-sm text-gray-900 mb-1">
        "Excellent preparation for the RS/SCP/RCOM 00388/2024/TC submissions. 
        Clear structure and strong legal grounding."
      </p>
      <p className="text-xs text-gray-500">
        Ninsima James • Feb 18, 2026
      </p>
    </div>

    <div className="border-l-4 border-blue-500 pl-4 py-2">
      <p className="text-sm text-gray-900 mb-1">
        "Well-coordinated documentation and timely filing for RSOC 00001/2025/HC/KIG."
      </p>
      <p className="text-xs text-gray-500">
        Mushimiyimana Janviere • Feb 16, 2026
      </p>
    </div>

    <div className="border-l-4 border-green-500 pl-4 py-2">
      <p className="text-sm text-gray-900 mb-1">
        "Consistent follow-up on court deadlines and internal case tracking."
      </p>
      <p className="text-xs text-gray-500">
        Internal Performance Review • Feb 10, 2026
      </p>
    </div>

  </div>
</div>

      </div>
    </div>
  );
}
