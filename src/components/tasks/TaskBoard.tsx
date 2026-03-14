import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { UserRole } from '../../App';
import { getAllTasks, TaskData } from '../../services/taskService';
import { getAllCases, CaseData } from '../../services/caseService';

interface TaskBoardProps {
  userRole: UserRole;
}

type BoardColumnId = 'Not Started' | 'In Progress' | 'Pending Approval' | 'Completed';

export default function TaskBoard({ userRole }: TaskBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | BoardColumnId>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load tasks + cases (cases used to display "case number" on cards)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [tasksData, casesData] = await Promise.all([
          getAllTasks(),
          getAllCases(),
        ]);
        setTasks(tasksData);
        setCases(casesData);
      } catch (err: any) {
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Map caseId -> caseNo (or parties)
  const caseMap = useMemo(() => {
    const map = new Map<string, CaseData>();
    cases.forEach((c) => {
      if (c._id) map.set(c._id, c);
    });
    return map;
  }, [cases]);

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

  // Board column logic:
  const getColumn = (t: TaskData): BoardColumnId => {
    if (t.requiresApproval && t.approvalStatus === 'Pending') return 'Pending Approval';
    // otherwise use normal status
    if (t.status === 'Not Started') return 'Not Started';
    if (t.status === 'In Progress') return 'In Progress';
    return 'Completed';
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const caseLabel = caseMap.get(t.caseId)?.caseNo || caseMap.get(t.caseId)?.parties || '';

      const matchesSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(caseLabel).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.assignee || '').toLowerCase().includes(searchTerm.toLowerCase());

      const column = getColumn(t);
      const matchesStatus = filterStatus === 'all' || column === filterStatus;
      const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, filterStatus, filterPriority, caseMap]);

  const pendingApprovalCount = useMemo(() => {
    return tasks.filter((t) => t.requiresApproval && t.approvalStatus === 'Pending').length;
  }, [tasks]);

  const columns: BoardColumnId[] = ['Not Started', 'In Progress', 'Pending Approval', 'Completed'];

  const headerSubtitle =
    userRole === 'managing_director'
      ? 'Manage all firm tasks and approvals'
      : userRole === 'associate'
        ? 'Your assigned tasks and deadlines'
        : 'Task coordination and tracking';

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Tasks</h1>
            <p className="text-gray-600">{headerSubtitle}</p>
          </div>

          {pendingApprovalCount > 0 && userRole === 'managing_director' && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded">
              {pendingApprovalCount} Pending Approval
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

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
              onChange={(e) => setFilterStatus(e.target.value as any)}
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
              onChange={(e) => setFilterPriority(e.target.value as any)}
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

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading tasks...</div>
      ) : (
        /* Kanban Board */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => getColumn(t) === col);

            return (
              <div key={col} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-sm">{col}</h3>
                  <span className="px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.map((task) => {
                    const relatedCase = caseMap.get(task.caseId);
                    const caseLabel = relatedCase?.caseNo || relatedCase?.parties || '—';

                    const showApprovalPill =
                      task.requiresApproval && task.approvalStatus === 'Pending';

                    return (
                      <Link
                        key={task._id}
                        to={`/tasks/${task._id}`}
                        className="block bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>

                          {showApprovalPill && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                              Approval
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-gray-900 mb-2">{task.title}</p>
                        <p className="text-xs text-gray-500 mb-2">{caseLabel}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{task.assignee}</span>
                          <span>Due {task.dueDate}</span>
                        </div>
                      </Link>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="text-center py-6 text-sm text-gray-400">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}