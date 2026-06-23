import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import { updateProfile } from '../../redux/slices/authSlice';
import api, { BASE_URL } from '../../services/api';

const Profile = () => {
  const { user, employeeProfile } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ text: '', severity: 'info' });
  const [passMsg, setPassMsg] = useState({ text: '', severity: 'info' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (file) {
        formData.append('profileImage', file);
      }
      
      const res = await dispatch(updateProfile(formData)).unwrap();
      setMsg({ text: 'Profile updated successfully!', severity: 'success' });
    } catch (err) {
      setMsg({ text: err || 'Update failed', severity: 'error' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        setPassMsg({ text: 'Please fill out both fields', severity: 'error' });
        return;
      }
      await api.put('/auth/updatepassword', passwordData);
      setPassMsg({ text: 'Password changed successfully!', severity: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPassMsg({ text: err.response?.data?.message || 'Password update failed', severity: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>User Profile</Typography>

      <Grid container spacing={4}>
        {}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Personal Information</Typography>
              {msg.text && <Alert severity={msg.severity} sx={{ mb: 2 }}>{msg.text}</Alert>}

              <Box component="form" onSubmit={handleProfileSubmit}>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Grid item>
                    <Avatar
                      sx={{ width: 80, height: 80 }}
                      src={user?.profileImage ? `${BASE_URL}${user.profileImage}` : ''}
                    />
                  </Grid>
                  <Grid item>
                    <input
                      type="file"
                      accept="image/*"
                      id="profile-upload"
                      style={{ display: 'none' }}
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <label htmlFor="profile-upload">
                      <Button variant="outlined" component="span">Upload Picture</Button>
                    </label>
                    {file && <Typography variant="caption" display="block">{file.name}</Typography>}
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Button type="submit" variant="contained" sx={{ mt: 3 }}>Update Profile</Button>
              </Box>

              {user?.role === 'Employee' && employeeProfile && (
                <>
                  <Divider sx={{ my: 4 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Employment Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Employee Code</Typography>
                      <Typography fontWeight="medium">{employeeProfile.employeeCode}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Designation</Typography>
                      <Typography fontWeight="medium">{employeeProfile.designation}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Department</Typography>
                      <Typography fontWeight="medium">{employeeProfile.departmentId?.name || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Basic Salary</Typography>
                      <Typography fontWeight="medium">${employeeProfile.salary}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Emergency Contact</Typography>
                      <Typography fontWeight="medium">
                        {employeeProfile.emergencyContact?.name} ({employeeProfile.emergencyContact?.relation}) - {employeeProfile.emergencyContact?.phone}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Change Password</Typography>
              {passMsg.text && <Alert severity={passMsg.severity} sx={{ mb: 2 }}>{passMsg.text}</Alert>}

              <Box component="form" onSubmit={handlePasswordSubmit}>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
                <Button type="submit" variant="contained" color="secondary" sx={{ mt: 2 }} fullWidth>
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
