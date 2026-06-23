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
  CircularProgress,
} from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import api, { BASE_URL } from '../../services/api';

const PayrollGeneration = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); 
  
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().toISOString().slice(0, 7),
    bonus: 0,
    deductions: 0,
    tax: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const payRes = await api.get(`/payroll?month=${selectedMonth}`);
      setPayrolls(payRes.data.data);

      const empRes = await api.get('/employees?limit=100');
      setEmployees(empRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const handleOpenAdd = () => {
    setFormData({
      employeeId: '',
      month: selectedMonth,
      bonus: 0,
      deductions: 0,
      tax: 0,
    });
    setOpenDialog(true);
  };

  const handleGenerate = async () => {
    try {
      await api.post('/payroll', formData);
      setOpenDialog(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate payroll');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/payroll/${id}`, { paymentStatus: status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  const handleExportExcel = () => {
    window.open(`${BASE_URL}/api/payroll/export/excel?month=${selectedMonth}&token=${localStorage.getItem('token')}`, '_blank');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Payroll Processing</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
            Process Payroll
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee Name</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Basic Salary</TableCell>
              <TableCell>Bonus</TableCell>
              <TableCell>Deductions</TableCell>
              <TableCell>Tax</TableCell>
              <TableCell>Net Paid</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center"><CircularProgress /></TableCell></TableRow>
            ) : payrolls.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center">No payroll generated for this month.</TableCell></TableRow>
            ) : (
              payrolls.map((p) => (
                <TableRow key={p._id}>
                  <TableCell fontWeight="bold">{p.employeeId?.name || 'N/A'}</TableCell>
                  <TableCell>{p.month}</TableCell>
                  <TableCell>${p.basicSalary}</TableCell>
                  <TableCell>${p.bonus}</TableCell>
                  <TableCell>${p.deductions}</TableCell>
                  <TableCell>${p.tax}</TableCell>
                  <TableCell fontWeight="bold" color="primary.main">${p.netSalary}</TableCell>
                  <TableCell>{p.paymentStatus}</TableCell>
                  <TableCell align="right">
                    {p.paymentStatus === 'Pending' ? (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() => handleStatusUpdate(p._id, 'Paid')}
                      >
                        Mark Paid
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                      >
                        Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Generate Payroll Record</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Employee"
            fullWidth
            required
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          >
            {employees.map((emp) => (
              <MenuItem key={emp._id} value={emp.userId?._id || emp.userId}>{emp.userId?.name || emp.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Month"
            type="month"
            fullWidth
            required
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Bonus ($)"
            type="number"
            fullWidth
            value={formData.bonus}
            onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) || 0 })}
          />
          <TextField
            margin="dense"
            label="Deductions ($)"
            type="number"
            fullWidth
            value={formData.deductions}
            onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
          />
          <TextField
            margin="dense"
            label="Tax ($)"
            type="number"
            fullWidth
            value={formData.tax}
            onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerate} variant="contained">Generate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollGeneration;
