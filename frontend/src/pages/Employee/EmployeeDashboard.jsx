import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import { PlayArrow, Stop, WatchLater } from '@mui/icons-material';
import api from '../../services/api';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [msg, setMsg] = useState({ text: '', severity: 'info' });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/dashboard');
      setStats(res.data);

      
      const historyRes = await api.get('/attendance/my-history');
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecord = historyRes.data.data.find((r) => r.date === todayStr);
      setTodayAttendance(todayRecord || null);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/attendance/checkin');
      setTodayAttendance(res.data.data);
      setMsg({ text: 'Checked in successfully!', severity: 'success' });
      fetchDashboardData();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Check-in failed', severity: 'error' });
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.put('/attendance/checkout');
      setTodayAttendance(res.data.data);
      setMsg({ text: 'Checked out successfully!', severity: 'success' });
      fetchDashboardData();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Check-out failed', severity: 'error' });
    }
  };

  if (loading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const widgets = stats.widgets || {};
  const attendanceHistory = stats.attendanceHistory || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Employee Portal
      </Typography>

      {msg.text && (
        <Alert severity={msg.severity} sx={{ mb: 3 }} onClose={() => setMsg({ text: '', severity: 'info' })}>
          {msg.text}
        </Alert>
      )}

      {}
      <Card sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WatchLater color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">Work Shift Tracking</Typography>
              <Typography variant="body2" color="text.secondary">
                {todayAttendance
                  ? todayAttendance.checkOut
                    ? `Shift completed today. Total Hours: ${todayAttendance.totalHours} hrs`
                    : `Checked in at ${new Date(todayAttendance.checkIn).toLocaleTimeString()}`
                  : 'You have not checked in today.'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={handleCheckIn}
              disabled={!!todayAttendance}
            >
              Check In
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Stop />}
              onClick={handleCheckOut}
              disabled={!todayAttendance || !!todayAttendance.checkOut}
            >
              Check Out
            </Button>
          </Box>
        </CardContent>
      </Card>

      {}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2">Attendance Summary</Typography>
              <Typography variant="h4" fontWeight="bold">{widgets.attendanceSummary || '0/0'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2">Leave Balance</Typography>
              <Typography variant="h4" fontWeight="bold">{widgets.leaveBalance || 0} Days</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2">Last Month Net Salary</Typography>
              <Typography variant="h4" fontWeight="bold">{widgets.salaryInformation || 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Recent Attendance History</Typography>
          <List>
            {attendanceHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No attendance logs available.</Typography>
            ) : (
              attendanceHistory.map((log) => (
                <ListItem key={log._id} dividerSecondary>
                  <ListItemText
                    primary={`Date: ${log.date}`}
                    secondary={`Check In: ${new Date(log.checkIn).toLocaleTimeString()} | Check Out: ${log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : 'N/A'} | Total Hours: ${log.totalHours} hrs`}
                  />
                  <Button variant="outlined" size="small" disabled>
                    {log.attendanceStatus}
                  </Button>
                </ListItem>
              ))
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeDashboard;
