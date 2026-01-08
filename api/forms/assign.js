// API endpoint for assigning forms to users
// POST /api/forms/assign - Create new assignment
// DELETE /api/forms/assign - Remove assignment

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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
      // Get assignments for a specific doctype
      const { doctype } = req.query;
      const assignments = await getAssignments(erpnextUrl, authorization, doctype);
      return res.status(200).json(assignments);
    }

    if (req.method === 'POST') {
      // Create new assignment
      const assignment = await createAssignment(erpnextUrl, authorization, req.body);
      return res.status(201).json(assignment);
    }

    if (req.method === 'DELETE') {
      // Remove assignment
      const { doctype, assigned_to } = req.query;
      await deleteAssignment(erpnextUrl, authorization, doctype, assigned_to);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Assignment API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function getAssignments(erpnextUrl, authorization, doctype) {
  const filters = doctype
    ? `[["doctype","=","${doctype}"]]`
    : '[]';

  const response = await fetch(
    `${erpnextUrl}/api/resource/Assigned Form?filters=${filters}&fields=["*"]`,
    { headers: { Authorization: authorization } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch assignments');
  }

  const data = await response.json();
  return data.data || [];
}

async function createAssignment(erpnextUrl, authorization, assignmentData) {
  // The Assigned Form DocType has a field named "doctype" which stores the target DocType name
  // We send it in the body along with other fields
  const doc = {
    doctype: assignmentData.doctype,
    label: assignmentData.label || assignmentData.doctype,
    icon: assignmentData.icon || 'file-text',
    assigned_to: assignmentData.assigned_to
  };

  const response = await fetch(`${erpnextUrl}/api/resource/Assigned Form`, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(doc)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create assignment');
  }

  const data = await response.json();
  return data.data;
}

async function deleteAssignment(erpnextUrl, authorization, doctype, assignedTo) {
  // Find the assignment record
  const response = await fetch(
    `${erpnextUrl}/api/resource/Assigned Form?filters=[["doctype","=","${doctype}"],["assigned_to","=","${assignedTo}"]]&fields=["name"]`,
    { headers: { Authorization: authorization } }
  );

  const data = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error('Assignment not found');
  }

  const assignmentName = data.data[0].name;

  await fetch(`${erpnextUrl}/api/resource/Assigned Form/${assignmentName}`, {
    method: 'DELETE',
    headers: { Authorization: authorization }
  });
}
