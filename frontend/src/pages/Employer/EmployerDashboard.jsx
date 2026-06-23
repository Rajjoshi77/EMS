import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
} from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const EmployerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const widgets = stats.widgets || {};
  const charts = stats.charts || {};
  const recentLeaves = stats.recentLeaves || [];

  
  const pieData = {
    labels: charts.deptDistribution?.map((d) => d.name) || [],
    datasets: [
      {
        label: '# of Employees',
        data: charts.deptDistribution?.map((d) => d.count) || [],
        backgroundColor: [
          '#3f51b5',
          '#f50057',
          '#4caf50',
          '#ff9800',
          '#9c27b0',
          '#00bcd4',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Employer Dashboard
      </Typography>

      {}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">Total Employees</Typography>
              <Typography variant="h3" fontWeight="bold">{widgets.totalEmployees || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">Present Today</Typography>
              <Typography variant="h3" fontWeight="bold">{widgets.presentToday || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">Pending Leaves</Typography>
              <Typography variant="h3" fontWeight="bold">{widgets.pendingLeaves || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle2">Attendance Rate</Typography>
              <Typography variant="h3" fontWeight="bold">{widgets.attendanceRate || 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {}
      <Grid container spacing={4}>
        {}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Department Distribution
              </Typography>
              {charts.deptDistribution?.length > 0 ? (
                <Box sx={{ maxWidth: 300, mx: 'auto', my: 2 }}>
                  <Pie data={pieData} />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 6 }}>
                  No department distribution data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Leave Requests
              </Typography>
              <List>
                {recentLeaves.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No recent leave requests
                  </Typography>
                ) : (
                  recentLeaves.map((leave) => (
                    <ListItem key={leave._id} dividerSecondary>
                      <ListItemText
                        primary={`${leave.employeeId?.name} - ${leave.leaveType}`}
                        secondary={`Dates: ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} | Reason: ${leave.reason}`}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/employer/leaves')}
                      >
                        Review
                      </Button>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployerDashboard;
