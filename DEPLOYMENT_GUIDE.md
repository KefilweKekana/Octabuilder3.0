# Deployment Guide - Zoho Forms-like Web App

Complete guide for deploying the ERPFlow Builder with Forms Management.

## Overview

This application consists of:
- **Frontend**: React + Vite app (deployed to Vercel)
- **Backend**: Serverless API routes (deployed with Vercel)
- **Storage**: ERPNext (custom DocTypes)

---

## Prerequisites

1. **ERPNext Instance**
   - Running ERPNext v13+ or Frappe v14+
   - Accessible via HTTPS
   - API access enabled

2. **GitHub Account**
   - For code repository

3. **Vercel Account** (Free tier works)
   - Sign up at https://vercel.com

4. **Node.js** (for local development)
   - Version 16 or higher

---

## Step 1: ERPNext Setup

### 1.1 Create Custom DocTypes

Follow the instructions in [ERPNEXT_SETUP.md](./ERPNEXT_SETUP.md) to create:
- Mobile Form Config
- Mobile Form Share

### 1.2 Generate API Credentials

For each user:
1. Login to ERPNext
2. Go to User Profile → API Access
3. Click "Generate Keys"
4. Save the API Key and API Secret

---

## Step 2: Deploy to Vercel

### 2.1 Push to GitHub

```bash
# Navigate to project directory
cd Octaflow-builder-main

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Forms Management System"

# Create GitHub repository and push
# (Follow GitHub's instructions for new repository)
git remote add origin https://github.com/YOUR_USERNAME/erpflow-builder.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard

2. **Import Project**
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables**
   - None required (ERPNext credentials entered by users)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Get your deployment URL: `https://your-app.vercel.app`

---

## Step 3: Configure Application

### 3.1 First Time Login

1. Open your deployed URL
2. Enter ERPNext credentials:
   - **ERPNext URL**: `https://yoursite.erpnext.com`
   - **API Key**: Your generated key
   - **API Secret**: Your generated secret
3. Click "Connect"

### 3.2 Test Forms Management

1. Click the **Forms** icon (list icon) in sidebar
2. Click **New Form**
3. Create a test form:
   - Name: "Test Customer Form"
   - DocType: Customer
   - Add fields: customer_name, email, phone
4. Save form
5. Share with another user
6. Verify in mobile app

---

## Step 4: Mobile App Integration

### 4.1 Update Mobile App Endpoint

In your Flutter mobile app, update the endpoint to fetch forms:

```dart
// In your API service
Future<List<FormConfig>> getAssignedForms() async {
  final response = await http.get(
    Uri.parse('https://your-erpnext.com/api/mobile/assigned-forms'),
    headers: {
      'Authorization': 'token $apiKey:$apiSecret',
      'x-erpnext-url': 'https://your-erpnext.com|||$apiKey:$apiSecret',
    },
  );

  if (response.statusCode == 200) {
    final List data = json.decode(response.body);
    return data.map((json) => FormConfig.fromJson(json)).toList();
  }
  throw Exception('Failed to load forms');
}
```

### 4.2 Form Config Model

```dart
class FormConfig {
  final String formId;
  final String formName;
  final String description;
  final String doctype;
  final String icon;
  final String permission;
  final List<FieldConfig> fields;
  final List<SectionConfig> sections;

  FormConfig({
    required this.formId,
    required this.formName,
    required this.description,
    required this.doctype,
    required this.icon,
    required this.permission,
    required this.fields,
    required this.sections,
  });

  factory FormConfig.fromJson(Map<String, dynamic> json) {
    return FormConfig(
      formId: json['form_id'],
      formName: json['form_name'],
      description: json['description'] ?? '',
      doctype: json['doctype'],
      icon: json['icon'],
      permission: json['permission'],
      fields: (json['fields_config'] as List)
          .map((f) => FieldConfig.fromJson(f))
          .toList(),
      sections: (json['sections_config'] as List)
          .map((s) => SectionConfig.fromJson(s))
          .toList(),
    );
  }
}

class FieldConfig {
  final String fieldname;
  final String label;
  final String fieldtype;
  final bool required;
  final int order;
  final String section;

  FieldConfig({
    required this.fieldname,
    required this.label,
    required this.fieldtype,
    required this.required,
    required this.order,
    required this.section,
  });

  factory FieldConfig.fromJson(Map<String, dynamic> json) {
    return FieldConfig(
      fieldname: json['fieldname'],
      label: json['label'],
      fieldtype: json['fieldtype'],
      required: json['required'] ?? false,
      order: json['order'] ?? 0,
      section: json['section'] ?? 'Default',
    );
  }
}

class SectionConfig {
  final String name;
  final int order;

  SectionConfig({
    required this.name,
    required this.order,
  });

  factory SectionConfig.fromJson(Map<String, dynamic> json) {
    return SectionConfig(
      name: json['name'],
      order: json['order'] ?? 0,
    );
  }
}
```

