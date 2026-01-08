// API endpoint for single form operations
// GET /api/forms/:id - Get form details with full config

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { authorization } = req.headers;
  const [erpnextUrl] = req.headers['x-erpnext-url']?.split('|||') || [];

  if (!authorization || !erpnextUrl) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const response = await fetch(
        `${erpnextUrl}/api/resource/Mobile Form Config/${id}`,
        { headers: { Authorization: authorization } }
      );

      if (!response.ok) {
        return res.status(404).json({ error: 'Form not found' });
      }

      const data = await response.json();
      const form = data.data;

      // Get shares for this form
      const sharesResponse = await fetch(
        `${erpnextUrl}/api/resource/Mobile Form Share?filters=[["form_id","=","${id}"]]&fields=["*"]`,
        { headers: { Authorization: authorization } }
      );
      const sharesData = await sharesResponse.json();

      const formConfig = {
        id: form.name,
        name: form.form_name,
        description: form.description,
        doctype: form.doctype_link,
        icon: form.icon,
        owner: form.owner,
        created_at: form.creation,
        modified_at: form.modified,
        fields: JSON.parse(form.fields_config || '[]'),
        sections: JSON.parse(form.sections_config || '[]'),
        sharing: (sharesData.data || []).map(s => ({
          shared_with: s.shared_with,
          permission: s.permission,
          shared_at: s.creation,
          shared_by: s.shared_by
        }))
      };

      return res.status(200).json(formConfig);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Form detail API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
