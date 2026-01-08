import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Share2, Plus, X, GripVertical, Trash2 } from 'lucide-react';
import ShareFormModal from './ShareFormModal';

export default function FormBuilder({ formId, mode, erpnextUrl, apiKey, apiSecret, onBack }) {
  const [formConfig, setFormConfig] = useState({
    name: '',
    description: '',
    doctype: '',
    icon: 'file-text',
    fields: [],
    sections: []
  });
  const [doctypes, setDoctypes] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [draggedField, setDraggedField] = useState(null);
  const [editingSection, setEditingSection] = useState(null);

  const isReadOnly = mode === 'view';

  useEffect(() => {
    loadDoctypes();
    if (formId) {
      loadForm();
    }
  }, [formId]);

  useEffect(() => {
    if (formConfig.doctype) {
      loadDoctypeFields(formConfig.doctype);
    }
  }, [formConfig.doctype]);

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

  const loadForm = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFormConfig({
          name: data.name,
          description: data.description,
          doctype: data.doctype,
          icon: data.icon,
          fields: data.fields || [],
          sections: data.sections || []
        });
      }
    } catch (error) {
      console.error('Failed to load form:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctypeFields = async (doctypeName) => {
    try {
      const response = await fetch(`/api/doctypes?name=${doctypeName}`, {
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableFields(data.fields);
      }
    } catch (error) {
      console.error('Failed to load doctype fields:', error);
    }
  };

  const saveForm = async () => {
    if (!formConfig.name || !formConfig.doctype) {
      alert('Please fill in form name and select a DocType');
      return;
    }

    setSaving(true);
    try {
      const url = formId ? `/api/forms/${formId}` : '/api/forms';
      const method = formId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'x-erpnext-url': `${erpnextUrl}|||${apiKey}:${apiSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formConfig)
      });

      if (response.ok) {
        alert(formId ? 'Form updated successfully!' : 'Form created successfully!');
        onBack();
      } else {
        const error = await response.json();
        alert('Failed to save form: ' + error.message);
      }
    } catch (error) {
      console.error('Failed to save form:', error);
      alert('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const addField = (field) => {
    if (formConfig.fields.some(f => f.fieldname === field.fieldname)) {
      return;
    }

    const newField = {
      fieldname: field.fieldname,
      label: field.label,
      fieldtype: field.fieldtype,
      required: field.reqd === 1,
      order: formConfig.fields.length + 1,
      section: formConfig.sections.length > 0 ? formConfig.sections[0].name : 'Default'
    };

    setFormConfig(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const removeField = (fieldname) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.fieldname !== fieldname)
    }));
  };

  const updateField = (fieldname, updates) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f =>
        f.fieldname === fieldname ? { ...f, ...updates } : f
      )
    }));
  };

  const addSection = () => {
    const sectionName = prompt('Enter section name:');
    if (!sectionName) return;

    setFormConfig(prev => ({
      ...prev,
      sections: [...prev.sections, {
        name: sectionName,
        order: prev.sections.length + 1
      }]
    }));
  };

  const removeSection = (sectionName) => {
    setFormConfig(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.name !== sectionName),
      fields: prev.fields.map(f =>
        f.section === sectionName ? { ...f, section: 'Default' } : f
      )
    }));
  };

  const handleDragStart = (e, index) => {
    setDraggedField(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedField === null || draggedField === index) return;

    const fields = [...formConfig.fields];
    const item = fields[draggedField];
    fields.splice(draggedField, 1);
    fields.splice(index, 0, item);

    setFormConfig(prev => ({ ...prev, fields }));
    setDraggedField(index);
  };

  const groupedFields = formConfig.sections.length > 0
    ? formConfig.sections.reduce((acc, section) => {
        acc[section.name] = formConfig.fields.filter(f => f.section === section.name);
        return acc;
      }, {})
    : { 'Default': formConfig.fields };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {formId ? (isReadOnly ? 'View Form' : 'Edit Form') : 'Create New Form'}
              </h1>
              <p className="text-sm text-gray-600">{formConfig.name || 'Untitled Form'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!isReadOnly && formId && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            )}
            {!isReadOnly && (
              <button
                onClick={saveForm}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:bg-gray-300"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form Configuration */}
        <div className="w-96 bg-white border-r overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Name *
              </label>
              <input
                type="text"
                value={formConfig.name}
                onChange={(e) => setFormConfig(prev => ({ ...prev, name: e.target.value }))}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                placeholder="e.g., Student Admission Form"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formConfig.description}
                onChange={(e) => setFormConfig(prev => ({ ...prev, description: e.target.value }))}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                rows="3"
                placeholder="Describe the purpose of this form"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DocType *
              </label>
              <select
                value={formConfig.doctype}
                onChange={(e) => setFormConfig(prev => ({ ...prev, doctype: e.target.value, fields: [] }))}
                disabled={isReadOnly || formId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              >
                <option value="">Select DocType...</option>
                {doctypes.map(dt => (
                  <option key={dt.name} value={dt.name}>{dt.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <input
                type="text"
                value={formConfig.icon}
                onChange={(e) => setFormConfig(prev => ({ ...prev, icon: e.target.value }))}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                placeholder="file-text"
              />
            </div>

            {!isReadOnly && formConfig.doctype && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Available Fields</h3>
                  <span className="text-xs text-gray-500">{availableFields.length} fields</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableFields.map(field => (
                    <div
                      key={field.fieldname}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{field.label}</div>
                        <div className="text-xs text-gray-500">{field.fieldtype}</div>
                      </div>
                      <button
                        onClick={() => addField(field)}
                        disabled={formConfig.fields.some(f => f.fieldname === field.fieldname)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:text-gray-400 disabled:hover:bg-transparent"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Form Fields */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">Form Fields</h2>
                {!isReadOnly && (
                  <button
                    onClick={addSection}
                    className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Section</span>
                  </button>
                )}
              </div>

              {formConfig.fields.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3" />
                  <p>No fields added yet</p>
                  <p className="text-sm mt-1">Add fields from the left panel</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedFields).map(([sectionName, sectionFields]) => (
                    <div key={sectionName} className="border-b pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                          {sectionName}
                        </h3>
                        {!isReadOnly && sectionName !== 'Default' && (
                          <button
                            onClick={() => removeSection(sectionName)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {sectionFields.map((field, index) => (
                          <div
                            key={field.fieldname}
                            draggable={!isReadOnly}
                            onDragStart={(e) => handleDragStart(e, formConfig.fields.indexOf(field))}
                            onDragOver={(e) => handleDragOver(e, formConfig.fields.indexOf(field))}
                            onDragEnd={() => setDraggedField(null)}
                            className="bg-gray-50 border rounded-lg p-4"
                          >
                            <div className="flex items-start space-x-3">
                              {!isReadOnly && (
                                <GripVertical className="w-5 h-5 text-gray-400 cursor-move mt-1" />
                              )}
                              <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Field Label
                                    </label>
                                    <input
                                      type="text"
                                      value={field.label}
                                      onChange={(e) => updateField(field.fieldname, { label: e.target.value })}
                                      disabled={isReadOnly}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Field Type
                                    </label>
                                    <input
                                      type="text"
                                      value={field.fieldtype}
                                      disabled
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => updateField(field.fieldname, { required: e.target.checked })}
                                        disabled={isReadOnly}
                                        className="rounded"
                                      />
                                      <span className="text-gray-700">Required</span>
                                    </label>

                                    {!isReadOnly && formConfig.sections.length > 0 && (
                                      <select
                                        value={field.section}
                                        onChange={(e) => updateField(field.fieldname, { section: e.target.value })}
                                        className="text-xs px-2 py-1 border border-gray-300 rounded"
                                      >
                                        {formConfig.sections.map(s => (
                                          <option key={s.name} value={s.name}>{s.name}</option>
                                        ))}
                                      </select>
                                    )}
                                  </div>

                                  {!isReadOnly && (
                                    <button
                                      onClick={() => removeField(field.fieldname)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareFormModal
          formId={formId}
          formName={formConfig.name}
          erpnextUrl={erpnextUrl}
          apiKey={apiKey}
          apiSecret={apiSecret}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
