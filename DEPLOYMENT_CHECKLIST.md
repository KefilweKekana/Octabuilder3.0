# Deployment Checklist - Assigned Forms System

Complete this checklist to ensure your form assignment system is fully deployed and working.

---

## Phase 1: ERPNext Setup ✅

### 1.1 Create Assigned Form DocType

```bash
# SSH into ERPNext server
ssh user@your-server.com

# Open bench console
bench --site your-site-name console
```

```python
# Paste this script
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
    print("✅ Assigned Form DocType created")
else:
    print("✅ Assigned Form DocType already exists")
```

**Verification:**
- [ ] Script runs without errors
- [ ] Can access "Assigned Form" in ERPNext UI
- [ ] Can create a new Assigned Form record manually

---

## Phase 2: Web App Deployment ✅

### 2.1 Prepare Repository

```bash
cd Octaflow-builder-main

# Check all files are present
ls -la api/
# Should see: forms/, mobile/, doctypes/, users/, proxy.js

ls -la src/components/
# Should see: FormsDashboard.jsx, AssignFormModal.jsx, etc.
```

**Verification:**
- [ ] All API files present in `/api` folder
- [ ] All component files present in `/src/components`
- [ ] package.json exists with correct dependencies
- [ ] vite.config.js exists

### 2.2 Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create commit
git commit -m "Update to Assigned Form system"

# Add remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/octaflow-builder.git

# Push to GitHub
git push -u origin main
```

**Verification:**
- [ ] Repository visible on GitHub
- [ ] All files uploaded correctly
- [ ] Latest commit shows recent changes

### 2.3 Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
4. Click "Deploy"
5. Wait for deployment to complete (2-3 minutes)

**Verification:**
- [ ] Deployment succeeds without errors
- [ ] Vercel provides a URL (e.g., https://octabuilder.vercel.app)
- [ ] Can access the URL in browser
- [ ] Login page loads correctly

---

## Phase 3: API Testing ✅

### 3.1 Get API Credentials

From ERPNext:
1. Go to Settings → API Keys
2. Create new API Key
3. Save API Key and Secret

**Verification:**
- [ ] Have API Key
- [ ] Have API Secret
- [ ] Credentials work with ERPNext

### 3.2 Test Forms Endpoint

```bash
# Set your credentials
export ERPNEXT_URL="https://your-site.erpnext.com"
export API_KEY="your-api-key"
export API_SECRET="your-api-secret"
export VERCEL_URL="https://octabuilder.vercel.app"

# Test forms endpoint
curl -X GET "$VERCEL_URL/api/forms" \
  -H "Authorization: token $API_KEY:$API_SECRET" \
  -H "x-erpnext-url: $ERPNEXT_URL|||$API_KEY:$API_SECRET"
```

**Expected:**
- Returns JSON array (may be empty if no assignments exist)
- No error messages
- Status code 200

**Verification:**
- [ ] Endpoint returns 200 status
- [ ] Response is valid JSON
- [ ] No CORS errors

### 3.3 Test DocTypes Endpoint

```bash
curl -X GET "$VERCEL_URL/api/doctypes" \
  -H "Authorization: token $API_KEY:$API_SECRET" \
  -H "x-erpnext-url: $ERPNEXT_URL|||$API_KEY:$API_SECRET"
```

**Expected:**
- Returns array of DocTypes
- Includes standard DocTypes (Customer, Item, etc.)

**Verification:**
- [ ] Returns list of DocTypes
- [ ] Each DocType has name, module, icon
- [ ] Can find "Customer" in the list

### 3.4 Test Users Endpoint

```bash
curl -X GET "$VERCEL_URL/api/users" \
  -H "Authorization: token $API_KEY:$API_SECRET" \
  -H "x-erpnext-url: $ERPNEXT_URL|||$API_KEY:$API_SECRET"
```

**Expected:**
- Returns array of users
- Each user has email, full_name

**Verification:**
- [ ] Returns list of users
- [ ] Your email appears in list
- [ ] full_name is populated

### 3.5 Create Test Assignment via API

```bash
curl -X POST "$VERCEL_URL/api/forms/assign" \
  -H "Authorization: token $API_KEY:$API_SECRET" \
  -H "x-erpnext-url: $ERPNEXT_URL|||$API_KEY:$API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "doctype": "Customer",
    "label": "Customer Form",
    "icon": "user",
    "assigned_to": "your-email@example.com"
  }'
```

**Expected:**
- Returns created assignment with "name" field
- Status code 201

**Verification:**
- [ ] Assignment created successfully
- [ ] Can see it in ERPNext UI (Assigned Form list)
- [ ] GET /api/forms now returns this assignment

---

## Phase 4: Web App UI Testing ✅

### 4.1 Login Test

1. Open your Vercel URL
2. Enter ERPNext URL (without trailing slash)
3. Enter API Key
4. Enter API Secret
5. Click "Connect"

**Verification:**
- [ ] Successfully connects
- [ ] Redirects to dashboard
- [ ] No error messages

### 4.2 View Assignments

1. Should automatically show "Form Assignments" view
2. If you created test assignment, it should appear

**Verification:**
- [ ] Dashboard loads
- [ ] Test assignment card visible
- [ ] Shows correct DocType name
- [ ] Shows correct user count
- [ ] Icon displays (if specified)

### 4.3 Create Assignment via UI

1. Click "New Assignment" button
2. Select DocType from dropdown
3. Enter label (e.g., "Sales Customer")
4. Enter icon (e.g., "briefcase")
5. Search for user by typing email
6. Click on user in search results
7. User should appear with "Assign" button
8. Click "Assign"

**Verification:**
- [ ] Modal opens
- [ ] DocType dropdown populates
- [ ] User search works
- [ ] Assignment creates successfully
- [ ] Modal closes
- [ ] Dashboard refreshes
- [ ] New assignment visible

### 4.4 Manage Assignments

1. Click "Assign" button on any form card
2. Should show currently assigned users
3. Click trash icon on a user
4. Confirm deletion

**Verification:**
- [ ] Shows list of assigned users
- [ ] Can remove user
- [ ] User count updates
- [ ] Refresh shows change persisted

---

## Phase 5: Mobile App Integration ✅

### 5.1 Test Mobile Endpoint

```bash
# This endpoint returns forms for a specific user
curl -X GET "$VERCEL_URL/api/mobile/assigned-forms" \
  -H "Authorization: token $API_KEY:$API_SECRET" \
  -H "x-erpnext-url: $ERPNEXT_URL|||$API_KEY:$API_SECRET"
