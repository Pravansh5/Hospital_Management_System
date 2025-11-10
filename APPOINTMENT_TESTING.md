# Appointment System Testing Guide

## Issues Fixed

### 1. **Port Consistency**
- Fixed API calls to use port 4000 consistently across the application
- Updated BookingForm, AppointmentsPage, and API utility to use the correct server port

### 2. **Actual Appointment Creation**
- BookingForm now actually creates appointments instead of just showing an alert
- Integrated with the backend API to save appointments to the database
- Added proper error handling and loading states

### 3. **Time Slot Availability**
- BookingForm now fetches real available time slots from the server
- Time slots are dynamically generated based on doctor's working hours (9 AM - 5 PM)
- Booked slots are automatically excluded from available options
- Improved conflict detection logic in the backend

### 4. **Time Slot Conflict Prevention**
- Enhanced the appointment controller to properly detect overlapping time slots
- When a slot is booked, it becomes unavailable for other patients
- Added logging for debugging appointment conflicts

## How to Test

### Prerequisites
1. Make sure MongoDB is running
2. Start the server: `cd server && npm start`
3. Start the client: `cd client && npm start`

### Manual Testing Steps

1. **Register/Login as a Patient**
   - Go to the homepage
   - Click "Sign Up" and create a patient account
   - Login with your credentials

2. **Browse Doctors**
   - Click "Browse Doctors" in the navigation
   - Select a doctor and click "Book Now"

3. **Book an Appointment**
   - Select a date (next 7 weekdays are available)
   - Choose an available time slot
   - Fill in your information (auto-filled if logged in)
   - Click "Confirm Appointment"

4. **View Your Appointments**
   - Click "My Appointments" in the navigation
   - You should see your booked appointment

5. **Test Slot Blocking**
   - Try to book the same time slot with another patient account
   - The slot should not be available anymore

### Automated Testing

Run the test script to verify all functionality:

```bash
cd Hospital_Management_System
node test-appointments.js
```

This script will:
- Create test patient and doctor accounts
- Check available time slots
- Book an appointment
- Verify the slot is no longer available
- Confirm appointments appear in both patient and doctor views

## Key Features Implemented

### Frontend (BookingForm.jsx)
- ✅ Dynamic date generation (next 7 weekdays)
- ✅ Real-time slot availability checking
- ✅ Actual appointment creation via API
- ✅ Loading states and error handling
- ✅ Auto-fill user information for logged-in users

### Frontend (AppointmentsPage.jsx)
- ✅ Display appointments for both patients and doctors
- ✅ Filter appointments by status
- ✅ Update appointment status (cancel for patients)
- ✅ Detailed appointment view modal

### Backend (appointment.controller.js)
- ✅ Create appointments with conflict checking
- ✅ Get available time slots for doctors
- ✅ Retrieve user-specific appointments
- ✅ Update appointment status
- ✅ Proper time slot overlap detection

### Backend (appointments.model.js)
- ✅ Comprehensive appointment schema
- ✅ Support for different appointment types
- ✅ Status tracking and special requirements
- ✅ Proper indexing for efficient queries

## API Endpoints Used

- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/my` - Get user's appointments
- `GET /api/appointments/available/:doctorId/:date` - Get available slots
- `PATCH /api/appointments/:id/status` - Update appointment status

## Time Slot Logic

- **Working Hours**: 9:00 AM - 5:00 PM
- **Slot Duration**: 30 minutes
- **Available Days**: Monday - Friday (weekends excluded)
- **Booking Window**: Next 7 business days
- **Conflict Detection**: Overlapping time ranges are blocked

## Troubleshooting

### Common Issues

1. **"No appointments found"**
   - Make sure you're logged in
   - Check that appointments were actually created (check browser network tab)

2. **"No available slots"**
   - Try a different date
   - Check if the doctor exists in the system

3. **Port connection errors**
   - Ensure server is running on port 4000
   - Check that all API calls use the correct port

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your server `.env` file. This will show detailed logs for appointment creation and conflict checking.