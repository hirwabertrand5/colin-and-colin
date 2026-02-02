import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { UserRole } from '../../App';

interface TaskBoardProps {
  userRole: UserRole;
}

export default function TaskBoard({ userRole }: TaskBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const tasks = [
    { id: '1', title: 'Draft Motion to Dismiss', case: 'Uwase Case', assignee: 'Michael Chen', status: 'In Progress', priority: 'High', dueDate: '2026-01-31', requiresApproval: true },
    { id: '2', title: 'Client Interview - Deposition Prep', case: 'Twagirayezu Employment', assignee: 'Michael Chen', status: 'Not Started', priority: 'High', dueDate: '2026-01-30', requiresApproval: false },
    { id: '3', title: 'Review Discovery Documents', case: 'Johnson Injury Claim', assignee: 'Michael Chen', status: 'In Progress', priority: 'Medium', dueDate: '2026-02-02', requiresApproval: false },
    { id: '4', title: 'Research Case Precedents', case: 'Dereva Ltd', assignee: 'Lisa Martinez', status: 'Not Started', priority: 'Medium', dueDate: '2026-02-03', requiresApproval: false },
    { id: '5', title: 'Invoice Approval - Agasaro Ltd', case: 'Corporate Advisory', assignee: 'Sarah Mitchell', status: 'Pending Approval', priority: 'Medium', dueDate: '2026-02-01', requiresApproval: true },
    { id: '6', title: 'Settlement Agreement Review', case: 'Dereva Ltd', assignee: 'Sarah Mitchell', status: 'Pending Approval', priority: 'High', dueDate: '2026-01-30', requiresApproval: true },
    { id: '7', title: 'Client Deposition Prep', case: 'Uwase Case', assignee: 'Sarah Mitchell', status: 'Completed', priority: 'High', dueDate: '2026-01-28', requiresApproval: false },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Not Started': return 'bg-gray-100 text-gray-600';
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.case.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    // Role-based filtering
    if (userRole === 'associate' && task.assignee !== 'Michael Chen') {
      return false;
    }

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingApprovalTasks = tasks.filter(t => t.status === 'Pending Approval');

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Tasks</h1>
            <p className="text-gray-600">
              {userRole === 'managing_partner' && 'Manage all firm tasks and approvals'}
              {userRole === 'associate' && 'Your assigned tasks and deadlines'}
              {userRole === 'executive_assistant' && 'Task coordination and tracking'}
            </p>
          </div>
          {pendingApprovalTasks.length > 0 && userRole === 'managing_partner' && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded">
              {pendingApprovalTasks.length} Pending Approval
            </span>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="all">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {['Not Started', 'In Progress', 'Pending Approval', 'Completed'].map((status) => {
          const statusTasks = filteredTasks.filter(t => t.status === status);

          return (
            <div key={status} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">{status}</h3>
                <span className="px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded">
                  {statusTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {statusTasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="block bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.requiresApproval && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          Approval
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-2">{task.title}</p>
                    <p className="text-xs text-gray-500 mb-2">{task.case}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{task.assignee}</span>
                      <span>Due {task.dueDate}</span>
                    </div>
                  </Link>
                ))}
                {statusTasks.length === 0 && (
                  <div className="text-center py-6 text-sm text-gray-400">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-semibold text-gray-900 mb-1">
            {filteredTasks.filter(t => t.status === 'Not Started').length}
          </div>
          <div className="text-sm text-gray-600">Not Started</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-semibold text-blue-600 mb-1">
            {filteredTasks.filter(t => t.status === 'In Progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-semibold text-yellow-600 mb-1">
            {filteredTasks.filter(t => t.status === 'Pending Approval').length}
          </div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-semibold text-green-600 mb-1">
            {filteredTasks.filter(t => t.status === 'Completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>
    </div>
  );
}