---

## Step 5: Testing

### 5.1 Web App Testing

1. **Create Forms**
   - Test creating forms with different DocTypes
   - Add various field types
   - Create multiple sections
   - Save and verify

2. **Share Forms**
   - Share with test users
   - Test different permissions (View, Edit, Submit)
   - Verify shared users can access

3. **Edit Forms**
   - Modify existing forms
   - Add/remove fields
   - Reorder fields
   - Update sections

### 5.2 Mobile App Testing

1. **Fetch Forms**
   - Verify assigned forms appear
   - Check both owned and shared forms
   - Verify permissions are correct

2. **Form Display**
   - Sections render correctly
   - Fields in correct order
   - Required fields marked
   - Custom labels shown

3. **Form Submission**
   - Fill out form
   - Submit to ERPNext
   - Verify data saved correctly

---

## Step 6: Production Checklist

### Security
- [ ] API credentials secured (never in code)
- [ ] HTTPS enabled on all endpoints
- [ ] ERPNext permissions properly configured
- [ ] User roles assigned correctly

### Performance
- [ ] API response times acceptable
- [ ] Large DocTypes load efficiently
- [ ] Form list pagination works
- [ ] Search/filter responsive

### User Experience
- [ ] Error messages helpful
- [ ] Loading states clear
- [ ] Mobile responsive
- [ ] Forms save reliably

### Documentation
- [ ] User guide created
- [ ] Admin documentation complete
- [ ] API docs updated
- [ ] Troubleshooting guide available

---

## Troubleshooting

### Build Fails on Vercel

**Issue**: Build command fails
**Solution**:
- Check `package.json` dependencies
- Verify Node.js version compatibility
- Check build logs for specific errors

### API Endpoints Not Working

**Issue**: 404 errors on API routes
**Solution**:
- Verify files are in `/api` directory
- Check Vercel deployment logs
- Ensure routes export `default function handler`

### ERPNext Connection Issues

**Issue**: "Authentication failed"
**Solution**:
- Verify API credentials are correct
- Check ERPNext URL includes `https://`
- Ensure API access is enabled in ERPNext
- Test credentials with curl

### Forms Not Appearing in Mobile App

**Issue**: No forms returned from API
**Solution**:
- Verify DocTypes created in ERPNext
- Check user has forms or shares
- Test `/api/mobile/assigned-forms` endpoint
- Verify permissions on DocTypes

### Sharing Not Working

**Issue**: Cannot share forms
**Solution**:
- Check "Mobile Form Share" DocType exists
- Verify user permissions on share DocType
- Test sharing API endpoint directly
- Check for duplicate share records

---

## Monitoring & Maintenance

### Vercel Dashboard
- Monitor deployment status
- Check function logs
- Review error rates
- Monitor bandwidth usage

### ERPNext
- Review API usage logs
- Monitor DocType size
- Check user activity
- Backup form configurations

### User Feedback
- Collect user reports
- Monitor support tickets
- Track feature requests
- Measure adoption rate

---

## Scaling Considerations

### Performance Optimization
- Implement pagination for large form lists
- Add caching for DocType metadata
- Optimize field loading
- Consider CDN for assets

### Feature Enhancements
- Add form templates
- Implement form versioning
- Add conditional fields
- Support form workflows
- Enable bulk sharing

---

## Support

For issues:
1. Check [ERPNEXT_SETUP.md](./ERPNEXT_SETUP.md)
2. Review Vercel logs
3. Test API endpoints directly
4. Create GitHub issue with details

---

## Next Steps

After successful deployment:
1. Train users on form creation
2. Create template forms for common use cases
3. Set up form approval workflows
4. Monitor usage and gather feedback
5. Plan feature enhancements

---

**Congratulations!** Your Zoho Forms-like web app is now deployed and ready to use.
