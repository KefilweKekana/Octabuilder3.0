// API endpoint for mobile app to get assigned forms
// GET /api/mobile/assigned-forms

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { authorization } = req.headers;
  const [erpnextUrl] = req.headers['x-erpnext-url']?.split('|||') || [];

  if (!authorization || !erpnextUrl) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const currentUser = await getCurrentUser(erpnextUrl, authorization);

      // Get forms assigned to this user from "Assigned Form" DocType
      const response = await fetch(
        `${erpnextUrl}/api/resource/Assigned Form?filters=[["assigned_to","=","${currentUser}"]]&fields=["*"]`,
        { headers: { Authorization: authorization } }
      );

      const data = await response.json();
      const assignments = data.data || [];

      // Format for mobile app
      const assignedForms = assignments.map(assignment => ({
        name: assignment.name,
        doctype: assignment.form_doctype,
        label: assignment.label || assignment.form_doctype,
        icon: assignment.icon || 'file-text',
        assigned_to: assignment.assigned_to
      }));

      return res.status(200).json(assignedForms);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Assigned forms API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function getCurrentUser(erpnextUrl, authorization) {
  const response = await fetch(`${erpnextUrl}/api/method/frappe.auth.get_logged_user`, {
    headers: { Authorization: authorization }
  });
  const data = await response.json();
  return data.message;
}
