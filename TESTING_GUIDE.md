# Testing Guide - Assigned Forms System

This guide helps you verify that your form assignment system is working correctly.

## Prerequisites

✅ ERPNext instance running with "Assigned Form" DocType created
✅ Web app deployed to Vercel
✅ Mobile app configured

---

## Test 1: Verify ERPNext Setup

### In ERPNext Console

```bash
# SSH into your ERPNext server
ssh user@your-server.com

# Open bench console
bench --site your-site-name console

# Check if Assigned Form DocType exists
import frappe
print(frappe.db.exists("DocType", "Assigned Form"))
# Should output: Assigned Form
```

### Create Test Data

```python
# Still in ERPNext console
import frappe

# Create a test assignment
doc = frappe.get_doc({
    "doctype": "Assigned Form",
    "doctype": "Customer",  # The form you're assigning
    "label": "Customer Management",
    "icon": "user",
    "assigned_to": "test@example.com"  # Replace with real user email
})
doc.insert()
frappe.db.commit()
print(f"✅ Created assignment: {doc.name}")
```

### Verify in ERPNext UI

1. Go to ERPNext → Search for "Assigned Form"
2. You should see your test assignment
3. Click on it to verify all fields are filled

---

## Test 2: Verify Web App API Endpoints

### Test Forms Endpoint

```bash
# Replace with your actual credentials
ERPNEXT_URL="https://your-site.erpnext.com"
API_KEY="your-api-key"
API_SECRET="your-api-secret"

# Test fetching assigned forms
curl -X GET "https://octabuilder.vercel.app/api/forms" \
  -H "Authorization: token $API_KEY:$API_SECRET" \
  -H "x-erpnext-url: $ERPNEXT_URL|||$API_KEY:$API_SECRET"
```

**Expected Response:**
```json
[
  {
    "id": "Customer",
    "name": "Customer Management",
    "doctype": "Customer",
    "icon": "user",
    "assigned_count": 1,
    "total_assignments": 1,
    "assigned_users": ["test@example.com"]
  }
]
```

### Test DocTypes Endpoint

```bash
curl -X GET "https://octabuilder.vercel.app/api/doctypes" \
  -H "Authorization: token $API_KEY:$API_SECRET" \
  -H "x-erpnext-url: $ERPNEXT_URL|||$API_KEY:$API_SECRET"
```

**Expected Response:**
```json
[
  {
    "name": "Customer",
    "module": "Selling",
    "icon": "customer"
  },
  ... more doctypes ...
]
```

### Test Users Endpoint

```bash
curl -X GET "https://octabuilder.vercel.app/api/users" \
  -H "Authorization: token $API_KEY:$API_SECRET" \
  -H "x-erpnext-url: $ERPNEXT_URL|||$API_KEY:$API_SECRET"
```

**Expected Response:**
```json
[
  {
    "email": "test@example.com",
    "full_name": "Test User",
    "user_image": null
  },
  ... more users ...
]
```

### Test Assignment Creation

```bash
curl -X POST "https://octabuilder.vercel.app/api/forms/assign" \
  -H "Authorization: token $API_KEY:$API_SECRET" \
  -H "x-erpnext-url: $ERPNEXT_URL|||$API_KEY:$API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "doctype": "Customer",
    "label": "Customer Form",
    "icon": "user",
    "assigned_to": "another-user@example.com"
  }'
```

**Expected Response:**
```json
{
  "name": "ASSIGNED-FORM-0002",
  "doctype": "Customer",
  "label": "Customer Form",
  "icon": "user",
  "assigned_to": "another-user@example.com"
}
```

---

## Test 3: Verify Web App UI

### Login Test

1. Open https://octabuilder.vercel.app
2. Enter ERPNext URL
3. Enter API Key and Secret
4. Click "Connect"
5. ✅ Should redirect to dashboard

### View Forms Test

1. Click "Form Assignments" (should be default view)
2. ✅ Should see "Customer Management" card
3. ✅ Should show "1 user" assigned count
4. Click "Assign" button
5. ✅ Should open assignment modal
6. ✅ Should show "test@example.com" in current assignments

### Create Assignment Test

1. Click "New Assignment" button
2. Select DocType: "Customer"
3. Enter Label: "Sales Customer Form"
4. Enter Icon: "briefcase"
5. Search for a user
6. Select user
7. Click "Assign"
8. ✅ Should close modal
9. ✅ Should refresh forms list
10. ✅ Should now show "2 users" for Customer

### Remove Assignment Test

1. Click "Assign" on Customer card
2. Find a user in the list
3. Click trash icon
4. Confirm deletion
5. ✅ Assignment should be removed
6. ✅ User count should decrease

---

## Test 4: Verify Mobile App Integration

### Test Mobile Endpoint

```bash
# This is what your mobile app calls
curl -X GET "https://octabuilder.vercel.app/api/mobile/assigned-forms" \
  -H "Authorization: token $API_KEY:$API_SECRET" \
  -H "x-erpnext-url: $ERPNEXT_URL|||$API_KEY:$API_SECRET" \
  -H "x-user-email: test@example.com"
```

