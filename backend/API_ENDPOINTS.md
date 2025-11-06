# B2C Customer App - API Endpoints Documentation

**Base URL:** `http://localhost:5000`

---

## 1. Health Check

**Endpoint:** `GET /health`

**Description:** Check if the backend server is running

**Request:** No body required

**Response (Success - 200):**
```json
{
  "status": "healthy",
  "message": "Flask backend is running"
}
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/health
```

---

## 2. Test OTP Generation

**Endpoint:** `POST /api/test-otp`

**Description:** Test endpoint to generate OTP and return it directly (for debugging/testing)

**Request Body:**
```json
{
  "mobileNumber": "9876543210"
}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "OTP generated for testing",
  "data": {
    "mobileNumber": "9876543210",
    "otp": "123456",
    "expiresAt": "2024-01-15 10:30:00"
  }
}
```

**Response (Error - 400):**
```json
{
  "status": "error",
  "message": "Valid 10-digit mobile number required"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/test-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9876543210"
  }'
```

---

## 3. Customer Signup

**Endpoint:** `POST /api/signup`

**Description:** Register a new customer. Customer status will be set to 'PENDING' and requires approval.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "mobileNumber": "9876543210",
  "houseNumber": "123",
  "address": "Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "userType": "Household Apartment",
  "knowAboutUs": "Social Media",
  "expectation": "50",
  "alternateContact": "9876543211",
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

**Field Details:**
- `fullName` (required): Customer's full name
- `email` (required): Valid email address
- `mobileNumber` (required): 10-digit mobile number
- `houseNumber` (required): House/building number
- `address` (required): Street address
- `city` (required): City name
- `state` (required): State name
- `userType` (required): One of: "Household Apartment", "School/Institution", "Office", "Shop", "Other"
- `knowAboutUs` (required): How customer learned about the service
- `expectation` (required): Expected waste quantity (numeric value, e.g., "50", "23kgs", "100")
- `alternateContact` (optional): 10-digit alternate contact number
- `latitude` (optional): Latitude coordinate
- `longitude` (optional): Longitude coordinate

**Response (Success - 201):**
```json
{
  "status": "success",
  "message": "Account created successfully! Your profile is under consideration.",
  "data": {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "9876543210",
    "status": "PENDING"
  }
}
```

**Response (Error - 400): Missing Fields**
```json
{
  "status": "error",
  "message": "Missing required fields: fullName, email"
}
```

**Response (Error - 400): Invalid Mobile Number**
```json
{
  "status": "error",
  "message": "Invalid mobile number. Must be 10 digits."
}
```

**Response (Error - 409): Duplicate Entry**
```json
{
  "status": "error",
  "message": "An account with this email already exists."
}
```
OR
```json
{
  "status": "error",
  "message": "An account with this mobile number already exists."
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "9876543210",
    "houseNumber": "123",
    "address": "Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "userType": "Household Apartment",
    "knowAboutUs": "Social Media",
    "expectation": "50",
    "alternateContact": "9876543211",
    "latitude": 19.0760,
    "longitude": 72.8777
  }'
```

---

## 4. Generate OTP for Login

**Endpoint:** `POST /api/login/generate-otp`

**Description:** Generate and send OTP to registered mobile number. Customer must be registered and have APPROVED status.

**Request Body:**
```json
{
  "mobileNumber": "9876543210"
}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "OTP sent successfully to your mobile number",
  "data": {
    "mobileNumber": "9876543210",
    "smsSent": true
  }
}
```

**Response (Success - 200): When SMS fails but OTP is generated (debug mode)**
```json
{
  "status": "success",
  "message": "OTP generated. Please check SMS on 9876543210",
  "data": {
    "mobileNumber": "9876543210",
    "smsSent": false,
    "otp": "123456",
    "otpMessage": "OTP: 123456 (Valid for 5 minutes) - Use this to test if SMS is not received"
  }
}
```

**Response (Error - 400): Invalid Mobile Number**
```json
{
  "status": "error",
  "message": "Please enter a valid 10-digit mobile number"
}
```

