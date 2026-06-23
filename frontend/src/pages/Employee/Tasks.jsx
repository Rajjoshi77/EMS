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
  MenuItem,
  TextField,
  Chip,
  CircularProgress,
} from '@mui/material';
import api from '../../services/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTasks(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getPriorityChip = (p) => {
    if (p === 'High') return <Chip label="High" color="error" size="small" />;
    if (p === 'Medium') return <Chip label="Medium" color="warning" size="small" />;
    return <Chip label="Low" color="success" size="small" />;
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Assigned Tasks</Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Assigned By</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
            ) : tasks.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No tasks assigned to you.</TableCell></TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell fontWeight="bold">{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.assignedBy?.name || 'N/A'}</TableCell>
                  <TableCell>{getPriorityChip(task.priority)}</TableCell>
                  <TableCell>{new Date(task.deadline).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </TextField>
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

export default Tasks;
