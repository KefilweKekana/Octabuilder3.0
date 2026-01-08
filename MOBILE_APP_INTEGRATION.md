# Mobile App Integration Guide

Your mobile app is now receiving assigned forms, but needs to fetch the DocType fields and records.

---

## Problem: Forms Have No Fields or Records

**What's happening:**
- ✅ Mobile app gets: "Show Customer DocType"
- ❌ Mobile app doesn't know: What fields does Customer have?
- ❌ Mobile app doesn't have: Existing Customer records

**Why:**
The "Assigned Form" only stores which DocType to show, not the field configuration or records.

---

## Solution: New Endpoint for DocType Metadata

I've created `/api/mobile/doctype-meta.js` which returns:
1. Field definitions (what fields the DocType has)
2. Existing records (data already in ERPNext)

---

## How to Use

### Step 1: Get Assigned Forms (You have this)

```dart
GET https://octabuilder3-0.vercel.app/api/mobile/assigned-forms
```

**Response:**
```json
[
  {
    "name": "ct9j4l71r8",
    "doctype": "Customer",
    "label": "Test Customer",
    "icon": "user"
  }
]
```

### Step 2: Get DocType Fields & Records (NEW)

For each assigned form, call:

```dart
GET https://octabuilder3-0.vercel.app/api/mobile/doctype-meta?doctype=Customer

Headers:
  Authorization: token API_KEY:API_SECRET
  x-erpnext-url: https://your-erpnext.com|||API_KEY:API_SECRET
```

**Response:**
```json
{
  "doctype": "Customer",
  "module": "Selling",
  "fields": [
    {
      "fieldname": "customer_name",
      "label": "Customer Name",
      "fieldtype": "Data",
      "reqd": 1
    },
    {
      "fieldname": "email_id",
      "label": "Email",
      "fieldtype": "Data"
    }
  ],
  "records": [
    {
      "name": "CUST-00001",
      "customer_name": "ABC Corp",
      "email_id": "info@abc.com"
    }
  ],
  "record_count": 1
}
```

---

## Complete Flutter Example

```dart
// 1. Fetch assigned forms
final assignedForms = await http.get(
  Uri.parse('$baseUrl/api/mobile/assigned-forms'),
  headers: headers,
);

// 2. For each form, fetch metadata
for (var form in jsonDecode(assignedForms.body)) {
  final meta = await http.get(
    Uri.parse('$baseUrl/api/mobile/doctype-meta?doctype=${form['doctype']}'),
    headers: headers,
  );

  final metaData = jsonDecode(meta.body);

  // Now you have:
  // - metaData['fields'] = Field definitions
  // - metaData['records'] = Existing records

  // Display list of existing records
  for (var record in metaData['records']) {
    print('${record['name']}: ${record['customer_name']}');
  }
}
```

---

## Next Steps

1. **Deploy the new endpoint:**
   ```bash
   git add api/mobile/doctype-meta.js
   git commit -m "Add DocType metadata endpoint"
   git push origin main
   ```

2. **Update your mobile app** to call `/api/mobile/doctype-meta` for each assigned form

3. **Render dynamic forms** based on the `fields` array

4. **Show existing records** from the `records` array

---

## Testing the Endpoint

```bash
curl "https://octabuilder3-0.vercel.app/api/mobile/doctype-meta?doctype=Customer" \
  -H "Authorization: token YOUR_KEY:YOUR_SECRET" \
  -H "x-erpnext-url: YOUR_ERPNEXT_URL|||YOUR_KEY:YOUR_SECRET"
```

Should return Customer fields and existing records! ✅
