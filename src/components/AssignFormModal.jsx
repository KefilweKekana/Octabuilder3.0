import { useState, useEffect } from 'react';
import { X, Search, Trash2, UserPlus } from 'lucide-react';

export default function AssignFormModal({ form, doctypes, erpnextUrl, apiKey, apiSecret, onClose }) {
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDoctype, setSelectedDoctype] = useState(form?.doctype || '');
  const [selectedLabel, setSelectedLabel] = useState(form?.name || '');
  const [selectedIcon, setSelectedIcon] = useState(form?.icon || 'file-text');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isNewAssignment = !form;

  useEffect(() => {
    loadUsers();
    if (form) {
      loadAssignments();
    }
  }, [form]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadAssignments = async () => {
    if (!form) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/forms/assign?doctype=${encodeURIComponent(form.doctype)}`, {
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedDoctype) {
      alert('Please select a DocType and a user');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/forms/assign', {
        method: 'POST',
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctype: selectedDoctype,
          label: selectedLabel || selectedDoctype,
          icon: selectedIcon,
          assigned_to: selectedUser.email
        })
      });

      if (response.ok) {
        setSelectedUser(null);
        setSearchQuery('');
        if (form) {
          loadAssignments();
        } else {
          onClose();
        }
      } else {
        const error = await response.json();
        alert('Failed to assign form: ' + error.error);
      }
    } catch (error) {
      console.error('Failed to assign form:', error);
      alert('Failed to assign form');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (assignedTo) => {
    if (!confirm(`Remove access for ${assignedTo}?`)) return;

    try {
      const response = await fetch(
        `/api/forms/assign?doctype=${encodeURIComponent(form.doctype)}&assigned_to=${encodeURIComponent(assignedTo)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `token ${apiKey}:${apiSecret}`,
            'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`
          }
        }
      );

      if (response.ok) {
        loadAssignments();
      }
    } catch (error) {
      console.error('Failed to remove assignment:', error);
      alert('Failed to remove assignment');
    }
  };

  const searchUsers = (query) => {
    setSearchQuery(query);
  };

  const filteredUsers = users.filter(u =>
    !assignments.some(a => a.assigned_to === u.email) &&
    (u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isNewAssignment ? 'New Assignment' : 'Manage Assignments'}
            </h2>
            {form && <p className="text-sm text-gray-600 mt-1">{form.name}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* New Assignment Form */}
          {isNewAssignment && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DocType *
                </label>
                <select
                  value={selectedDoctype}
                  onChange={(e) => {
                    setSelectedDoctype(e.target.value);
                    const dt = doctypes.find(d => d.name === e.target.value);
                    if (dt) {
                      setSelectedLabel(dt.name);
                      setSelectedIcon(dt.icon || 'file-text');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select DocType...</option>
                  {doctypes.map(dt => (
                    <option key={dt.name} value={dt.name}>
                      {dt.name} ({dt.module})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label (Display Name)
                </label>
                <input
                  type="text"
                  value={selectedLabel}
                  onChange={(e) => setSelectedLabel(e.target.value)}
                  placeholder="e.g., Student Admission"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <input
                  type="text"
                  value={selectedIcon}
                  onChange={(e) => setSelectedIcon(e.target.value)}
                  placeholder="e.g., school, person, file-text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Material icon name (e.g., school, person, work)
                </p>
              </div>
            </div>
          )}

          {/* Assign to User */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {isNewAssignment ? 'Assign to User *' : 'Add User'}
            </label>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => searchUsers(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {searchQuery && filteredUsers.length > 0 && (
              <div className="border rounded-lg mb-3 max-h-48 overflow-y-auto">
                {filteredUsers.map(user => (
                  <button
                    key={user.email}
                    onClick={() => {
                      setSelectedUser(user);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition text-left"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{user.full_name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {selectedUser.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{selectedUser.full_name}</div>
                      <div className="text-xs text-gray-500">{selectedUser.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleAssign}
                      disabled={saving || (isNewAssignment && !selectedDoctype)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:bg-gray-300"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{saving ? 'Assigning...' : 'Assign'}</span>
                    </button>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current Assignments (only for existing forms) */}
          {!isNewAssignment && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Currently Assigned ({assignments.length})
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Not assigned to any users yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignments.map(assignment => (
                    <div
                      key={assignment.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {assignment.assigned_to.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{assignment.assigned_to}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(assignment.assigned_to)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition"
          >
            {isNewAssignment && !selectedUser ? 'Cancel' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
