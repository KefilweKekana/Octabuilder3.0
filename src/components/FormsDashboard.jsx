import { useState, useEffect } from 'react';
import { FileText, Share2, Search, RefreshCw, Plus, Users } from 'lucide-react';
import AssignFormModal from './AssignFormModal';

export default function FormsDashboard({ erpnextUrl, apiKey, apiSecret }) {
  const [forms, setForms] = useState([]);
  const [doctypes, setDoctypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [assigningForm, setAssigningForm] = useState(null);
  const [showNewAssignment, setShowNewAssignment] = useState(false);

  useEffect(() => {
    loadForms();
    loadDoctypes();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/forms', {
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error('Failed to load forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctypes = async () => {
    try {
      const response = await fetch('/api/doctypes', {
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDoctypes(data);
      }
    } catch (error) {
      console.error('Failed to load doctypes:', error);
    }
  };

  const filteredForms = forms.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.doctype && f.doctype.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Form Assignments</h1>
            <p className="text-sm text-gray-600">
              Assign ERPNext forms to mobile app users
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadForms}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowNewAssignment(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <Plus className="w-5 h-5" />
              <span>New Assignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <p className="text-sm text-blue-800">
          📋 Assign ERPNext DocTypes to users. Users will see assigned forms in the mobile app under "Shared Forms".
        </p>
      </div>

      {/* Search */}
      <div className="bg-white px-6 py-4 border-b">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Forms List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading forms from ERPNext...</p>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 font-medium mb-2">
              {searchQuery ? 'No forms found' : 'No form assignments yet'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery ? 'Try a different search term' : 'Create your first assignment to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewAssignment(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                <Plus className="w-5 h-5" />
                <span>Create First Assignment</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredForms.map((form) => (
              <div key={form.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{form.name}</h3>
                      <p className="text-xs text-gray-500">{form.doctype}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>
                        {form.assigned_count > 0
                          ? `${form.assigned_count} user${form.assigned_count !== 1 ? 's' : ''}`
                          : 'Not assigned'}
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={() => setAssigningForm(form)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Assign</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {(assigningForm || showNewAssignment) && (
        <AssignFormModal
          form={assigningForm}
          doctypes={doctypes}
          erpnextUrl={erpnextUrl}
          apiKey={apiKey}
          apiSecret={apiSecret}
          onClose={() => {
            setAssigningForm(null);
            setShowNewAssignment(false);
            loadForms(); // Refresh to show updated assignments
          }}
        />
      )}
    </div>
  );
}
