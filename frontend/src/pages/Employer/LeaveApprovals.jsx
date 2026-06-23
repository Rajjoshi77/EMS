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
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import api from '../../services/api';

const LeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves');
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

  const handleAction = async (id, status) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  const getStatusChip = (status) => {
    if (status === 'Approved') return <Chip label="Approved" color="success" size="small" />;
    if (status === 'Rejected') return <Chip label="Rejected" color="error" size="small" />;
    return <Chip label="Pending" color="warning" size="small" />;
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Leave Requests</Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No leave requests found.</TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave._id}>
                  <TableCell>{leave.employeeId?.name || 'N/A'}</TableCell>
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>
                    {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>{getStatusChip(leave.status)}</TableCell>
                  <TableCell align="right">
                    {leave.status === 'Pending' ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleAction(leave._id, 'Approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleAction(leave._id, 'Rejected')}
                        >
                          Reject
                        </Button>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Processed by {leave.approvedBy?.name || 'Manager'}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LeaveApprovals;
