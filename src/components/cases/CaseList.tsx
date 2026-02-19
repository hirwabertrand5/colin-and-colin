import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Briefcase } from 'lucide-react';
import { UserRole } from '../../App';

interface CaseListProps {
  userRole: UserRole;
}

export default function CaseList({ userRole }: CaseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const cases = [
    {
      id: '1',
      courtCaseNumber: 'RS/SCP/RCOM 00388/2024/TC',
      parties: 'NTABWOBA Innocent vs INKOMBE AGRICULTURE LTD',
      type: 'Civil',
      status: 'On-Boarding',
      priority: 'Medium',
      assignedTo: 'Mushimiyimana Janviere',
      lastUpdated: '2026-02-19'
    },
    {
      id: '2',
      courtCaseNumber: 'RSOC 00001/2025/HC/KIG',
      parties: 'GASIZA Eric vs NEW CENTURY DEVELOPMENT Ltd',
      type: 'Labor',
      status: 'Hearing',
      priority: 'High',
      assignedTo: 'Ninsima James',
      lastUpdated: '2026-02-19'
    }
  ];

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
      case 'Pre Trial':
        return 'bg-indigo-100 text-indigo-600';
      case 'Mediation':
        return 'bg-yellow-100 text-yellow-700';
      case 'Hearing':
        return 'bg-blue-100 text-blue-600';
      case 'Appeal':
        return 'bg-purple-100 text-purple-600';
      case 'Pronouncement':
        return 'bg-pink-100 text-pink-600';
      case 'Execution':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.parties.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.courtCaseNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Case Management
            </h1>
            <p className="text-gray-600">
              Track firm-wide matters, assignments, and progress
            </p>
          </div>

          {(userRole === 'managing_partner' ||
            userRole === 'executive_assistant') && (
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
            <option value="Pre Trial">Pre Trial</option>
            <option value="Mediation">Mediation</option>
            <option value="Hearing">Hearing</option>
            <option value="Appeal">Appeal</option>
            <option value="Pronouncement">Pronouncement</option>
            <option value="Execution">Execution</option>
          </select>

          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

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
                  'Type',
                  'Status',
                  'Priority',
                  'Assigned To',
                  'Last Updated',
                  'Actions'
                ].map(header => (
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
              {filteredCases.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-5 text-sm text-gray-500">
                    {index + 1}
                  </td>

                  <td className="px-6 py-5 text-sm font-medium text-gray-900">
                    {item.courtCaseNumber}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-900">
                    {item.parties}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {item.type}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-md ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-md ${getPriorityColor(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {item.assignedTo}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-500">
                    {item.lastUpdated}
                  </td>

                  <td className="px-6 py-5">
                    <Link
                      to={`/cases/${item.id}`}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              No cases found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
