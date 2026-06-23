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
  CircularProgress,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import api from '../../services/api';

const Payslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const res = await api.get('/payroll/my-payslips');
        setPayslips(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  const handleDownloadPDF = (id) => {
    window.open(`http://localhost:5050/api/payroll/${id}/pdf?token=${localStorage.getItem('token')}`, '_blank');
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>My Payslips</Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Basic Salary</TableCell>
              <TableCell>Bonus</TableCell>
              <TableCell>Deductions</TableCell>
              <TableCell>Tax</TableCell>
              <TableCell>Net Paid</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell align="right">Download</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center"><CircularProgress /></TableCell></TableRow>
            ) : payslips.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center">No payslips issued yet.</TableCell></TableRow>
            ) : (
              payslips.map((p) => (
                <TableRow key={p._id}>
                  <TableCell fontWeight="bold">{p.month}</TableCell>
                  <TableCell>${p.basicSalary}</TableCell>
                  <TableCell>${p.bonus}</TableCell>
                  <TableCell>${p.deductions}</TableCell>
                  <TableCell>${p.tax}</TableCell>
                  <TableCell fontWeight="bold" color="primary.main">${p.netSalary}</TableCell>
                  <TableCell>{p.paymentStatus}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => handleDownloadPDF(p._id)}
                    >
                      PDF
                    </Button>
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

export default Payslips;
