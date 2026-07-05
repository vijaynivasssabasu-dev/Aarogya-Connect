# MedCare AI — AI-Powered Hospital Management & Patient Health Record Platform

MedCare AI is a comprehensive, production-ready, full-stack healthcare platform designed for patients, doctors, receptionists, and administrators. It integrates appointment scheduling, integrated payments, electronic health records (EHR), automated AI no-show follow-up calls, and an AI health assistant.

---

## 🌟 Key Features

### 👤 Patient Portal
* **Dashboard**: Overview of upcoming appointments, recent medical records, and quick links.
* **Book Appointment**: Intuitive booking flow selecting Category → Doctor → Available Date & Time slot.
* **My Appointments**: Status tracking (booked, pending payment, rescheduled, completed, cancelled) and cancellation options.
* **EHR (Medical Records)**: Access detailed diagnostic sheets, symptoms list, vital signs, prescriptions, and follow-up plans.
* **Payments**: Integrated payment history.
* **AI Health Assistant**: Empathic chat interface providing symptoms insights, medical terminology lookups, and first-aid instructions powered by Claude.

### 🩺 Doctor Portal
* **Dashboard**: Schedule summary and statistics for today's visits.
* **Appointments**: List appointments with patient profiles, status indicators, and one-click completion.
* **EHR Management**: Create and edit medical records including diagnosis, vital signs, notes, and medication prescription tables.

### 💼 Receptionist Desk
* **Dashboard**: Overview of today's check-in queue.
* **Check-In Queue**: Search patient appointments by name/phone and mark check-ins to prevent automatic AI no-show calls.
* **Scheduling**: Full calendar view of all hospital appointments.

### 📊 Admin Panel
* **Platform Analytics**: Total revenue, count statistics, and appointment status breakdown pie charts.
* **Hospitals CRUD**: Complete management of associated medical facilities.
* **Doctor Directory**: Manage doctor records and specialties.
* **User Management**: Unified lists of patients, doctors, and receptionists.
* **Reports**: Analytics charts tracking top doctors, monthly revenue trends, and status distributions.

### 🤖 AI Call Integration
* **Missed Call IVR**: Real-time automated calling utilizing Twilio Voice. Dials patients 25 minutes after missed slots.
* **Speech-to-Text & LLM**: Transcribes patient response and parses preferred rescheduling slot via Claude.
* **Auto-Update**: Reschedules appointments in MongoDB and triggers confirmation messages.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Tailwind CSS v3, React Router v6, Axios, Lucide Icons, Recharts
* **Backend**: Express, Node.js, JWT Auth, Helmet, Express Rate Limit, Morgan, node-cron
* **Database**: MongoDB (Mongoose)
* **Integrations**: Twilio Voice SDK, Anthropic Claude SDK, Razorpay Checkout SDK

---

## 📁 Folder Structure

```
healthcare-platform/
├── backend/
│   ├── config/              # MongoDB connection configuration
│   ├── jobs/                # Cron checker for no-show appointments
│   ├── middleware/          # JWT check & express-validator handlers
│   ├── models/              # Mongoose schemas (Patient, Doctor, Admin, etc.)
│   ├── routes/              # Express API endpoints
│   ├── seed/                # DB seed scripts
│   ├── services/            # Twilio outbound call handler
│   ├── utils/               # LLM slot parser and JWT generator
│   └── server.js            # Express API server entry point
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── api/             # Axios base service instance
│   │   ├── components/      # Layout wrappers and UI elements
│   │   ├── contexts/        # Auth Context provider
│   │   ├── pages/           # Pages grouped by portal role
│   │   ├── App.jsx          # Route paths mapping
│   │   └── main.jsx         # React DOM render entry
│   ├── tailwind.config.js   # Tailwind style themes configuration
│   └── vercel.json          # SPA rewrite rules
├── docs/                    # Deploy and API documentation files
└── LICENSE                  # MIT License details
```

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and configure:
```ini
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/medcare
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_32_character_long_secret_hash
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
SERVER_BASE_URL=https://your-public-url.com
ANTHROPIC_API_KEY=your_anthropic_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend Configuration (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```ini
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Running Locally

### 1. Database Seeding
Connect to your MongoDB database and populate it with sample roles:
```bash
cd backend
npm install
npm run seed
```

### 2. Start the Backend API
```bash
npm run dev
```

### 3. Start the Frontend Dev Server
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

#### Demo Credentials (password for all: `password123`)
* **Admin**: `admin@healthcare.com`
* **Doctor**: `rajesh@healthcare.com`
* **Patient**: `ravi@example.com`
* **Receptionist**: `meena@healthcare.com`

---

## ☁️ Deployment

For detailed production instructions, see [DEPLOYMENT.md](file:///C:/Users/nivass/.gemini/antigravity/scratch/healthcare-platform/docs/DEPLOYMENT.md).

* **Frontend**: Deploy to Vercel (uses `vercel.json` for routing rewrites).
* **Backend**: Deploy to Render or Railway (fully binds to `$PORT`).
* **Database**: MongoDB Atlas.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](file:///C:/Users/nivass/.gemini/antigravity/scratch/healthcare-platform/LICENSE) file for details.
