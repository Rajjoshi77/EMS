import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import api from '../../services/api';

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/my-leaves');
      setLeaves(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      leaveType: 'Casual Leave',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
    });
    setFormError('');
    setOpenDialog(true);
  };

  const handleApply = async () => {
    try {
      if (!formData.startDate || !formData.endDate || !formData.reason) {
        setFormError('Please fill in all fields');
        return;
      }
      await api.post('/leaves', formData);
      setOpenDialog(false);
      fetchLeaves();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Apply leave request failed');
    }
  };

  const getStatusChip = (status) => {
    if (status === 'Approved') return <Chip label="Approved" color="success" size="small" />;
    if (status === 'Rejected') return <Chip label="Rejected" color="error" size="small" />;
    return <Chip label="Pending" color="warning" size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Leave Requests</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
          Apply for Leave
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Leave Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow>
            ) : leaves.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No leave requests submitted yet.</TableCell></TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave._id}>
                  <TableCell fontWeight="bold">{leave.leaveType}</TableCell>
                  <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>{getStatusChip(leave.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField
            select
            margin="dense"
            label="Leave Type"
            fullWidth
            value={formData.leaveType}
            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
          >
            <MenuItem value="Casual Leave">Casual Leave</MenuItem>
            <MenuItem value="Sick Leave">Sick Leave</MenuItem>
            <MenuItem value="Paid Leave">Paid Leave</MenuItem>
            <MenuItem value="Emergency Leave">Emergency Leave</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Reason"
            fullWidth
            multiline
            rows={3}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleApply} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveRequests;
