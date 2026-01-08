# Quick Start Guide - Forms Sharing in 5 Minutes

Get your forms sharing web app running in just 5 minutes!

## ⚡ What You'll Build

A simple web dashboard to:
1. View all forms from ERPNext
2. Share forms with mobile app users
3. Manage permissions

**Important**: Forms are created in ERPNext, this web app is ONLY for sharing them with users.

---

## 🚀 Step 1: ERPNext Setup (2 minutes)

### Quick Console Setup

```bash
# SSH into your ERPNext server
ssh user@your-server.com

# Open bench console
bench --site your-site-name console

# Paste this entire script:
import frappe

# Create Assigned Form DocType
if not frappe.db.exists("DocType", "Assigned Form"):
    frappe.get_doc({
        "doctype": "DocType",
        "name": "Assigned Form",
        "module": "Custom",
        "custom": 1,
        "fields": [
            {"fieldname": "doctype", "fieldtype": "Link", "label": "DocType", "options": "DocType", "reqd": 1},
            {"fieldname": "label", "fieldtype": "Data", "label": "Display Label", "reqd": 1},
            {"fieldname": "icon", "fieldtype": "Data", "label": "Icon"},
            {"fieldname": "assigned_to", "fieldtype": "Link", "label": "Assigned To", "options": "User", "reqd": 1}
        ],
        "permissions": [{"role": "All", "read": 1, "write": 1, "create": 1, "delete": 1}]
    }).insert()

frappe.db.commit()
print("✅ DocTypes created successfully!")
```

---

## 📝 Step 2: Create a Test Assignment in ERPNext (1 minute)

```
1. Go to ERPNext → Assigned Form → New
2. Fill in:
   - DocType: Customer (or any DocType you want to share)
   - Label: Customer Visit Form
   - Icon: user
   - Assigned To: (select a user email)
3. Save
```

**Note**: This creates a form assignment directly in ERPNext. The web app provides a UI to manage these assignments more easily.

---

## 🌐 Step 3: Deploy Web App (2 minutes)

```bash
# Clone/navigate to project
cd Octaflow-builder-main

# Push to GitHub
git init
git add .
git commit -m "Forms sharing app"
git remote add origin https://github.com/YOUR_USERNAME/forms-sharing.git
git push -u origin main

# Deploy to Vercel
# 1. Go to https://vercel.com/new
# 2. Import your GitHub repo
# 3. Framework: Vite
# 4. Click Deploy
# 5. Wait 2 minutes
# 6. Get URL: https://your-app.vercel.app
```

---

## 🎉 Step 4: Share Your First Form (1 minute)

1. **Login**
   - Open your Vercel URL
   - ERPNext URL: `https://yoursite.erpnext.com`
   - API Key: [from ERPNext]
   - API Secret: [from ERPNext]
   - Click "Connect"

2. **View Assignments**
   - You should see your "Customer Visit Form" assignment
   - Shows which DocTypes are assigned and to how many users

3. **Create New Assignment**
   - Click "New Assignment" button
   - Select a DocType (e.g., "Customer")
   - Enter a label (e.g., "Customer Form")
   - Choose an icon
   - Search for a user
   - Click "Assign"
   - Done!

---

## ✅ Success!

You now have:
- ✅ Forms created in ERPNext
- ✅ Web app deployed
- ✅ Forms shared with users
- ✅ Ready for mobile app integration

---

## 📱 Step 5: Mobile App Integration

Your mobile app should call:

```dart
GET https://your-erpnext.com/api/mobile/assigned-forms
Headers: {
  "Authorization": "token API_KEY:API_SECRET",
  "x-erpnext-url": "https://your-erpnext.com|||API_KEY:API_SECRET"
}

// Returns forms shared with logged-in user
Response: [{
  form_id: "...",
  form_name: "Customer Visit Form",
  doctype: "Customer",
  permission: "edit",
  fields_config: [...],
  sections_config: [...]
}]
```

---

## 🎯 Key Concepts

1. **Forms live in ERPNext** - Create/edit there
2. **Web app is for sharing** - Assign to users
3. **Mobile app fetches** - Gets assigned forms automatically

---

## 🆘 Troubleshooting

**Forms not showing in web app?**
- Check you created "Mobile Form Config" DocType
- Create at least one form in ERPNext
- Click "Refresh" button

**Can't share forms?**
- Verify "Mobile Form Share" DocType exists
- Check user exists in ERPNext
- Ensure you're logged in

**Mobile app not getting forms?**
- Test endpoint: `/api/mobile/assigned-forms`
- Verify forms are shared with that user
- Check API credentials

---

## 📖 Learn More

- [README.md](README.md) - Full documentation
- [ERPNEXT_SETUP.md](ERPNEXT_SETUP.md) - Detailed ERPNext setup
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment guide

---

**You're all set! Start sharing forms with your team!** 🚀
