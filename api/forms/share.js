// API endpoint for form sharing
// POST /api/forms/share - Share form with user
// GET /api/forms/share?form_id=xxx - Get form shares
// DELETE /api/forms/share?form_id=xxx&user=xxx - Remove share
// PUT /api/forms/share?form_id=xxx&user=xxx - Update permission

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    const currentUser = await getCurrentUser(erpnextUrl, authorization);

    if (req.method === 'GET') {
      const { form_id } = req.query;
      const shares = await getFormShares(erpnextUrl, authorization, form_id);
      return res.status(200).json(shares);
    }

    if (req.method === 'POST') {
      const { form_id, shared_with, permission } = req.body;
      const share = await createShare(erpnextUrl, authorization, form_id, shared_with, permission, currentUser);
      return res.status(201).json(share);
    }

    if (req.method === 'PUT') {
      const { form_id, user, permission } = req.query;
      const share = await updateShare(erpnextUrl, authorization, form_id, user, permission);
      return res.status(200).json(share);
    }

    if (req.method === 'DELETE') {
      const { form_id, user } = req.query;
      await deleteShare(erpnextUrl, authorization, form_id, user);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Share API error:', error);
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

async function getFormShares(erpnextUrl, authorization, formId) {
  const response = await fetch(
    `${erpnextUrl}/api/resource/Mobile Form Share?filters=[["form_id","=","${formId}"]]&fields=["*"]`,
    { headers: { Authorization: authorization } }
  );
  const data = await response.json();
  return (data.data || []).map(s => ({
    shared_with: s.shared_with,
    permission: s.permission,
    shared_at: s.creation,
    shared_by: s.shared_by
  }));
}

async function createShare(erpnextUrl, authorization, formId, sharedWith, permission, sharedBy) {
  const doc = {
    doctype: 'Mobile Form Share',
    form_id: formId,
    shared_with: sharedWith,
    permission: permission || 'view',
    shared_by: sharedBy
  };

  const response = await fetch(`${erpnextUrl}/api/resource/Mobile Form Share`, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(doc)
  });

  const data = await response.json();
  return {
    shared_with: data.data.shared_with,
    permission: data.data.permission,
    shared_at: data.data.creation
  };
}

async function updateShare(erpnextUrl, authorization, formId, user, permission) {
  // Find the share record
  const response = await fetch(
    `${erpnextUrl}/api/resource/Mobile Form Share?filters=[["form_id","=","${formId}"],["shared_with","=","${user}"]]&fields=["name"]`,
    { headers: { Authorization: authorization } }
  );
  const data = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error('Share not found');
  }

  const shareName = data.data[0].name;

  const updateResponse = await fetch(`${erpnextUrl}/api/resource/Mobile Form Share/${shareName}`, {
    method: 'PUT',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ permission })
  });

  const updateData = await updateResponse.json();
  return updateData.data;
}

async function deleteShare(erpnextUrl, authorization, formId, user) {
  // Find the share record
  const response = await fetch(
    `${erpnextUrl}/api/resource/Mobile Form Share?filters=[["form_id","=","${formId}"],["shared_with","=","${user}"]]&fields=["name"]`,
    { headers: { Authorization: authorization } }
  );
  const data = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error('Share not found');
  }

  const shareName = data.data[0].name;

  await fetch(`${erpnextUrl}/api/resource/Mobile Form Share/${shareName}`, {
    method: 'DELETE',
    headers: { Authorization: authorization }
  });
}
