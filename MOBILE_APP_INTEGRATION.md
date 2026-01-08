# Mobile App Integration Guide

## 🔍 Current Issue

Your mobile app shows:
```
! Assigned Form DocType not found, returning empty list
```

This means it's looking for forms but can't find them.

---

## ✅ Solution

Your mobile app needs to call the **web app's API**, not ERPNext directly.

### Current Setup (Wrong)
```dart
// ❌ Calling ERPNext directly
GET https://your-erpnext.com/api/resource/Mobile Form Config
```

### Correct Setup
```dart
// ✅ Call the web app API
GET https://your-vercel-app.vercel.app/api/mobile/assigned-forms
Headers: {
  "Authorization": "token API_KEY:API_SECRET",
  "x-erpnext-url": "https://your-erpnext.com|||API_KEY:API_SECRET"
}
```

---

## 📝 Step-by-Step Fix

### 1. Update Your Flutter Service

Find your `UserPreferencesService` or wherever you fetch forms, and update it:

```dart
class UserPreferencesService {
  final String webAppUrl = 'https://your-vercel-app.vercel.app'; // Your deployed web app
  final String erpnextUrl;
  final String apiKey;
  final String apiSecret;

  Future<List<AssignedForm>> getAssignedForms() async {
    try {
      final response = await http.get(
        Uri.parse('$webAppUrl/api/mobile/assigned-forms'),
        headers: {
          'Authorization': 'token $apiKey:$apiSecret',
          'x-erpnext-url': '$erpnextUrl|||$apiKey:$apiSecret',
        },
      );

      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        return data.map((json) => AssignedForm.fromJson(json)).toList();
      } else {
        print('Failed to fetch forms: ${response.statusCode}');
        return [];
      }
    } catch (e) {
      print('Error fetching assigned forms: $e');
      return [];
    }
  }
}
```

### 2. Create AssignedForm Model

```dart
class AssignedForm {
  final String formId;
  final String formName;
  final String description;
  final String doctype;
  final String icon;
  final String permission;
  final List<FormField> fields;
  final List<FormSection> sections;

  AssignedForm({
    required this.formId,
    required this.formName,
    required this.description,
    required this.doctype,
    required this.icon,
    required this.permission,
    required this.fields,
    required this.sections,
  });

  factory AssignedForm.fromJson(Map<String, dynamic> json) {
    return AssignedForm(
      formId: json['form_id'],
      formName: json['form_name'],
      description: json['description'] ?? '',
      doctype: json['doctype'],
      icon: json['icon'] ?? 'file-text',
      permission: json['permission'],
      fields: (json['fields_config'] as List)
          .map((f) => FormField.fromJson(f))
          .toList(),
      sections: (json['sections_config'] as List)
          .map((s) => FormSection.fromJson(s))
          .toList(),
    );
  }
}

class FormField {
  final String fieldname;
  final String label;
  final String fieldtype;
  final bool required;
  final int order;
  final String section;

  FormField({
    required this.fieldname,
    required this.label,
    required this.fieldtype,
    required this.required,
    required this.order,
    required this.section,
  });

  factory FormField.fromJson(Map<String, dynamic> json) {
    return FormField(
      fieldname: json['fieldname'],
      label: json['label'],
      fieldtype: json['fieldtype'],
      required: json['required'] ?? false,
      order: json['order'] ?? 0,
      section: json['section'] ?? 'Default',
    );
  }
}

class FormSection {
  final String name;
  final int order;

  FormSection({
    required this.name,
    required this.order,
  });

  factory FormSection.fromJson(Map<String, dynamic> json) {
    return FormSection(
      name: json['name'],
      order: json['order'] ?? 0,
    );
  }
}
```

---

## 🧪 Testing

### 1. Test the Web App API

First, make sure the web app is returning forms:

```bash
curl -X GET "https://your-vercel-app.vercel.app/api/mobile/assigned-forms" \
  -H "Authorization: token YOUR_API_KEY:YOUR_API_SECRET" \
  -H "x-erpnext-url: https://your-erpnext.com|||YOUR_API_KEY:YOUR_API_SECRET"
```

