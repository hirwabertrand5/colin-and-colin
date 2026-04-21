import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Briefcase } from 'lucide-react';
import { UserRole } from '../../App';
import { getAllCases, CaseData } from '../../services/caseService';
import usePageTitle from '../../hooks/usePageTitle';

interface CaseListProps {
  userRole: UserRole;
}

const isAssociateLike = (role: UserRole) => role === 'associate' || role === 'lawyer' || role === 'intern';

export default function CaseList({ userRole }: CaseListProps) {
  const CASES_PER_PAGE = 10;

  usePageTitle('Cases');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [cases, setCases] = useState<CaseData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const assocLike = isAssociateLike(userRole);
  const canManageCases = userRole === 'managing_director' || userRole === 'executive_assistant';

  useEffect(() => {
    loadCases();
    // eslint-disable-next-line
  }, []);

  const loadCases = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllCases();
      setCases(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-600';
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
      case 'On Boarding':
        return 'bg-gray-100 text-gray-700';
      case 'Submission':
      case 'Under Submission':
        return 'bg-orange-100 text-orange-700';
      case 'Pre trial':
        return 'bg-indigo-100 text-indigo-600';
      case 'Mediation':
        return 'bg-yellow-100 text-yellow-700';
      case 'Hearing':
        return 'bg-blue-100 text-blue-600';
      case 'Appeal':
        return 'bg-purple-100 text-purple-600';
      case 'Pronouncement':
        return 'bg-pink-100 text-pink-600';
      case 'Cope of Judgement':
        return 'bg-orange-100 text-orange-600';
      case 'Execution':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.parties?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseNo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / CASES_PER_PAGE));
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * CASES_PER_PAGE,
    currentPage * CASES_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              {assocLike ? 'My Cases' : 'Case Management'}
            </h1>
            <p className="text-gray-600">
              {assocLike ? 'Cases assigned to you' : 'Track firm-wide matters, assignments, and progress'}
            </p>
          </div>

          {canManageCases && (
            <Link
              to="/cases/new"
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Case
            </Link>
          )}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by case number or parties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="On Boarding">On Boarding</option>
            <option value="Submission">Submission</option>
            <option value="Under Submission">Under Submission</option>
            <option value="Pre trial">Pre trial</option>
            <option value="Mediation">Mediation</option>
            <option value="Hearing">Hearing</option>
            <option value="Appeal">Appeal</option>
            <option value="Pronouncement">Pronouncement</option>
            <option value="Cope of Judgement">Cope of Judgement</option>
            <option value="Execution">Execution</option>
          </select>

          {!assocLike && (
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  'No.',
                  'Case No.',
                  'Parties',
                  'Case Type',
                  'Status',
                  'Priority',
                  'Assigned To',
                  'Date Created',
                  'Last Updated',
                  'Actions',
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {paginatedCases.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 text-sm text-gray-500">
                    {(currentPage - 1) * CASES_PER_PAGE + index + 1}
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{item.caseNo}</td>
                  <td className="px-6 py-5 text-sm text-gray-900">{item.parties}</td>
                  <td className="px-6 py-5 text-sm text-gray-600">{item.caseType}</td>

                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 text-xs font-medium rounded-md ${getStatusColor(item.status || '')}`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 text-xs font-medium rounded-md ${getPriorityColor(item.priority || '')}`}>
                      {item.priority}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">{item.assignedTo}</td>

                  <td className="px-6 py-5 text-sm text-gray-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-500">
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}
                  </td>

                  <td className="px-6 py-5">
                    <Link to={`/cases/${item._id}`} className="text-sm font-medium text-gray-700 hover:text-gray-900">
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <div className="text-center py-12 text-gray-500">Loading cases...</div>}

        {!loading && filteredCases.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No cases found</p>
          </div>
        )}

        {!loading && filteredCases.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * CASES_PER_PAGE + 1}-
              {Math.min(currentPage * CASES_PER_PAGE, filteredCases.length)} of {filteredCases.length} cases
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
