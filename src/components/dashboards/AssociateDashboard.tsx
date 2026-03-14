import { Link } from 'react-router-dom';
import {
  Briefcase,
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar as CalendarIcon,
  TrendingUp
} from 'lucide-react';

export default function AssociateDashboard() {
  const stats = [
    { label: 'My Active Cases', value: '6', icon: Briefcase },
    { label: 'Tasks Due Today', value: '2', icon: AlertTriangle, color: 'red' },
    { label: 'Completed This Week', value: '14', icon: CheckSquare },
    { label: 'Billable Hours (MTD)', value: '151', icon: Clock },
  ];

  const myTasks = [
  {
    id: '1',
    title: 'Draft Statement of Claim – RS/SCP/RCOM 00388/2024/TC',
    case: 'RS/SCP/RCOM 00388/2024/TC',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-02-21',
  },
  {
    id: '2',
    title: 'Prepare Hearing Brief – RSOC 00001/2025/HC/KIG',
    case: 'RSOC 00001/2025/HC/KIG',
    status: 'Not Started',
    priority: 'High',
    dueDate: '2026-02-22',
  },
  {
    id: '3',
    title: 'Organize Client Documentation',
    case: 'RSOC 00001/2025/HC/KIG',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: '2026-02-24',
  },
];


  const myCases = [
  {
    id: '1',
    name: 'RS/SCP/RCOM 00388/2024/TC',
    type: 'Commercial Dispute',
    stage: 'Pre-Trial Submissions',
    progress: 70,
    nextDeadline: '2026-02-25',
  },
  {
    id: '2',
    name: 'RSOC 00001/2025/HC/KIG',
    type: 'Civil Litigation',
    stage: 'Hearing Preparation',
    progress: 55,
    nextDeadline: '2026-02-28',
  },
];


  const upcomingEvents = [
  {
    id: '1',
    title: 'Client Strategy Meeting – RS/SCP/RCOM 00388/2024/TC',
    date: '2026-02-21',
    time: '09:00 AM',
  },
  {
    id: '2',
    title: 'Court Appearance – RSOC 00001/2025/HC/KIG',
    date: '2026-02-22',
    time: '11:30 AM',
  },
  {
    id: '3',
    title: 'Internal Review – Case Progress Update',
    date: '2026-02-24',
    time: '03:00 PM',
  },
];


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'text-blue-600';
      case 'Not Started':
        return 'text-gray-600';
      case 'Completed':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Associate Dashboard</h1>
        <p className="text-gray-600">View assigned cases, tasks & your performance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 ${stat.color === 'red' ? 'bg-red-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${stat.color === 'red' ? 'text-red-600' : 'text-gray-700'}`} />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">My Tasks</h2>
            <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
              {myTasks.filter(t => t.dueDate === '2026-02-01').length} due today
            </span>
          </div>
          <div className="divide-y divide-gray-200">
            {myTasks.map((task) => (
              <div key={task.id} className="px-5 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.case}</p>
                  </div>
                  <button className="ml-4 px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                    View
                  </button>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  Due {task.dueDate}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-200">
            <Link to="/tasks" className="text-sm text-gray-600 hover:text-gray-900">
              View all tasks →
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="px-5 py-4 hover:bg-gray-50">
                <p className="text-sm font-medium text-gray-900 mb-2">{event.title}</p>
                <div className="flex items-center text-xs text-gray-600 mb-1">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {event.date}
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {event.time}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-200">
            <Link to="/calendar" className="text-sm text-gray-600 hover:text-gray-900">
              View calendar →
            </Link>
          </div>
        </div>

        {/* My Cases */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Assigned Cases</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {myCases.map((caseItem) => (
              <div key={caseItem.id} className="px-5 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{caseItem.name}</h3>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {caseItem.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Stage: {caseItem.stage}</p>
                  </div>
                  <button className="ml-4 px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                    Open
                  </button>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{caseItem.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-700 transition-all"
                      style={{ width: `${caseItem.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  Next deadline: {caseItem.nextDeadline}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-200">
            <Link to="/cases" className="text-sm text-gray-600 hover:text-gray-900">
              View all cases →
            </Link>
          </div>
        </div>

        {/* Performance Card */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Performance Snapshot (January 2026)</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tasks Completed</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">42</div>
              <div className="text-xs text-gray-500">+10% vs previous month</div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Billable Hours</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">151</div>
              <div className="text-xs text-gray-500">Target: 160 hours</div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">On-Time Completion</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">96%</div>
              <div className="text-xs text-gray-500">Above firm average</div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-gray-200">
            <Link to="/performance" className="text-sm text-gray-600 hover:text-gray-900">
              View detailed performance →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}