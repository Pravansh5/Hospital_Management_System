# Hospital Management System

A simplified hospital management system for booking and managing medical appointments.

## Features

### Core Functionality
- **User Authentication**: Patient and doctor registration/login
- **Doctor Profiles**: Browse and search healthcare providers
- **Appointment Booking**: Real-time slot availability and booking
- **Appointment Management**: View, cancel, and update appointments
- **Time Slot Management**: Automatic conflict prevention

### User Roles
- **Patients**: Book appointments, view appointment history
- **Doctors**: Manage appointments, view patient bookings
- **Admin**: Full system access (future enhancement)

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Bcrypt for password hashing
- Nodemailer for email notifications

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)

### Installation

1. **Clone and install dependencies**
   git clone <repository-url>
   cd Hospital_Management_System
   
   # Install Server Dependencies
   cd server
   npm install

   # Install Client Dependencies
   cd ../client
   npm install
   ```

2. **Configure environment**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```

3. **Start the Backend**
   ```bash
   cd server
   npm run dev
   ```
   Server will start at: http://localhost:4000

4. **Start the Frontend** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```
   App will start at: http://localhost:3001

## Project Structure

```
Hospital_Management_System/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── utils/         # API utilities
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Database schemas
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & validation
│   │   └── utils/         # Helper functions
└── package.json           # Root scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Appointments
- `GET /api/appointments/my` - Get user appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/available/:doctorId/:date` - Get available slots
- `PATCH /api/appointments/:id/status` - Update appointment status

### Providers
- `GET /api/provider` - Get all doctors
- `GET /api/provider/:id` - Get doctor details
- `POST /api/provider` - Create doctor profile

## Key Features Implemented

### ✅ Working Features
- User registration and authentication
- Doctor profile creation and browsing
- Real-time appointment booking
- Time slot conflict prevention
- Appointment status management
- Responsive design
- Form validation

### 🔄 Basic Implementation
- Email notifications (configured but optional)
- User dashboard with statistics
- Appointment filtering and search

## Environment Variables

```env
PORT=4000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CLIENT_URL=http://localhost:3001

# Optional email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="Hospital Management <no-reply@example.com>"
```

## Usage

1. **Register as a Patient**
   - Visit the homepage
   - Click "Sign Up" and create an account

2. **Browse Doctors**
   - Navigate to "Browse Doctors"
   - Use filters to find specialists
   - View doctor profiles and ratings

3. **Book Appointment**
   - Click "Book Now" on a doctor's profile
   - Select available date and time
   - Fill in appointment details
   - Confirm booking

4. **Manage Appointments**
   - View all appointments in "My Appointments"
   - Cancel pending appointments
   - Check appointment status

## Development

### Available Scripts
- **Backend**: `npm run dev` (inside `/server`)
- **Frontend**: `npm run dev` (inside `/client`)

### Database Seeding
```bash
cd server
node seed-doctors.js
```

## Deployment

The system is designed to be deployed on platforms like:
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details