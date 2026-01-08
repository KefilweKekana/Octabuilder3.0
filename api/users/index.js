// API endpoint for user management
// GET /api/users - Get all users
// GET /api/users/search?q=query - Search users

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
      const { q } = req.query;

      let filters = '[["enabled","=",1]]';
      if (q) {
        filters = `[["enabled","=",1],["name","like","%${q}%"]]`;
      }

      const response = await fetch(
        `${erpnextUrl}/api/resource/User?fields=["name","full_name","user_image","email"]&filters=${filters}&limit_page_length=50`,
        { headers: { Authorization: authorization } }
      );

      const data = await response.json();
      const users = data.data.map(u => ({
        email: u.name,
        full_name: u.full_name || u.name,
        user_image: u.user_image ? `${erpnextUrl}${u.user_image}` : null
      }));

      return res.status(200).json(users);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
