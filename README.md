# ERPFlow Builder - Forms Sharing Web App

Web application for sharing ERPNext forms with mobile app users. Create forms in ERPNext, share them via this web app, and users automatically get access in the mobile app!

## 🎯 What It Does

This is a **sharing management tool** for ERPNext forms:
1. **Create forms in ERPNext** (using ERPNext's native UI)
2. **View all forms** in this web app
3. **Share forms with users** - assign to mobile app users
4. **Mobile app fetches assigned forms** automatically

**Key Point**: Forms are created in ERPNext, not in this web app. This app is ONLY for managing which users can access which forms on the mobile app.

---

## 🚀 Quick Start

### 1. Create Forms in ERPNext

In your ERPNext instance, create a new DocType called "Mobile Form Config" with these fields:
- form_name (Data)
- description (Text)
- doctype_link (Link to DocType)
- icon (Data)
- fields_config (Long Text) - JSON array of fields
- sections_config (Long Text) - JSON array of sections

See [ERPNEXT_SETUP.md](./ERPNEXT_SETUP.md) for detailed setup.

### 2. Deploy Web App

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# Deploy to Vercel
# - Go to vercel.com
# - Import your GitHub repo
# - Framework: Vite
# - Deploy!
```

### 3. Share Forms

1. Login to web app with ERPNext credentials
2. Click "Forms" in sidebar
3. See all forms from ERPNext
4. Click "Share" on any form
5. Select users and permissions
6. Done! Users now have access in mobile app

---

## 📖 How It Works

### Workflow

```
ERPNext (Create Forms)
        ↓
   Web App (Share with Users)
        ↓
  Mobile App (Users see assigned forms)
```

### Example

**Step 1: Create Form in ERPNext**
```
Go to ERPNext → Mobile Form Config → New
Form Name: Customer Visit Form
DocType: Customer
Fields Config: ["customer_name", "email", "phone"]
Save
```

**Step 2: Share via Web App**
```
Login to web app
Forms → Find "Customer Visit Form"
Click "Share"
Add user: sales@company.com
Permission: Edit
Save
```

**Step 3: Mobile App**
```
User logs in to mobile app
API call: GET /api/mobile/assigned-forms
Response includes "Customer Visit Form"
User fills and submits form
Data saved to ERPNext
```

---

## 🔌 API Endpoints

### Web App

```
GET /api/forms
# Returns all forms from ERPNext with share counts
Response: [{
  id: "FORM-001",
  name: "Customer Visit",
  doctype: "Customer",
  shared_count: 5,
  is_shared_with_me: true,
  shares: [{shared_with: "user@..."}]
}]
```

### Form Sharing

```
GET    /api/forms/share?form_id=xxx
POST   /api/forms/share
PUT    /api/forms/share
DELETE /api/forms/share
```

### Mobile App

```
GET /api/mobile/assigned-forms
# Returns forms shared with current user
Response: [{
  form_id: "FORM-001",
  form_name: "Customer Visit",
  doctype: "Customer",
  permission: "edit",
  fields_config: [...],
  sections_config: [...]
}]
```

---

## 📁 Project Structure

```
erpflow-builder/
├── api/
│   ├── forms/
│   │   ├── index.js         # Fetch forms from ERPNext
│   │   ├── [id].js          # Get single form
│   │   └── share.js         # Manage sharing
│   ├── users/index.js       # User search
│   └── mobile/assigned-forms.js  # Mobile endpoint
├── src/
│   ├── components/
│   │   ├── FormsDashboard.jsx   # Main sharing UI
│   │   └── ShareFormModal.jsx   # Share dialog
│   └── App.jsx
└── README.md
```

---

## 🎨 Features

### Forms Dashboard
- ✅ View all forms from ERPNext
- ✅ See share counts
- ✅ Filter: All / Shared / Not Shared
- ✅ Search forms
- ✅ Refresh button

### Sharing
- ✅ Share with specific users
- ✅ Set permissions (View/Edit/Submit)
- ✅ Remove shares
- ✅ Update permissions
- ✅ See who has access

### Mobile Integration
- ✅ Automatic sync
- ✅ Permission-based access
- ✅ Dynamic form rendering
- ✅ Offline support (mobile app handles this)

---

## 🔧 ERPNext Setup

### Required DocTypes

**Mobile Form Config** - Stores form configurations
```python
fields = [
    {"fieldname": "form_name", "fieldtype": "Data", "reqd": 1},
    {"fieldname": "description", "fieldtype": "Text"},
    {"fieldname": "doctype_link", "fieldtype": "Link", "options": "DocType", "reqd": 1},
    {"fieldname": "icon", "fieldtype": "Data"},
    {"fieldname": "fields_config", "fieldtype": "Long Text"},
    {"fieldname": "sections_config", "fieldtype": "Long Text"}
]
```

**Mobile Form Share** - Manages sharing
```python
fields = [
    {"fieldname": "form_id", "fieldtype": "Link", "options": "Mobile Form Config", "reqd": 1},
    {"fieldname": "shared_with", "fieldtype": "Link", "options": "User", "reqd": 1},
    {"fieldname": "shared_by", "fieldtype": "Link", "options": "User", "reqd": 1},
    {"fieldname": "permission", "fieldtype": "Select", "options": "View\nEdit\nSubmit", "reqd": 1}
]
```

See [ERPNEXT_SETUP.md](./ERPNEXT_SETUP.md) for complete setup script.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import to Vercel
3. Framework: Vite
4. Deploy
5. Done!

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🎯 Use Cases

1. **Field Sales** - Share customer visit forms with sales reps
2. **Warehouse** - Share inventory count forms with warehouse staff
3. **HR** - Share onboarding forms with new employees
4. **Service** - Share maintenance forms with technicians
5. **Quality** - Share inspection forms with QA team

---

## 🔒 Security

- ✅ ERPNext token authentication
- ✅ Permission-based access
- ✅ HTTPS required
- ✅ No data storage (just sharing metadata)
- ✅ ERPNext handles all permissions

---

## 📊 Comparison: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| Form Creation | Web app | ERPNext (better!) |
| Form Management | Complex builder | Native ERPNext UI |
| Sharing | Not available | Web app (simple!) |
| Mobile Access | Manual assignment | Automatic |
| Data Storage | Both places | ERPNext only |

---

## ❓ FAQ

**Q: Where are forms created?**
A: In ERPNext, using the "Mobile Form Config" DocType.

**Q: What does this web app do?**
A: It's a sharing management tool - assign forms to mobile app users.

**Q: Can I edit forms in the web app?**
A: No, edit them in ERPNext. This app is only for sharing.

**Q: How do users get forms in the mobile app?**
A: The mobile app calls `/api/mobile/assigned-forms` which returns all forms shared with that user.

**Q: What's in fields_config?**
A: JSON array of field configurations (which fields to show, labels, order, etc.)

---

## 📝 Documentation

- **Quick Start**: See above
- **ERPNext Setup**: [ERPNEXT_SETUP.md](./ERPNEXT_SETUP.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **API Reference**: See "API Endpoints" section above

---

## 🤝 Contributing

This is a simplified sharing tool. Key principles:
- Forms are created in ERPNext
- Web app is ONLY for sharing
- Keep it simple

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

- Built with React + Vite
- Styled with Tailwind CSS
- Icons by Lucide
- Powered by ERPNext
- Hosted on Vercel

---

**Simple, focused, effective - manage form access for your mobile team!** 🚀
