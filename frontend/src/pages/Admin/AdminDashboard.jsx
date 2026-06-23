import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Box,
  Alert,
} from '@mui/material';
import { Edit, Delete, PersonAdd } from '@mui/icons-material';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', status: 'Active' });
  const [formError, setFormError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get('/reports/dashboard');
      setStats(statsRes.data);

      
      const userRes = await api.get('/employees/employers');
      setEmployers(userRes.data.data || []);
      
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  
  const fetchEmployers = async () => {
    try {
      
      
      
      
      
      const res = await api.get('/employees');
      
    } catch (error) {}
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenAdd = () => {
    setEditingEmployer(null);
    setFormData({ name: '', email: '', password: '', status: 'Active' });
    setFormError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (employer) => {
    setEditingEmployer(employer);
    setFormData({
      name: employer.userId?.name || employer.name || '',
      email: employer.userId?.email || employer.email || '',
      password: '',
      status: employer.userId?.status || employer.status || 'Active',
    });
    setFormError('');
    setOpenDialog(true);
  };

  const handleSaveEmployer = async () => {
    try {
      if (editingEmployer) {
        
        await api.put(`/employees/${editingEmployer._id || editingEmployer.id}`, {
          name: formData.name,
          email: formData.email,
          status: formData.status,
        });
      } else {
        
        await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'Employer',
        });
      }
      setOpenDialog(false);
      fetchDashboardData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteEmployer = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchDashboardData();
      } catch (err) {
        alert(err.response?.data?.message || 'Deletion failed');
      }
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Super Admin Dashboard
      </Typography>

      {}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">Total Employers</Typography>
              <Typography variant="h3" fontWeight="bold">{widgets.totalEmployers || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">Total Employees</Typography>
              <Typography variant="h3" fontWeight="bold">{widgets.totalEmployees || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">Total Departments</Typography>
              <Typography variant="h3" fontWeight="bold">{widgets.totalDepartments || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">Attendance Rate Today</Typography>
              <Typography variant="h3" fontWeight="bold">{widgets.attendanceRate || 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">Manage Employers & HR Managers</Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={handleOpenAdd}>
          Add Employer
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No employers created yet. Click Add Employer to get started.</TableCell>
              </TableRow>
            ) : (
              employers.map((emp) => (
                <TableRow key={emp._id}>
                  <TableCell>{emp.userId?.name || emp.name}</TableCell>
                  <TableCell>{emp.userId?.email || emp.email}</TableCell>
                  <TableCell>{emp.userId?.status || emp.status}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenEdit(emp)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteEmployer(emp._id)}>
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
        <DialogTitle>{editingEmployer ? 'Edit Employer Status' : 'Add New Employer'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!!editingEmployer}
          />
          <TextField
            margin="dense"
            label="Email Address"
            fullWidth
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!!editingEmployer}
          />
          {!editingEmployer && (
            <TextField
              margin="dense"
              label="Password"
              fullWidth
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          )}
          {editingEmployer && (
            <TextField
              select
              margin="dense"
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEmployer} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
