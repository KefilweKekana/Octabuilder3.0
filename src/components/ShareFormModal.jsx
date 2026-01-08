import React, { useState, useEffect } from 'react';
import { X, Search, Trash2, UserPlus } from 'lucide-react';

export default function ShareFormModal({ formId, formName, erpnextUrl, apiKey, apiSecret, onClose }) {
  const [shares, setShares] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState('view');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadShares();
    loadUsers();
  }, []);

  const loadShares = async () => {
    try {
      const response = await fetch(`/api/forms/share?form_id=${formId}`, {
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShares(data);
      }
    } catch (error) {
      console.error('Failed to load shares:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const searchUsers = async (query) => {
    if (!query) {
      loadUsers();
      return;
    }

    try {
      const response = await fetch(`/api/users?q=${encodeURIComponent(query)}`, {
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
      console.error('Failed to search users:', error);
    }
  };

  const addShare = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const response = await fetch('/api/forms/share', {
        method: 'POST',
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          form_id: formId,
          shared_with: selectedUser.email,
          permission: selectedPermission
        })
      });

      if (response.ok) {
        await loadShares();
        setSelectedUser(null);
        setSearchQuery('');
      } else {
        const error = await response.json();
        alert('Failed to share form: ' + error.message);
      }
    } catch (error) {
      console.error('Failed to add share:', error);
      alert('Failed to share form');
    } finally {
      setSaving(false);
    }
  };

  const updatePermission = async (userEmail, newPermission) => {
    try {
      const response = await fetch(
        `/api/forms/share?form_id=${formId}&user=${userEmail}&permission=${newPermission}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${apiKey}:${apiSecret}`,
            'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`
          }
        }
      );

      if (response.ok) {
        await loadShares();
      }
    } catch (error) {
      console.error('Failed to update permission:', error);
      alert('Failed to update permission');
    }
  };

  const removeShare = async (userEmail) => {
    if (!confirm(`Remove access for ${userEmail}?`)) return;

    try {
      const response = await fetch(
        `/api/forms/share?form_id=${formId}&user=${userEmail}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `token ${apiKey}:${apiSecret}`,
            'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`
          }
        }
      );

      if (response.ok) {
        await loadShares();
      }
    } catch (error) {
      console.error('Failed to remove share:', error);
      alert('Failed to remove share');
    }
  };

  const filteredUsers = users.filter(u =>
    !shares.some(s => s.shared_with === u.email) &&
    (u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Share Form</h2>
            <p className="text-sm text-gray-600 mt-1">{formName}</p>
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
          {/* Add User Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Add User
            </label>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {selectedUser.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{selectedUser.full_name}</div>
                      <div className="text-xs text-gray-500">{selectedUser.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={selectedPermission}
                    onChange={(e) => setSelectedPermission(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="view">View Only</option>
                    <option value="edit">Can Edit</option>
                    <option value="submit">Can Submit</option>
                  </select>
                  <button
                    onClick={addShare}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:bg-gray-300"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{saving ? 'Adding...' : 'Add'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current Shares */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              People with access ({shares.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No shares yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {shares.map(share => (
                  <div
                    key={share.shared_with}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {share.shared_with.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{share.shared_with}</div>
                        <div className="text-xs text-gray-500">
                          Shared {new Date(share.shared_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={share.permission}
                        onChange={(e) => updatePermission(share.shared_with, e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                        <option value="submit">Submit</option>
                      </select>
                      <button
                        onClick={() => removeShare(share.shared_with)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
