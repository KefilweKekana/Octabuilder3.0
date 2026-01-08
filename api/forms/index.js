// API endpoint for fetching Assigned Forms from ERPNext
// Works with your existing "Assigned Form" DocType
// GET /api/forms - Get all assigned forms

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const [erpnextUrl, credentials] = req.headers['x-erpnext-url']?.split('|||') || [];
  if (!erpnextUrl || !credentials) {
    return res.status(400).json({ error: 'Missing ERPNext configuration' });
  }

  try {
    if (req.method === 'GET') {
      const forms = await getAllAssignedForms(erpnextUrl, authorization);
      return res.status(200).json(forms);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Forms API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function getAllAssignedForms(erpnextUrl, authorization) {
  // Fetch all Assigned Form records from ERPNext
  const response = await fetch(
    `${erpnextUrl}/api/resource/Assigned Form?fields=["*"]&limit_page_length=500`,
    { headers: { Authorization: authorization } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch assigned forms from ERPNext');
  }

  const data = await response.json();
  const assignedForms = data.data || [];

  // Get unique users to see who each form is assigned to
  const formsByDoctype = {};

  assignedForms.forEach(form => {
    const key = form.form_doctype;
    if (!formsByDoctype[key]) {
      formsByDoctype[key] = {
        doctype: form.form_doctype,
        label: form.label || form.form_doctype,
        icon: form.icon || 'file-text',
        assigned_users: [],
        total_assignments: 0
      };
    }

    if (form.assigned_to && !formsByDoctype[key].assigned_users.includes(form.assigned_to)) {
      formsByDoctype[key].assigned_users.push(form.assigned_to);
    }
    formsByDoctype[key].total_assignments++;
  });

  // Convert to array and sort
  return Object.values(formsByDoctype).map(form => ({
    id: form.doctype,
    name: form.label,
    doctype: form.doctype,
    icon: form.icon,
    assigned_count: form.assigned_users.length,
    total_assignments: form.total_assignments,
    assigned_users: form.assigned_users
  }));
}
