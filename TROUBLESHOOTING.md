# Troubleshooting Guide - Hospital Management System

## Common Issues and Solutions

### 1. "Browse Doctors" Button Not Working

**Symptoms:**
- Clicking "Browse Doctors" in navbar doesn't navigate to doctors page
- No response when clicking the button

**Solutions:**
1. **Check if frontend server is running:**
   ```bash
   cd client
   npm run dev
   ```

2. **Check browser console for errors:**
   - Open Developer Tools (F12)
   - Look for JavaScript errors in Console tab
   - Check Network tab for failed requests

3. **Verify routing is working:**
   - Manually navigate to `http://localhost:5173/doctors`
   - If this works, the issue is with the button click handler

### 2. "Book Appointment" Button Not Working

**Symptoms:**
- Clicking "Book Now" on doctor cards doesn't navigate to booking form
- Button appears but doesn't respond to clicks

**Solutions:**
1. **Check if backend server is running:**
   ```bash
   cd server
   npm start
   ```
   Backend should be running on `http://localhost:4000`

2. **Verify doctor ID is being passed correctly:**
   - Check browser console for navigation logs
   - Ensure doctor data has valid `id` field

3. **Test booking form directly:**
   - Navigate to `http://localhost:5173/book/1` (replace 1 with actual doctor ID)

### 3. API Connection Issues

**Symptoms:**
- "Error Loading Doctors" message
- Network errors in browser console
- Empty doctor list

**Solutions:**
1. **Start backend server:**
   ```bash
   cd server
   npm start
   ```

2. **Check API endpoint:**
   - Verify `http://localhost:4000/api/provider` returns data
   - Check server logs for errors

3. **CORS Issues:**
   - Ensure backend has CORS configured for `http://localhost:5173`

### 4. CSS Styling Issues

**Symptoms:**
- Buttons appear unstyled
- Layout looks broken
- Missing hover effects

**Solutions:**
1. **Verify Tailwind CSS is working:**
   - Check if basic Tailwind classes work (e.g., `bg-blue-500`)
   
2. **Check custom CSS classes:**
   - Ensure `.btn-primary` class is defined in `App.css`
   - Verify Tailwind directives are imported in `index.css`

## Quick Start Commands

### Start Both Servers (Windows):
```bash
# Run the batch file
start-dev.bat
```

### Start Servers Manually:

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run dev
```

## Debugging Steps

1. **Check Console Logs:**
   - Open browser Developer Tools (F12)
   - Look for navigation logs when clicking buttons
   - Check for any error messages

2. **Verify URLs:**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:4000`
   - API Test: `http://localhost:4000/api/provider`

3. **Test Navigation:**
   - Try manual URL navigation
   - Check if React Router is working properly

## Contact Information

If issues persist:
1. Check server logs for detailed error messages
2. Verify all dependencies are installed (`npm install`)
3. Ensure environment variables are configured properly
4. Check database connection (if applicable)