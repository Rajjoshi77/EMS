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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import api from '../../services/api';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: '',
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setDepartments(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get('/employees?limit=100');
      
      setManagers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '', manager: '' });
    setFormError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description,
      manager: dept.manager?._id || dept.manager || '',
    });
    setFormError('');
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        manager: formData.manager || null,
      };

      if (editingDept) {
        await api.put(`/departments/${editingDept._id}`, payload);
      } else {
        await api.post('/departments', payload);
      }
      setOpenDialog(false);
      fetchDepartments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save department');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/departments/${id}`);
        fetchDepartments();
      } catch (err) {
        alert(err.response?.data?.message || 'Deletion failed');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Departments</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
          Add Department
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Loading...</TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No departments created yet.</TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept._id}>
                  <TableCell fontWeight="bold">{dept.name}</TableCell>
                  <TableCell>{dept.description}</TableCell>
                  <TableCell>{dept.manager?.name || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenEdit(dept)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(dept._id)}>
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
        <DialogTitle>{editingDept ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField
            margin="dense"
            label="Department Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            required
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            select
            margin="dense"
            label="Assign Manager"
            fullWidth
            value={formData.manager}
            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
          >
            <MenuItem value="">Unassigned</MenuItem>
            {managers.map((m) => (
              <MenuItem key={m._id} value={m.userId?._id || m.userId}>{m.userId?.name || m.name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentManagement;
