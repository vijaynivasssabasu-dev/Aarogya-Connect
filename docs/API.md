# MedCare AI — REST API Documentation

This document describes all API endpoints exposed by the MedCare AI backend.

All request bodies must be JSON (`Content-Type: application/json`).
All protected endpoints require the `Authorization` header with a valid Bearer JWT:
`Authorization: Bearer <your_jwt_token>`

---

## Authentication Endpoints (`/api/auth`)

### 1. User Registration
* **Endpoint**: `POST /api/auth/register`
* **Request Body**:
  ```json
  {
    "role": "patient", // "patient", "doctor", "receptionist", "admin"
    "name": "Ravi Teja",
    "email": "ravi@example.com",
    "phone": "+919123456789",
    "password": "password123",
    "dob": "1990-05-15",
    "gender": "Male",
    "bloodGroup": "O+",
    "address": "Hyderabad"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "role": "patient",
    "user": {
      "_id": "60d5ec42c4b2c123456789ab",
      "name": "Ravi Teja",
      "email": "ravi@example.com",
      "phone": "+919123456789",
      "dob": "1990-05-15T00:00:00.000Z",
      "gender": "Male",
      "bloodGroup": "O+",
      "address": "Hyderabad"
    }
  }
  ```

### 2. User Login
* **Endpoint**: `POST /api/auth/login`
* **Request Body**:
  ```json
  {
    "role": "patient",
    "identifier": "ravi@example.com", // can be email or phone number
    "password": "password123"
  }
  ```
* **Success Response (200 OK)**: (Same structure as registration)

### 3. Get Current User Details (Session Recovery)
* **Endpoint**: `GET /api/auth/me`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "role": "patient",
    "user": { ... }
  }
  ```

---

## Appointment Endpoints (`/api/appointments`)

### 1. Retrieve Doctor Categories
* **Endpoint**: `GET /api/appointments/categories`
* **Success Response (200 OK)**:
  ```json
  {
    "categories": [
      { "_id": "60d5ec42c4b2c00000000001", "categoryName": "Cardiology" }
    ]
  }
  ```

### 2. Retrieve Hospitals
* **Endpoint**: `GET /api/appointments/hospitals`
* **Success Response (200 OK)**:
  ```json
  {
    "hospitals": [
      { "_id": "60d5ec42c4b2c00000000002", "name": "City General Hospital", "city": "Hyderabad", "address": "Banjara Hills", "phone": "+914023456789" }
    ]
  }
  ```

### 3. Get Available Doctors
* **Endpoint**: `GET /api/appointments/available-doctors?categoryId=<id>`
* **Success Response (200 OK)**:
  ```json
  {
    "count": 1,
    "doctors": [
      {
        "_id": "60d5ec42c4b2c00000000003",
        "name": "Dr. Rajesh Kumar",
        "hospital": { "name": "City General Hospital", "city": "Hyderabad" },
        "category": { "categoryName": "Cardiology" },
        "availabilityStatus": "available"
      }
    ]
  }
  ```

### 4. Book Appointment (creates "pending_payment" state)
* **Endpoint**: `POST /api/appointments/book`
* **Headers**: `Authorization: Bearer <token>` (Patient only)
* **Request Body**:
  ```json
  {
    "doctorId": "60d5ec42c4b2c00000000003",
    "hospitalId": "60d5ec42c4b2c00000000002",
    "slotDate": "2026-07-10",
    "slotTime": "17:00"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "appointment": {
      "_id": "60d5ec42c4b2c00000000004",
      "patient": "60d5ec42c4b2c123456789ab",
      "doctor": "60d5ec42c4b2c00000000003",
      "hospital": "60d5ec42c4b2c00000000002",
      "slotDate": "2026-07-10",
      "slotTime": "17:00",
      "status": "pending_payment",
      "isEmergency": false,
      "noShowCallTriggered": false
    }
  }
  ```

### 5. Check-In Patient
* **Endpoint**: `PATCH /api/appointments/:id/check-in`
* **Headers**: `Authorization: Bearer <token>` (Receptionist only)
* **Success Response (200 OK)**: Returns updated appointment object with `checkedInAt` timestamp.

---

## AI Health Assistant Endpoint (`/api/health-assistant`)

### 1. Chat with Health Assistant
* **Endpoint**: `POST /api/health-assistant/chat`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "message": "What are common symptoms of heatstroke?",
    "conversationHistory": [
      { "role": "user", "content": "Hi" },
      { "role": "assistant", "content": "Hello! I am your AI Health Assistant. How can I help you?" }
    ]
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "reply": "Common symptoms of heatstroke include high body temperature, altered mental state or confusion, hot and dry skin, nausea, rapid breathing, and headache..."
  }
  ```

---

## Payments Endpoints (`/api/payments`)

### 1. Create Razorpay Order
* **Endpoint**: `POST /api/payments/create-order`
* **Headers**: `Authorization: Bearer <token>` (Patient only)
* **Request Body**:
  ```json
  {
    "appointmentId": "60d5ec42c4b2c00000000004",
    "amount": 500
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "order": { "id": "order_FHaX2c1eQ...", "amount": 50000, "currency": "INR" },
    "paymentId": "60d5ec42c4b2c00000000005",
    "keyId": "rzp_test_..."
  }
  ```

### 2. Verify Razorpay Payment Signature
* **Endpoint**: `POST /api/payments/verify`
* **Headers**: `Authorization: Bearer <token>` (Patient only)
* **Request Body**:
  ```json
  {
    "razorpay_order_id": "order_FHaX2c1eQ...",
    "razorpay_payment_id": "pay_FHaY3d2fR...",
    "razorpay_signature": "signature_hash...",
    "paymentId": "60d5ec42c4b2c00000000005"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  { "success": true }
  ```

---

## Medical Records Endpoints (`/api/medical-records`)

### 1. View My Medical Records
* **Endpoint**: `GET /api/medical-records/my`
* **Headers**: `Authorization: Bearer <token>` (Patient only)
* **Success Response (200 OK)**: Returns array of medical record documents with populated doctor details.

### 2. Create Medical Record
* **Endpoint**: `POST /api/medical-records`
* **Headers**: `Authorization: Bearer <token>` (Doctor only)
* **Request Body**:
  ```json
  {
    "patient": "60d5ec42c4b2c123456789ab",
    "appointment": "60d5ec42c4b2c00000000004",
    "diagnosis": "Acute Bronchitis",
    "symptoms": ["cough", "mild fever", "chest congestion"],
    "prescription": [
      { "medicine": "Amoxicillin", "dosage": "500mg, thrice daily", "duration": "5 days", "notes": "After food" }
    ],
    "notes": "Patient advised rest for 3 days.",
    "vitalSigns": { "bloodPressure": "120/80", "heartRate": 72, "temperature": 99.1 }
  }
  ```
* **Success Response (201 Created)**: Returns created record.