Expected response:
```json
[
  {
    "form_id": "FORM-001",
    "form_name": "Customer Visit",
    "description": "For sales visits",
    "doctype": "Customer",
    "icon": "user",
    "permission": "edit",
    "fields_config": [...],
    "sections_config": [...]
  }
]
```

### 2. Test in Flutter

Add debug logging:

```dart
Future<List<AssignedForm>> getAssignedForms() async {
  print('🔍 Fetching forms from: $webAppUrl/api/mobile/assigned-forms');

  try {
    final response = await http.get(
      Uri.parse('$webAppUrl/api/mobile/assigned-forms'),
      headers: {
        'Authorization': 'token $apiKey:$apiSecret',
        'x-erpnext-url': '$erpnextUrl|||$apiKey:$apiSecret',
      },
    );

    print('📥 Response status: ${response.statusCode}');
    print('📥 Response body: ${response.body}');

    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      print('✅ Found ${data.length} forms');
      return data.map((json) => AssignedForm.fromJson(json)).toList();
    } else {
      print('❌ Failed: ${response.statusCode}');
      return [];
    }
  } catch (e) {
    print('💥 Error: $e');
    return [];
  }
}
```

---

## 🎯 Complete Workflow

### 1. Create Form in ERPNext
```
ERPNext → Mobile Form Config → New
- Form Name: Customer Visit
- DocType: Customer
- Fields Config: JSON
- Save
```

### 2. Share via Web App
```
Web App → Forms → Share
- Select form: Customer Visit
- Add user: mobile@company.com
- Permission: Edit
- Save
```

### 3. Mobile App Fetches
```
Mobile App starts
→ Calls: GET /api/mobile/assigned-forms
→ Gets: Customer Visit form
→ Displays in app
```

---

## 🔧 Environment Configuration

In your Flutter app, add the web app URL:

```dart
// lib/config/app_config.dart
class AppConfig {
  static const String webAppUrl = 'https://your-vercel-app.vercel.app';
  static const String erpnextUrl = 'https://your-erpnext.com';
}
```

Then use it:

```dart
final response = await http.get(
  Uri.parse('${AppConfig.webAppUrl}/api/mobile/assigned-forms'),
  headers: {
    'Authorization': 'token $apiKey:$apiSecret',
    'x-erpnext-url': '${AppConfig.erpnextUrl}|||$apiKey:$apiSecret',
  },
);
```

---

## ❓ Troubleshooting

### "Assigned Form DocType not found"

This error means your app is looking in ERPNext directly. Update to call the web app API instead.

### Empty Array Returned

**Check:**
1. Forms exist in ERPNext (Mobile Form Config)
2. Forms are shared with the user (Mobile Form Share)
3. User is logged in with correct credentials
4. Web app is deployed and accessible

### CORS Errors

If you get CORS errors, make sure:
1. Web app API has CORS headers (already configured in the API files)
2. You're using the correct web app URL
3. HTTPS is enabled

### 401 Unauthorized

**Check:**
1. API Key and Secret are correct
2. Header format: `token KEY:SECRET`
3. x-erpnext-url header is set correctly

---

## 📊 API Response Format

The `/api/mobile/assigned-forms` endpoint returns:

```json
[
  {
    "form_id": "FORM-001",
    "form_name": "Customer Visit",
    "description": "Customer visit form",
    "doctype": "Customer",
    "icon": "user",
    "permission": "edit",
    "fields_config": [
      {
        "fieldname": "customer_name",
        "label": "Customer Name",
        "fieldtype": "Data",
        "required": true,
        "order": 1,
        "section": "Info"
      }
    ],
    "sections_config": [
      {
        "name": "Info",
        "order": 1
      }
    ]
  }
]
```

---

## ✅ Checklist

Before testing:
- [ ] Web app deployed to Vercel
- [ ] Mobile Form Config DocType created in ERPNext
- [ ] Mobile Form Share DocType created in ERPNext
- [ ] At least one form created in ERPNext
- [ ] Form shared with test user
- [ ] Flutter app updated to call web app API
- [ ] API credentials configured correctly

---

## 🚀 Next Steps

1. Update your Flutter code to call the web app API
2. Test with curl first
3. Add debug logging
4. Test in mobile app
5. Verify forms display correctly

---

**Your mobile app should now successfully fetch and display forms!** 📱
