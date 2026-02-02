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

  // ✅ Localized cases
  const cases = [
    { id: '1', name: 'Uwimana vs Kigali Holdings', caseNumber: 'RWA-2026-CIV-0147', client: 'Jane Uwimana', type: 'Land Dispute', stage: 'Discovery', priority: 'High', assignedTo: 'Jean Karangwa', status: 'Active', lastUpdated: '2026-01-29' },
    { id: '2', name: 'Niyonsaba Employment Dispute', caseNumber: 'RWA-2025-EMP-0321', client: 'Grace Niyonsaba', type: 'Employment Law', stage: 'Pre-trial', priority: 'High', assignedTo: 'Aline Nirere', status: 'Active', lastUpdated: '2026-01-28' },
    { id: '3', name: 'Mugenzi Injury Claim', caseNumber: 'RWA-2026-PI-0089', client: 'Eric Mugenzi', type: 'Recovery', stage: 'Investigation', priority: 'Medium', assignedTo: 'Jean Karangwa', status: 'Active', lastUpdated: '2026-01-27' },
    { id: '4', name: 'Twagirayezu Commercial Matter', caseNumber: 'RWA-2025-BIZ-0451', client: 'Twagirayezu Holdings', type: 'Corporate/Commercial', stage: 'Due Diligence', priority: 'Medium', assignedTo: 'Gatete Colin', status: 'Active', lastUpdated: '2026-01-26' },
    { id: '5', name: 'Estate of Mukamana', caseNumber: 'RWA-2026-EST-0145', client: 'Mukamana Family', type: 'Estate Planning', stage: 'Initial Review', priority: 'Low', assignedTo: 'Gatete Colin', status: 'Active', lastUpdated: '2026-01-29' },
    { id: '6', name: 'Kamanzi vs City of Kigali', caseNumber: 'RWA-2026-CIV-0203', client: 'Didier Kamanzi', type: 'Land Dispute', stage: 'Hearing Preparation', priority: 'Medium', assignedTo: 'Aline Nirere', status: 'Active', lastUpdated: '2026-01-27' },
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

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Case Management</h1>
            <p className="text-gray-600">Track firm-wide matters, assignments, and progress</p>
          </div>
          {(userRole === 'managing_partner' || userRole === 'executive_assistant') && (
            <Link to="/cases/new" className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Case
            </Link>
          )}
        </div>

        {/* Search/Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by case name, number, or client..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="On Hold">On Hold</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Case Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Case', 'Client', 'Type', 'Stage', 'Priority', 'Assigned To', 'Last Updated', 'Actions'].map((header) => (
                  <th key={header} className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCases.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.caseNumber}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-900">{item.client}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{item.type}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {item.stage}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{item.assignedTo}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{item.lastUpdated}</td>
                  <td className="px-5 py-4">
                    <Link to={`/cases/${item.id}`} className="text-sm text-gray-700 hover:text-gray-900 font-medium">
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
            <p className="text-gray-500">No cases found matching your search</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredCases.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing {filteredCases.length} of {cases.length} cases</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}