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
  Pagination,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Add, Search } from '@mui/icons-material';
import api from '../../services/api';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formError, setFormError] = useState('');
  
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeCode: '',
    departmentId: '',
    designation: '',
    salary: '',
    joiningDate: '',
    phone: '',
    address: '',
    manager: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    status: 'Active',
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/employees?page=${page}&limit=10&search=${searchTerm}&department=${filterDept}`
      );
      setEmployees(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const deptRes = await api.get('/departments');
      setDepartments(deptRes.data.data);

      const managerRes = await api.get('/employees?limit=100');
      
      setManagers(managerRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, filterDept]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      employeeCode: '',
      departmentId: '',
      designation: '',
      salary: '',
      joiningDate: new Date().toISOString().split('T')[0],
      phone: '',
      address: '',
      manager: '',
      emergencyName: '',
      emergencyRelation: '',
      emergencyPhone: '',
      status: 'Active',
    });
    setFormError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.userId?.name || '',
      email: emp.userId?.email || '',
      password: '', 
      employeeCode: emp.employeeCode || '',
      departmentId: emp.departmentId?._id || emp.departmentId || '',
      designation: emp.designation || '',
      salary: emp.salary || '',
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      phone: emp.phone || '',
      address: emp.address || '',
      manager: emp.manager?._id || emp.manager || '',
      emergencyName: emp.emergencyContact?.name || '',
      emergencyRelation: emp.emergencyContact?.relation || '',
      emergencyPhone: emp.emergencyContact?.phone || '',
      status: emp.userId?.status || 'Active',
    });
    setFormError('');
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee._id}`, formData);
      } else {
        await api.post('/employees', formData);
      }
      setOpenDialog(false);
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save employee profile');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee? This will permanently delete their account.')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Employee Directory</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
          Add Employee
        </Button>
      </Box>

      {}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 5 }}>
            <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search by name, email, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" variant="contained" startIcon={<Search />}>
                Search
              </Button>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              size="small"
              fullWidth
              label="Department Filter"
              value={filterDept}
              onChange={(e) => {
                setFilterDept(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}><CircularProgress /></TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No employees found.</TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp._id}>
                  <TableCell>{emp.employeeCode}</TableCell>
                  <TableCell>{emp.userId?.name || 'N/A'}</TableCell>
                  <TableCell>{emp.userId?.email || 'N/A'}</TableCell>
                  <TableCell>{emp.departmentId?.name || 'N/A'}</TableCell>
                  <TableCell>{emp.designation}</TableCell>
                  <TableCell>{emp.userId?.status || 'Active'}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenEdit(emp)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(emp._id)}>
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
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
        </Box>
      )}

      {}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 1, display: 'flex', flexWrap: 'wrap' }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                label="Full Name"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            {!editingEmployee && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  placeholder="Welcome123!"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                label="Employee Code"
                fullWidth
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                disabled={!!editingEmployee}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                required
                label="Department"
                fullWidth
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                {departments.map((d) => (
                  <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                label="Designation"
                fullWidth
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                label="Basic Salary ($)"
                type="number"
                fullWidth
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                label="Joining Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                label="Phone Number"
                fullWidth
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Manager"
                select
                fullWidth
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              >
                <MenuItem value="">No Manager</MenuItem>
                {managers.map((m) => (
                  <MenuItem key={m._id} value={m.userId?._id || m.userId}>{m.userId?.name || m.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                label="Address"
                fullWidth
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Emergency Contact Details</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                required
                label="Contact Name"
                fullWidth
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                required
                label="Relation"
                fullWidth
                value={formData.emergencyRelation}
                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                required
                label="Phone"
                fullWidth
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              />
            </Grid>
            {editingEmployee && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Account Status"
                  fullWidth
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeManagement;
