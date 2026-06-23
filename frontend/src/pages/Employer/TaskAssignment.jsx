import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
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
  IconButton,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import api from '../../services/api';

const TaskAssignment = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    deadline: '',
  });

  const fetchTasksAndEmployees = async () => {
    try {
      setLoading(true);
      const taskRes = await api.get('/tasks');
      setTasks(taskRes.data.data);

      const empRes = await api.get('/employees?limit=100');
      setEmployees(empRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndEmployees();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'Medium',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      await api.post('/tasks', formData);
      setOpenDialog(false);
      fetchTasksAndEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign task');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasksAndEmployees();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const getPriorityChip = (p) => {
    if (p === 'High') return <Chip label="High" color="error" size="small" />;
    if (p === 'Medium') return <Chip label="Medium" color="warning" size="small" />;
    return <Chip label="Low" color="success" size="small" />;
  };

  const getStatusChip = (s) => {
    if (s === 'Completed') return <Chip label="Completed" color="success" size="small" />;
    if (s === 'In Progress') return <Chip label="In Progress" color="info" size="small" />;
    return <Chip label="Pending" color="secondary" size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Task Assignments</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
          Assign Task
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
            ) : tasks.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No tasks assigned yet.</TableCell></TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell fontWeight="bold">{task.title}</TableCell>
                  <TableCell>{task.assignedTo?.name || 'N/A'}</TableCell>
                  <TableCell>{getPriorityChip(task.priority)}</TableCell>
                  <TableCell>{new Date(task.deadline).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusChip(task.status)}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleDelete(task._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign New Task</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Task Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            required
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            select
            margin="dense"
            label="Assign To"
            fullWidth
            required
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
          >
            {employees.map((emp) => (
              <MenuItem key={emp._id} value={emp.userId?._id || emp.userId}>{emp.userId?.name || emp.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Priority"
            fullWidth
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Deadline"
            type="date"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskAssignment;