**Response (Error - 404): Mobile Not Registered**
```json
{
  "status": "error",
  "message": "Mobile number not registered. Please sign up first."
}
```

**Response (Error - 403): Customer Not Approved**
```json
{
  "status": "error",
  "message": "Your profile is under consideration. Please wait for approval."
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/login/generate-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9876543210"
  }'
```

---

## 5. Verify OTP and Login

**Endpoint:** `POST /api/login/verify-otp`

**Description:** Verify OTP and authenticate user. Returns customer data on successful verification.

**Request Body:**
```json
{
  "mobileNumber": "9876543210",
  "otp": "123456"
}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "OTP verified successfully",
  "data": {
    "customerId": "1001",
    "customerName": "John Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "9876543210",
    "address": "123, Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "userType": "RESIDENTIAL",
    "status": "APPROVED"
  }
}
```

**Response (Error - 400): Missing Fields**
```json
{
  "status": "error",
  "message": "Mobile number is required"
}
```
OR
```json
{
  "status": "error",
  "message": "OTP is required"
}
```

**Response (Error - 400): Invalid Format**
```json
{
  "status": "error",
  "message": "Invalid mobile number format"
}
```
OR
```json
{
  "status": "error",
  "message": "OTP must be 6 digits"
}
```

**Response (Error - 404): OTP Not Found**
```json
{
  "status": "error",
  "message": "OTP not found. Please generate a new OTP."
}
```

**Response (Error - 400): OTP Expired**
```json
{
  "status": "error",
  "message": "OTP has expired. Please generate a new OTP."
}
```

**Response (Error - 400): OTP Already Used**
```json
{
  "status": "error",
  "message": "OTP already used. Please generate a new OTP."
}
```

**Response (Error - 400): Invalid OTP**
```json
{
  "status": "error",
  "message": "Invalid OTP. Please try again."
}
```

**Response (Error - 404): Customer Not Found**
```json
{
  "status": "error",
  "message": "Customer not found"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/login/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9876543210",
    "otp": "123456"
  }'
```

---

## Error Handling

All endpoints return standard error responses:

**404 - Not Found:**
```json
{
  "status": "error",
  "message": "Endpoint not found"
}
```

**500 - Internal Server Error:**
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## Testing Workflow

### Complete Signup → Login Flow:

1. **Signup** (creates customer with PENDING status):
```bash
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
    "knowAboutUs": "Test",
    "expectation": "50"
  }'
```

2. **Note:** Customer needs to be approved in database (status = 'APPROVED') before login

3. **Generate OTP** (only works for APPROVED customers):
```bash
curl -X POST http://localhost:5000/api/login/generate-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9876543210"
  }'
```

4. **Verify OTP** (use OTP from step 3):
```bash
curl -X POST http://localhost:5000/api/login/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9876543210",
    "otp": "123456"
  }'
```

### Quick Test (Test OTP Endpoint):

For quick testing without database requirements:
```bash
curl -X POST http://localhost:5000/api/test-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9876543210"
  }'
```

---

## Notes

- **OTP Validity:** OTPs expire after 5 minutes
- **OTP Format:** 6-digit numeric code
- **Mobile Number Format:** Always 10 digits (no country code in request)
- **User Type Mapping:**
  - "Household Apartment" → RESIDENTIAL
  - "School/Institution" → INSTITUTIONAL
  - "Office" → COMMERCIAL
  - "Shop" → COMMERCIAL
  - "Other" → OTHERS
- **Contact Number Format:** Stored as `+91{mobile_number}` (without slash)
- **Customer ID:** Auto-generated starting from 1001
- **Status Values:** PENDING, APPROVED (only APPROVED can login)

---

## Using Postman/Insomnia

Import these endpoints into your API testing tool:

**Base URL:** `http://localhost:5000`

**Headers (for POST requests):**
```
Content-Type: application/json
```

All POST endpoints require JSON body with the fields specified above.

