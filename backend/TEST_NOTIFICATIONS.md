# How to Test Notifications API

## Prerequisites

1. **Backend server must be running** on `http://localhost:5000`
2. **You need a valid customerId** from your database
3. **Customer must exist** in `b2c_customer_master` table

## Step 1: Get a Customer ID

First, you need to know a customer ID to test with. You can:

### Option A: Use an existing customer ID
If you've already signed up, use that customer ID (it's returned in the login/verify-otp response).

### Option B: Check database directly
```sql
SELECT customer_id, customer_name, status FROM b2c_customer_master LIMIT 5;
```

### Option C: Sign up a new customer
Use the signup API to create a new customer, then use the customer ID from the response.

## Step 2: Test Notifications API

### Method 1: Using cURL (Terminal)

```bash
# Replace 1001 with your actual customer ID
curl "http://localhost:5000/api/notifications?customerId=1001"
```

**Pretty formatted output:**
```bash
curl -s "http://localhost:5000/api/notifications?customerId=1001" | python3 -m json.tool
```

### Method 2: Using Browser

Open in your browser:
```
http://localhost:5000/api/notifications?customerId=1001
```

### Method 3: Using Postman/Insomnia

1. **Method:** GET
2. **URL:** `http://localhost:5000/api/notifications?customerId=1001`
3. **Headers:** None required
4. **Body:** None

## Expected Response

### Success Response (200):
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "approval_1001",
        "title": "Account Approved",
        "message": "Great news, John Doe! Your account has been approved...",
        "time": "2 hours ago",
        "type": "update",
        "icon": "✅",
        "isRead": false,
        "priority": "high",
        "createdAt": "2024-01-15 10:30:00"
      },
      {
        "id": "welcome_1001",
        "title": "Welcome to OneStep Greener!",
        "message": "Welcome John Doe! Thank you for joining...",
        "time": "1 day ago",
        "type": "update",
        "icon": "🌱",
        "isRead": true,
        "priority": "high",
        "createdAt": "2024-01-14 09:00:00"
      }
    ],
    "unreadCount": 1
  }
}
```

### Error Responses:

**400 - Missing Customer ID:**
```json
{
  "status": "error",
  "message": "Customer ID is required"
}
```

**404 - Customer Not Found:**
```json
{
  "status": "error",
  "message": "Customer not found"
}
```

## Step 3: Test from Frontend (NotificationScreen)

1. **Login to the app** using a registered mobile number
2. **Navigate to Notifications screen** (bell icon)
3. **Notifications will automatically load** from the API
4. **Check console logs** for API calls:
   - `📬 Fetching notifications for customer: 1001`
   - `✅ Notifications fetched: 5`

## Step 4: Test Different Customer Statuses

### Test with PENDING Customer:
```bash
# Use a customer ID with status='PENDING'
curl "http://localhost:5000/api/notifications?customerId=1001"
```
**Expected:** You'll see "Profile Under Review" notification

### Test with APPROVED Customer:
```bash
# Use a customer ID with status='APPROVED'
curl "http://localhost:5000/api/notifications?customerId=1001"
```
**Expected:** You'll see "Account Approved" notification

## Step 5: Test Mark as Read API

```bash
curl -X POST http://localhost:5000/api/notifications/mark-read \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "1001",
    "notificationId": "approval_1001"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Notification marked as read"
}
```

## Step 6: Test Device Token Registration (for Push Notifications)

```bash
curl -X POST http://localhost:5000/api/notifications/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "1001",
    "deviceToken": "test_fcm_token_12345",
    "platform": "android"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Device token registered successfully"
}
```

## Notification Types Generated

The API generates different notifications based on customer data:

1. **Account Approved** - If `status = 'APPROVED'`
2. **Welcome Message** - If account created within last 7 days
3. **Profile Under Review** - If `status = 'PENDING'`
4. **Environmental Impact** - Based on `est_waste_qty`
5. **Service Available** - Based on `city` location

## Troubleshooting

### Issue: "Customer not found"
**Solution:** Make sure the customerId exists in the database. Check with:
```sql
SELECT customer_id FROM b2c_customer_master WHERE customer_id = '1001';
```

### Issue: Empty notifications array
**Solution:** This is normal if:
- Customer was created more than 7 days ago (no welcome message)
- Customer has no waste quantity set
- Customer has no city set

### Issue: API returns error
**Solution:** 
1. Check backend server is running
2. Check database connection
3. Check customer exists in database
4. Check Flask console for error messages

## Quick Test Script

Save this as `test_notifications.sh`:

```bash
#!/bin/bash

# Replace with your actual customer ID
CUSTOMER_ID="1001"

echo "Testing Notifications API for Customer ID: $CUSTOMER_ID"
echo "=========================================="
echo ""

echo "1. Fetching notifications..."
curl -s "http://localhost:5000/api/notifications?customerId=$CUSTOMER_ID" | python3 -m json.tool

echo ""
echo "2. Testing mark as read..."
curl -s -X POST http://localhost:5000/api/notifications/mark-read \
  -H "Content-Type: application/json" \
  -d "{\"customerId\": \"$CUSTOMER_ID\"}" | python3 -m json.tool

echo ""
echo "3. Testing device token registration..."
curl -s -X POST http://localhost:5000/api/notifications/register-device \
  -H "Content-Type: application/json" \
  -d "{\"customerId\": \"$CUSTOMER_ID\", \"deviceToken\": \"test_token_123\", \"platform\": \"android\"}" | python3 -m json.tool
```

Make it executable and run:
```bash
chmod +x test_notifications.sh
./test_notifications.sh
```

## Testing in React Native App

1. **Login to the app** (this sets `profileData.customerId`)
2. **Open NotificationScreen** (tap bell icon)
3. **Check React Native console** for:
   - `📬 Fetching notifications for customer: 1001`
   - `✅ Notifications fetched: 5`
4. **Notifications should appear** on screen automatically
5. **Tap "Refresh" button** to reload notifications
6. **Tap a notification** to mark it as read

## Example Test Flow

```bash
# 1. First, sign up a customer (or use existing)
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "mobileNumber": "9876543210",
    "houseNumber": "123",
    "address": "Test Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "userType": "Household Apartment",
    "knowAboutUs": "Social Media",
    "expectation": "50"
  }'

# 2. Note the customer_id from response, then test notifications
# (Assuming customer_id is 1001)
curl "http://localhost:5000/api/notifications?customerId=1001"
```

## Notes

- **No Database Table Needed:** Notifications are generated dynamically from existing customer data
- **Real-time:** Notifications are generated fresh each time you call the API
- **Customer-specific:** Each customer sees notifications based on their own data
- **Automatic:** Notifications appear based on customer status, creation date, waste quantity, etc.

