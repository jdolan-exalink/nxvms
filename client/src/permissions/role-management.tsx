import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, Check } from 'lucide-react';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
  isSystem?: boolean; // System roles like admin can't be deleted
}

export interface RoleManagementProps {
  roles: Role[];
  availablePermissions: string[];
  onAddRole?: (role: Partial<Role>) => Promise<void>;
  onEditRole?: (roleId: string, updates: Partial<Role>) => Promise<void>;
  onDeleteRole?: (roleId: string) => Promise<void>;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({
  roles,
  availablePermissions,
  onAddRole,
  onEditRole,
  onDeleteRole,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [actionInProgress, setActionInProgress] = useState<string>('');

  const [formData, setFormData] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: [],
  });

  const toggleExpanded = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions?.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...(prev.permissions || []), permission],
    }));
  };

  const handleAddRole = async () => {
    if (!formData.name || !formData.description) return;

    setActionInProgress('add');
    try {
      await onAddRole?.(formData);
      setFormData({
        name: '',
        description: '',
        permissions: [],
      });
      setShowAddForm(false);
    } finally {
      setActionInProgress('');
    }
  };

  const handleEditRole = async () => {
    if (!editingRoleId) return;

    setActionInProgress(editingRoleId);
    try {
      await onEditRole?.(editingRoleId, formData);
      setEditingRoleId(null);
      setFormData({
        name: '',
        description: '',
        permissions: [],
      });
    } finally {
      setActionInProgress('');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Delete this role?')) return;

    setActionInProgress(roleId);
    try {
      await onDeleteRole?.(roleId);
    } finally {
      setActionInProgress('');
    }
  };

  const handleStartEdit = (role: Role) => {
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setEditingRoleId(role.id);
  };

  const permissionCategories: Record<string, string[]> = {
    'Camera Management': [
      'view_cameras',
      'control_ptz',
      'take_snapshot',
      'record_video',
    ],
    'Playback & Export': [
      'view_playback',
      'export_video',
      'edit_clips',
      'download_files',
    ],
    'Events & Bookmarks': [
      'view_events',
      'acknowledge_events',
      'create_bookmarks',
      'manage_bookmarks',
    ],
    'System Management': [
      'manage_users',
      'manage_roles',
      'access_settings',
      'view_health',
      'manage_notifications',
    ],
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Role Management</h2>
        {onAddRole && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {(showAddForm || editingRoleId) && (
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 space-y-4">
          <h3 className="text-white font-medium">
            {editingRoleId ? 'Edit Role' : 'Add New Role'}
          </h3>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Role Name"
              value={formData.name || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
            />

            <textarea
              placeholder="Description"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full h-20 bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
            />

            {/* Permissions */}
            <div>
              <h4 className="text-white font-medium mb-3">Permissions</h4>
              <div className="space-y-3">
                {Object.entries(permissionCategories).map(
                  ([category, permissions]) => (
                    <div key={category}>
                      <h5 className="text-sm text-dark-300 font-medium mb-2">
                        {category}
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {permissions.map((permission) => (
                          <label
                            key={permission}
                            className="flex items-center gap-2 cursor-pointer text-dark-300 hover:text-white transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions?.includes(
                                permission
                              ) || false}
                              onChange={() => togglePermission(permission)}
                              className="w-4 h-4 accent-primary-500"
                            />
                            <span className="text-sm">
                              {permission
                                .split('_')
                                .map(
                                  (w) =>
                                    w.charAt(0).toUpperCase() + w.slice(1)
                                )
                                .join(' ')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-dark-700">
            <button
              onClick={editingRoleId ? handleEditRole : handleAddRole}
              disabled={actionInProgress !== ''}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 text-white rounded font-medium transition-colors"
            >
              {actionInProgress !== '' ? 'Saving...' : editingRoleId ? 'Update' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingRoleId(null);
                setFormData({
                  name: '',
                  description: '',
                  permissions: [],
                });
              }}
              className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Roles list */}
      <div className="space-y-3">
        {roles.map((role) => {
          const isExpanded = expandedRoles.has(role.id);

          return (
            <div
              key={role.id}
              className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden hover:border-primary-500/50 transition-colors"
            >
              {/* Header */}
              <button
                onClick={() => toggleExpanded(role.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-dark-700 transition-colors text-left"
              >
                <ChevronDown
                  className={`w-5 h-5 text-dark-400 transition-transform flex-shrink-0 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />

                <div className="flex-1">
                  <h3 className="text-white font-semibold">{role.name}</h3>
                  <p className="text-sm text-dark-400">{role.description}</p>
                  <div className="text-xs text-dark-500 mt-1">
                    {role.usersCount} user{role.usersCount !== 1 ? 's' : ''} •{' '}
                    {role.permissions.length} permission
                    {role.permissions.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {role.isSystem && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded">
                    System
                  </span>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {onEditRole && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(role);
                      }}
                      className="p-2 hover:bg-dark-600 rounded transition-colors text-dark-400 hover:text-primary-400"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {onDeleteRole && !role.isSystem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id);
                      }}
                      disabled={actionInProgress === role.id}
                      className="p-2 hover:bg-red-500/20 rounded transition-colors text-dark-400 hover:text-red-400 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-dark-700 p-4 bg-dark-900 space-y-3">
                  <div>
                    <h4 className="text-white font-medium mb-2">Permissions</h4>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.length > 0 ? (
                        role.permissions.map((permission) => (
                          <span
                            key={permission}
                            className="flex items-center gap-1 px-3 py-1 bg-primary-500/20 border border-primary-500/50 text-primary-300 rounded-full text-xs"
                          >
                            <Check className="w-3 h-3" />
                            {permission
                              .split('_')
                              .map(
                                (w) =>
                                  w.charAt(0).toUpperCase() + w.slice(1)
                              )
                              .join(' ')}
                          </span>
                        ))
                      ) : (
                        <span className="text-dark-400 text-sm">
                          No permissions
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {roles.length === 0 && (
        <div className="text-center py-8 text-dark-400">
          <p>No roles created yet</p>
        </div>
      )}
    </div>
  );
};
