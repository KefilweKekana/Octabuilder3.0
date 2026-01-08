// API endpoint for mobile app to get DocType metadata and records
// GET /api/mobile/doctype-meta?doctype=Customer

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-erpnext-url');

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
      const { doctype } = req.query;

      if (!doctype) {
        return res.status(400).json({ error: 'DocType parameter required' });
      }

      // Fetch DocType metadata (fields structure)
      const metaResponse = await fetch(
        `${erpnextUrl}/api/resource/DocType/${doctype}`,
        { headers: { Authorization: authorization } }
      );

      if (!metaResponse.ok) {
        throw new Error('Failed to fetch DocType metadata');
      }

      const metaData = await metaResponse.json();
      const docTypeMeta = metaData.data;

      // Extract relevant fields (exclude system fields and breaks)
      const fields = docTypeMeta.fields
        .filter(f =>
          !f.hidden &&
          f.fieldtype !== 'Section Break' &&
          f.fieldtype !== 'Column Break' &&
          f.fieldtype !== 'HTML' &&
          f.fieldtype !== 'Table' &&
          f.fieldtype !== 'Heading'
        )
        .map(f => ({
          fieldname: f.fieldname,
          label: f.label,
          fieldtype: f.fieldtype,
          options: f.options,
          reqd: f.reqd || 0,
          default: f.default,
          read_only: f.read_only || 0,
          in_list_view: f.in_list_view || 0
        }));

      // Fetch recent records (limit to 100)
      const recordsResponse = await fetch(
        `${erpnextUrl}/api/resource/${encodeURIComponent(doctype)}?fields=["*"]&limit_page_length=100`,
        { headers: { Authorization: authorization } }
      );

      let records = [];
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json();
        records = recordsData.data || [];
      }

      return res.status(200).json({
        doctype: doctype,
        module: docTypeMeta.module,
        fields: fields,
        records: records,
        record_count: records.length
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('DocType meta API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