```

**Expected:**
- Returns array of assignments for the authenticated user
- Each item has: name, doctype, label, icon, assigned_to

**Verification:**
- [ ] Returns assignments for your user
- [ ] Format matches mobile app expectations
- [ ] All fields populated correctly

### 5.2 Mobile App Testing

1. Open Octaflow mobile app
2. Login with same credentials
3. Navigate to forms section

**Verification:**
- [ ] Forms appear in mobile app
- [ ] Correct labels display
- [ ] Icons show correctly
- [ ] Can tap to open form
- [ ] Form loads correct DocType

---

## Phase 6: Final Verification ✅

### 6.1 End-to-End Test

1. **Create Assignment in Web App**
   - Login to web app
   - Create new assignment for "Customer"
   - Assign to your mobile user

2. **Verify in ERPNext**
   - Go to ERPNext
   - Open "Assigned Form" list
   - Confirm new record exists

3. **Check Mobile App**
   - Refresh mobile app
   - Verify form appears
   - Open form
   - Verify it's the correct DocType

4. **Submit Data**
   - Fill form in mobile app
   - Submit
   - Verify data saved to ERPNext

**Verification:**
- [ ] Complete flow works end-to-end
- [ ] Data syncs correctly
- [ ] No errors in any system

### 6.2 Performance Check

Run these commands and verify response times:

```bash
# Should complete in < 2 seconds
time curl -X GET "$VERCEL_URL/api/forms" \
  -H "Authorization: token $API_KEY:$API_SECRET" \
  -H "x-erpnext-url: $ERPNEXT_URL|||$API_KEY:$API_SECRET"

# Should complete in < 3 seconds
time curl -X GET "$VERCEL_URL/api/doctypes" \
  -H "Authorization: token $API_KEY:$API_SECRET" \
  -H "x-erpnext-url: $ERPNEXT_URL|||$API_KEY:$API_SECRET"
```

**Verification:**
- [ ] All endpoints respond in < 5 seconds
- [ ] No timeout errors
- [ ] Vercel functions execute successfully

---

## Troubleshooting ⚠️

### Issue: Vercel deployment fails

**Check:**
- package.json has all dependencies
- No syntax errors in code
- Build command is correct
- Node version is compatible

**Fix:**
```bash
# Locally test build
npm install
npm run build

# Check for errors
# Fix any issues
# Commit and push
# Redeploy on Vercel
```

### Issue: API returns 401 Unauthorized

**Check:**
- API Key and Secret are correct
- Headers include both Authorization and x-erpnext-url
- ERPNext instance is accessible

**Fix:**
- Regenerate API credentials in ERPNext
- Test directly with ERPNext API first
- Verify CORS settings

### Issue: No forms display in web app

**Check:**
- Assigned Form DocType exists
- At least one assignment created
- API endpoint returns data (test with curl)

**Fix:**
```python
# Create test assignment in ERPNext
import frappe
frappe.get_doc({
    "doctype": "Assigned Form",
    "doctype": "Customer",
    "label": "Test",
    "icon": "user",
    "assigned_to": "your@email.com"
}).insert()
frappe.db.commit()
```

### Issue: Mobile app doesn't show forms

**Check:**
- /api/mobile/assigned-forms endpoint works
- Assignments exist for that specific user
- Mobile app user email matches assigned_to field

**Fix:**
- Test endpoint with curl using mobile user's credentials
- Create assignment specifically for mobile user
- Check mobile app logs for error messages

---

## Success Criteria ✅

Your deployment is successful when:

- [x] ERPNext has Assigned Form DocType
- [x] Web app deployed to Vercel
- [x] Can login to web app
- [x] Can view assignments in web app
- [x] Can create assignments in web app
- [x] Can delete assignments in web app
- [x] Mobile endpoint returns correct data
- [x] Mobile app displays assigned forms
- [x] Can submit forms from mobile app
- [x] Data saves to ERPNext correctly

---

## Maintenance Tasks 📋

### Weekly

- [ ] Check Vercel deployment logs for errors
- [ ] Review ERPNext logs for API issues
- [ ] Verify mobile app sync working

### Monthly

- [ ] Update dependencies (npm update)
- [ ] Review and clean up old assignments
- [ ] Check API usage/quotas

### As Needed

- [ ] Add new DocTypes for assignment
- [ ] Update user permissions
- [ ] Modify assignment labels/icons

---

## Support Resources 📚

- **Documentation**: See README.md and TESTING_GUIDE.md
- **ERPNext Docs**: https://docs.erpnext.com
- **Vercel Docs**: https://vercel.com/docs
- **API Reference**: See TESTING_GUIDE.md for endpoint details

---

**Congratulations!** If all checks pass, your system is fully deployed and operational! 🎉
