import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Chip,
  CircularProgress,
} from '@mui/material';
import api from '../../services/api';

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); 

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/my-history?month=${month}`);
      setHistory(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [month]);

  const getStatusChip = (status) => {
    if (status === 'Present') return <Chip label="Present" color="success" size="small" />;
    if (status === 'Late') return <Chip label="Late" color="warning" size="small" />;
    if (status === 'Half Day') return <Chip label="Half Day" color="info" size="small" />;
    return <Chip label="Absent" color="error" size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">My Attendance Log</Typography>
        <TextField
          type="month"
          size="small"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Total Hours</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
            ) : history.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No attendance records found for this month.</TableCell></TableRow>
            ) : (
              history.map((row) => (
                <TableRow key={row._id}>
                  <TableCell fontWeight="bold">{row.date}</TableCell>
                  <TableCell>{new Date(row.checkIn).toLocaleTimeString()}</TableCell>
                  <TableCell>{row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : '--'}</TableCell>
                  <TableCell>{row.totalHours ? `${row.totalHours} hrs` : '--'}</TableCell>
                  <TableCell>{getStatusChip(row.attendanceStatus)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceHistory;
