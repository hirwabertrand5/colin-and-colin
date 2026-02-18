import { useState } from 'react';
import { Search, Plus, Edit, Trash2, UserPlus } from 'lucide-react';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // ✅ Replace demo names with Rwandan context users
  const users = [
  { id: '1', name: 'Gatete Colin', email: 'colin@colinandcolin.com', role: 'Managing Director', status: 'Active', lastLogin: '2026-01-30 07:45' },
  { id: '2', name: 'Ninsima James', email: 'james@colinandcolin.com', role: 'Lawyer', status: 'Active', lastLogin: 'N/A' },
  { id: '3', name: 'Kayumba Steven', email: 'steven@colinandcolin.com', role: 'Lawyer', status: 'Active', lastLogin: 'N/A' },
  { id: '4', name: 'Manishimwe Cedrick', email: 'cedrick@colinandcolin.com', role: 'Junior Associate', status: 'Active', lastLogin: 'N/A' },
  { id: '5', name: 'Mushimiyimana Janviere', email: 'Mjanviere@colinandcolin.com', role: 'Executive Assistant', status: 'Active', lastLogin: '2026-01-29 17:12' },
  { id: '6', name: 'Uwase Linda', email: 'linda@colinandcolin.com', role: 'Intern', status: 'Active', lastLogin: 'N/A' },
];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Managing Partner': return 'bg-purple-100 text-purple-700';
      case 'Associate Lawyer': return 'bg-blue-100 text-blue-700';
      case 'Executive Assistant': return 'bg-green-100 text-green-700';
      case 'Trainee Associate': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) =>
    status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">User Management</h1>
            <p className="text-gray-600">Manage firm user accounts and system access</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{user.lastLogin}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Users</div>
          <div className="text-2xl font-semibold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Active Users</div>
          <div className="text-2xl font-semibold text-green-600">
            {users.filter((u) => u.status === 'Active').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Partners</div>
          <div className="text-2xl font-semibold text-gray-900">
            {users.filter((u) => u.role === 'Managing Partner').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Associates</div>
          <div className="text-2xl font-semibold text-gray-900">
            {users.filter((u) => u.role.includes('Associate')).length}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <UserPlus className="w-6 h-6 text-gray-700 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Egide Nshimiyimana"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="egide@colinandcolin.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400">
                  <option>Associate Lawyer</option>
                  <option>Managing Partner</option>
                  <option>Executive Assistant</option>
                  <option>Trainee Associate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}