# ERPNext Setup Instructions

This document explains how to set up the required ERPNext DocTypes for the Zoho Forms-like functionality.

## Required DocTypes

You need to create two custom DocTypes in your ERPNext instance:

### 1. Mobile Form Config

This DocType stores the form configurations created by users.

**DocType Settings:**
- Module: Custom
- Is Submittable: No
- Track Changes: Yes
- Allow Rename: No

**Fields:**

| Field Label | Field Name | Field Type | Options | Required | Description |
|------------|------------|-----------|---------|----------|-------------|
| Form Name | form_name | Data | - | Yes | Display name of the form |
| Description | description | Text | - | No | Form description |
| DocType | doctype_link | Link | DocType | Yes | ERPNext DocType this form is for |
| Icon | icon | Data | - | No | Icon name for mobile app |
| Fields Config | fields_config | Long Text | - | No | JSON array of field configurations |
| Sections Config | sections_config | Long Text | - | No | JSON array of section configurations |

**Permissions:**
- All Users: Read, Write, Create, Delete (own documents)
- System Manager: Read, Write, Create, Delete (all documents)

**Create Steps:**
1. Go to: Home → Customization → DocType → New DocType
2. Enter "Mobile Form Config" as the name
3. Add the fields listed above
4. Set permissions
5. Save

---

### 2. Mobile Form Share

This DocType manages form sharing between users.

**DocType Settings:**
- Module: Custom
- Is Submittable: No
- Track Changes: Yes
- Allow Rename: No

**Fields:**

| Field Label | Field Name | Field Type | Options | Required | Description |
|------------|------------|-----------|---------|----------|-------------|
| Form | form_id | Link | Mobile Form Config | Yes | The form being shared |
| Shared With | shared_with | Link | User | Yes | User receiving access |
| Shared By | shared_by | Link | User | Yes | User sharing the form |
| Permission | permission | Select | View\nEdit\nSubmit | Yes | Access level |

**Permissions:**
- All Users: Read, Write, Create, Delete
- System Manager: Read, Write, Create, Delete

**Create Steps:**
1. Go to: Home → Customization → DocType → New DocType
2. Enter "Mobile Form Share" as the name
3. Add the fields listed above
4. Set permissions
5. Save

---

## Automated Setup (Alternative Method)

You can create these DocTypes programmatically using ERPNext's API or bench console.

### Using Bench Console

```python
# Login to your server and run:
bench --site your-site-name console

# Then run this Python code:

import frappe

# Create Mobile Form Config DocType
if not frappe.db.exists("DocType", "Mobile Form Config"):
    doc = frappe.get_doc({
        "doctype": "DocType",
        "name": "Mobile Form Config",
        "module": "Custom",
        "custom": 1,
        "fields": [
            {
                "fieldname": "form_name",
                "fieldtype": "Data",
                "label": "Form Name",
                "reqd": 1
            },
            {
                "fieldname": "description",
                "fieldtype": "Text",
                "label": "Description"
            },
            {
                "fieldname": "doctype_link",
                "fieldtype": "Link",
                "label": "DocType",
                "options": "DocType",
                "reqd": 1
            },
            {
                "fieldname": "icon",
                "fieldtype": "Data",
                "label": "Icon"
            },
            {
                "fieldname": "fields_config",
                "fieldtype": "Long Text",
                "label": "Fields Config"
            },
            {
                "fieldname": "sections_config",
                "fieldtype": "Long Text",
                "label": "Sections Config"
            }
        ],
        "permissions": [
            {
                "role": "All",
                "read": 1,
                "write": 1,
                "create": 1,
                "delete": 1
            }
        ]
    })
    doc.insert()
    print("Mobile Form Config created successfully!")

# Create Mobile Form Share DocType
if not frappe.db.exists("DocType", "Mobile Form Share"):
    doc = frappe.get_doc({
        "doctype": "DocType",
        "name": "Mobile Form Share",
        "module": "Custom",
        "custom": 1,
        "fields": [
            {
                "fieldname": "form_id",
                "fieldtype": "Link",
                "label": "Form",
                "options": "Mobile Form Config",
                "reqd": 1
            },
            {
                "fieldname": "shared_with",
                "fieldtype": "Link",
                "label": "Shared With",
                "options": "User",
                "reqd": 1
            },
            {
                "fieldname": "shared_by",
                "fieldtype": "Link",
                "label": "Shared By",
                "options": "User",
                "reqd": 1
            },
            {
                "fieldname": "permission",
                "fieldtype": "Select",
                "label": "Permission",
                "options": "View\nEdit\nSubmit",
                "reqd": 1
            }
        ],
        "permissions": [
            {
                "role": "All",
                "read": 1,
                "write": 1,
                "create": 1,
                "delete": 1
            }
        ]
    })
    doc.insert()
    print("Mobile Form Share created successfully!")

frappe.db.commit()
```

---

## API Permissions

Make sure your ERPNext instance allows API access:

1. **Enable API Access:**
   - Go to: Setup → System Settings
   - Check "Allow API Access" if available

2. **User API Credentials:**
   - Each user needs to generate API Key and Secret
   - Go to: User Profile → API Access
   - Click "Generate Keys"

3. **CORS Settings (if needed):**
   - If your web app is on a different domain, configure CORS
   - Add your domain to allowed origins in `site_config.json`

---

## Testing the Setup

After creating the DocTypes, test the API endpoints:

### Test 1: Create a Form Config
```bash
curl -X POST "https://your-site.erpnext.com/api/resource/Mobile Form Config" \
  -H "Authorization: token YOUR_API_KEY:YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "form_name": "Test Form",
    "description": "Test Description",
    "doctype_link": "Customer",
    "icon": "user",
    "fields_config": "[]",
    "sections_config": "[]"
  }'
```

### Test 2: Get All Forms
```bash
curl "https://your-site.erpnext.com/api/resource/Mobile Form Config" \
  -H "Authorization: token YOUR_API_KEY:YOUR_API_SECRET"
```

### Test 3: Share a Form
```bash
curl -X POST "https://your-site.erpnext.com/api/resource/Mobile Form Share" \
  -H "Authorization: token YOUR_API_KEY:YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": "FORM-ID-HERE",
    "shared_with": "user@example.com",
    "shared_by": "admin@example.com",
    "permission": "Edit"
  }'
```

---

## Troubleshooting

### Permission Denied Errors
- Check that the user has proper roles assigned
- Verify API credentials are correct
- Ensure the DocTypes have proper permission rules

### DocType Not Found
- Verify the DocTypes were created successfully
- Check spelling and capitalization
- Try refreshing: `bench --site your-site-name clear-cache`

### API Connection Issues
- Verify ERPNext URL is accessible
- Check CORS settings if web app is on different domain
- Ensure HTTPS is enabled

---

## Next Steps

After setup:
1. Test creating a form in the web app
2. Share the form with another user
3. Verify the shared form appears in the mobile app
4. Test form submissions from mobile app

For mobile app integration, see the API endpoint documentation in the main README.