**Expected Response:**
```json
[
  {
    "name": "ASSIGNED-FORM-0001",
    "doctype": "Customer",
    "label": "Customer Management",
    "icon": "user",
    "assigned_to": "test@example.com"
  }
]
```

### Test in Mobile App

1. Login to Octaflow mobile app
2. Navigate to "Shared Forms" or "Forms" section
3. ✅ Should see "Customer Management" form
4. ✅ Icon should display correctly
5. Tap on the form
6. ✅ Should open Customer DocType form

---

## Common Issues and Solutions

### Issue 1: "No forms displayed"

**Symptoms**: Web app shows empty state
**Causes**:
- Assigned Form DocType doesn't exist in ERPNext
- No assignments created yet
- API credentials incorrect

**Solutions**:
```bash
# Check if DocType exists
frappe.db.exists("DocType", "Assigned Form")

# Check if any assignments exist
frappe.db.count("Assigned Form")

# Create a test assignment
frappe.get_doc({
    "doctype": "Assigned Form",
    "doctype": "Customer",
    "label": "Test",
    "icon": "user",
    "assigned_to": "your-email@example.com"
}).insert()
frappe.db.commit()
```

### Issue 2: "API returns 404"

**Symptoms**: curl commands return 404
**Causes**:
- Vercel deployment hasn't finished
- API routes not properly deployed

**Solutions**:
1. Check Vercel deployment status
2. Verify all files in `/api` folder are committed
3. Redeploy from Vercel dashboard

### Issue 3: "Mobile app shows empty list"

**Symptoms**: Mobile app logs show "Assigned Form DocType not found"
**Causes**:
- Mobile app is calling wrong endpoint
- User email doesn't match any assignments

**Solutions**:
1. Verify mobile app calls: `/api/mobile/assigned-forms`
2. Check user email in request header matches assignment
3. Create assignment for that specific user

### Issue 4: "Can't create assignment"

**Symptoms**: POST to /api/forms/assign fails
**Causes**:
- User doesn't exist in ERPNext
- DocType doesn't exist
- Permission issues

**Solutions**:
```python
# Check if user exists
frappe.db.exists("User", "test@example.com")

# Check if DocType exists
frappe.db.exists("DocType", "Customer")

# Grant permissions
frappe.permissions.add_user_permission("Assigned Form", "test@example.com", "User", "test@example.com")
```

---

## API Response Reference

### GET /api/forms

Returns all assignments grouped by DocType:

```json
[
  {
    "id": "Customer",                    // DocType name (used as unique ID)
    "name": "Customer Management",       // Display label
    "doctype": "Customer",              // DocType name
    "icon": "user",                     // Icon name
    "assigned_count": 2,                // Number of unique users
    "total_assignments": 2,             // Total assignment records
    "assigned_users": ["user1", "user2"] // List of assigned emails
  }
]
```

### POST /api/forms/assign

Creates a new assignment:

**Request:**
```json
{
  "doctype": "Customer",
  "label": "Customer Form",
  "icon": "user",
  "assigned_to": "user@example.com"
}
```

**Response:**
```json
{
  "name": "ASSIGNED-FORM-0001",
  "doctype": "Customer",
  "label": "Customer Form",
  "icon": "user",
  "assigned_to": "user@example.com"
}
```

### DELETE /api/forms/assign

Removes an assignment:

**Query Params:**
- `doctype`: The DocType name
- `assigned_to`: The user email

**Response:** 204 No Content

### GET /api/mobile/assigned-forms

Returns forms assigned to a specific user:

**Headers:**
- `x-user-email`: The user's email

**Response:**
```json
[
  {
    "name": "ASSIGNED-FORM-0001",
    "doctype": "Customer",
    "label": "Customer Management",
    "icon": "user",
    "assigned_to": "user@example.com"
  }
]
```

---

## Success Checklist

- [ ] Assigned Form DocType exists in ERPNext
- [ ] Can create assignments in ERPNext UI
- [ ] GET /api/forms returns assignments
- [ ] GET /api/doctypes returns DocType list
- [ ] GET /api/users returns user list
- [ ] POST /api/forms/assign creates new assignment
- [ ] DELETE /api/forms/assign removes assignment
- [ ] Web app login works
- [ ] Web app displays assignments
- [ ] Web app can create assignments
- [ ] Web app can remove assignments
- [ ] GET /api/mobile/assigned-forms returns user's forms
- [ ] Mobile app displays assigned forms

---

## Next Steps

Once all tests pass:

1. **Create more assignments** for different DocTypes
2. **Assign to multiple users** to test the grouping
3. **Test mobile app** end-to-end form submission
4. **Monitor Vercel logs** for any errors
5. **Check ERPNext logs** for API call issues

---

**Need help?** Check the logs:
- **Vercel logs**: https://vercel.com/your-project/deployments
- **ERPNext logs**: `bench --site your-site logs`
- **Mobile app logs**: Check Flutter console
