import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../utils/api';

const CalendarSync = ({ appointmentId, onSync }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    checkGoogleConnection();
    fetchProviders();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const response = await appointmentAPI.getCalendarEvents();
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await appointmentAPI.getCalendarProviders();
      setProviders(response.data.providers || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getGoogleAuthUrl();
      window.open(response.data.authUrl, '_blank', 'width=500,height=600');
      
      // Poll for connection status
      const checkConnection = setInterval(async () => {
        try {
          await appointmentAPI.getCalendarEvents();
          setIsConnected(true);
          clearInterval(checkConnection);
          setLoading(false);
        } catch (error) {
          // Still not connected
        }
      }, 2000);

      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(checkConnection);
        setLoading(false);
      }, 120000);
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      setLoading(false);
    }
  };

  const syncToCalendar = async (provider = 'google') => {
    try {
      setLoading(true);
      await appointmentAPI.syncAppointmentToCalendar(appointmentId, [provider]);
      onSync && onSync();
      alert('Appointment synced to calendar successfully!');
    } catch (error) {
      console.error('Error syncing to calendar:', error);
      alert('Failed to sync appointment to calendar');
    } finally {
      setLoading(false);
    }
  };

  const downloadICalFile = async () => {
    try {
      const response = await appointmentAPI.downloadICalFile(appointmentId);
      const blob = new Blob([response.data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointment_${appointmentId}.ics`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading iCal file:', error);
      alert('Failed to download calendar file');
    }
  };

  return (
    <div className="calendar-sync bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">📅 Calendar Integration</h3>
      
      {!isConnected ? (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Connect your Google Calendar to automatically sync appointments
          </p>
          <button
            onClick={connectGoogleCalendar}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Connecting...' : '🔗 Connect Google Calendar'}
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-sm text-green-600 mb-2">✅ Google Calendar connected</p>
          <button
            onClick={() => syncToCalendar('google')}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 mr-2"
          >
            {loading ? 'Syncing...' : '📤 Sync to Google Calendar'}
          </button>
        </div>
      )}

      <div className="border-t pt-3">
        <p className="text-sm text-gray-600 mb-2">Or download calendar file:</p>
        <button
          onClick={downloadICalFile}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          📥 Download .ics file
        </button>
      </div>
    </div>
  );
};

export default CalendarSync;