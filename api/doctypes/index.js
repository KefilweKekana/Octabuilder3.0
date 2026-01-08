// API endpoint for DocType metadata
// GET /api/doctypes - Get all DocTypes
// GET /api/doctypes/:name/fields - Get fields for a DocType

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
      const { name } = req.query;

      if (name) {
        // Get fields for specific DocType
        const response = await fetch(
          `${erpnextUrl}/api/resource/DocType/${name}`,
          { headers: { Authorization: authorization } }
        );

        if (!response.ok) {
          return res.status(404).json({ error: 'DocType not found' });
        }

        const data = await response.json();
        const doctype = data.data;

        const fields = doctype.fields.map(f => ({
          fieldname: f.fieldname,
          label: f.label,
          fieldtype: f.fieldtype,
          reqd: f.reqd,
          options: f.options,
          default: f.default,
          in_list_view: f.in_list_view,
          in_standard_filter: f.in_standard_filter,
          read_only: f.read_only,
          hidden: f.hidden,
          depends_on: f.depends_on
        })).filter(f =>
          !f.hidden &&
          f.fieldtype !== 'Section Break' &&
          f.fieldtype !== 'Column Break' &&
          f.fieldtype !== 'HTML' &&
          f.fieldtype !== 'Table'
        );

        return res.status(200).json({
          doctype: name,
          module: doctype.module,
          fields: fields
        });
      } else {
        // Get all DocTypes
        const response = await fetch(
          `${erpnextUrl}/api/resource/DocType?fields=["name","module","icon"]&filters=[["issingle","=",0],["istable","=",0]]&limit_page_length=500`,
          { headers: { Authorization: authorization } }
        );

        const data = await response.json();
        const doctypes = data.data.map(dt => ({
          name: dt.name,
          module: dt.module || 'Custom',
          icon: dt.icon || 'file-text'
        }));

        return res.status(200).json(doctypes);
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('DocTypes API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
