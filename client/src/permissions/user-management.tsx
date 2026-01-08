import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, CheckCircle, AlertCircle } from 'lucide-react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  lastLogin?: Date;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

export interface UserManagementProps {
  users: User[];
  roles: string[];
  onAddUser?: (user: Partial<User>) => Promise<void>;
  onEditUser?: (userId: string, updates: Partial<User>) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
  onChangeUserRole?: (userId: string, roleId: string) => Promise<void>;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  roles,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onChangeUserRole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string>('');

  const [formData, setFormData] = useState<Partial<User>>({
    email: '',
    firstName: '',
    lastName: '',
    role: roles[0] || '',
  });

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName) return;

    setActionInProgress('add');
    try {
      await onAddUser?.(formData);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: roles[0] || '',
      });
      setShowAddForm(false);
    } finally {
      setActionInProgress('');
    }
  };

  const handleEditUser = async () => {
    if (!editingUserId) return;

    setActionInProgress(editingUserId);
    try {
      await onEditUser?.(editingUserId, formData);
      setEditingUserId(null);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: roles[0] || '',
      });
    } finally {
      setActionInProgress('');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user?')) return;

    setActionInProgress(userId);
    try {
      await onDeleteUser?.(userId);
    } finally {
      setActionInProgress('');
    }
  };

  const handleStartEdit = (user: User) => {
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
    setEditingUserId(user.id);
  };

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: User['status']): string => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'inactive':
        return 'text-yellow-400';
      case 'suspended':
        return 'text-red-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">User Management</h2>
        {onAddUser && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {(showAddForm || editingUserId) && (
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 space-y-3">
          <h3 className="text-white font-medium">
            {editingUserId ? 'Edit User' : 'Add New User'}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              placeholder="Email"
              value={formData.email || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={!!editingUserId}
              className="bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 disabled:opacity-50"
            />
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              className="bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              className="bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
            />
            <select
              value={formData.role || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
              className="bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={editingUserId ? handleEditUser : handleAddUser}
              disabled={actionInProgress !== ''}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 text-white rounded font-medium transition-colors"
            >
              {actionInProgress !== '' ? 'Saving...' : editingUserId ? 'Update' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingUserId(null);
                setFormData({
                  email: '',
                  firstName: '',
                  lastName: '',
                  role: roles[0] || '',
                });
              }}
              className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-dark-900 border border-dark-700 rounded px-3 py-2 pl-10 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
        />
      </div>

      {/* Users table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-700">
              <th className="px-4 py-3 text-left text-dark-400 font-medium">
                User
              </th>
              <th className="px-4 py-3 text-left text-dark-400 font-medium">
                Email
              </th>
              <th className="px-4 py-3 text-left text-dark-400 font-medium">
                Role
              </th>
              <th className="px-4 py-3 text-left text-dark-400 font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-left text-dark-400 font-medium">
                Last Login
              </th>
              <th className="px-4 py-3 text-left text-dark-400 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-dark-700 hover:bg-dark-800 transition-colors"
              >
                <td className="px-4 py-3 text-white">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-3 text-dark-300">{user.email}</td>
                <td className="px-4 py-3">
                  {onChangeUserRole ? (
                    <select
                      value={user.role}
                      onChange={(e) =>
                        onChangeUserRole(user.id, e.target.value)
                      }
                      className="bg-dark-700 border border-dark-600 rounded px-2 py-1 text-white text-xs focus:outline-none"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-dark-300">{user.role}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className={`flex items-center gap-2 ${getStatusColor(user.status)}`}>
                    {getStatusIcon(user.status)}
                    <span className="capitalize">
                      {user.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-dark-400 text-xs">
                  {user.lastLogin
                    ? user.lastLogin.toLocaleDateString()
                    : 'Never'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {onEditUser && (
                      <button
                        onClick={() => handleStartEdit(user)}
                        className="p-1 hover:bg-dark-700 rounded transition-colors text-dark-400 hover:text-primary-400"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteUser && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={actionInProgress === user.id}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors text-dark-400 hover:text-red-400 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-dark-400">
          <p>No users found</p>
        </div>
      )}
    </div>
  );
};
