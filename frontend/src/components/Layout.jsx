import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Business,
  WatchLater,
  EventBusy,
  MonetizationOn,
  Assignment,
  Notifications,
  AccountCircle,
  Brightness4,
  Brightness7,
  ExitToApp,
} from '@mui/icons-material';
import { io } from 'socket.io-client';
import { logout } from '../redux/slices/authSlice';
import api from '../services/api';

const drawerWidth = 240;

const Layout = ({ darkMode, setDarkMode }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();

    
    const socket = io('http://localhost:5050');
    socket.emit('register', user.id || user._id);

    socket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setToast({
        open: true,
        message: `${notification.title}: ${notification.message}`,
        severity: 'info',
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      handleNotificationClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getMenuItems = () => {
    const role = user?.role;
    if (role === 'Super Admin') {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
        { text: 'Profile', icon: <AccountCircle />, path: '/profile' },
      ];
    } else if (role === 'Employer') {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/employer/dashboard' },
        { text: 'Employees', icon: <People />, path: '/employer/employees' },
        { text: 'Departments', icon: <Business />, path: '/employer/departments' },
        { text: 'Leaves', icon: <EventBusy />, path: '/employer/leaves' },
        { text: 'Payroll', icon: <MonetizationOn />, path: '/employer/payroll' },
        { text: 'Tasks', icon: <Assignment />, path: '/employer/tasks' },
        { text: 'Profile', icon: <AccountCircle />, path: '/profile' },
      ];
    } else {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/employee/dashboard' },
        { text: 'Attendance', icon: <WatchLater />, path: '/employee/attendance' },
        { text: 'Leaves', icon: <EventBusy />, path: '/employee/leaves' },
        { text: 'Payslips', icon: <MonetizationOn />, path: '/employee/payslips' },
        { text: 'Tasks', icon: <Assignment />, path: '/employee/tasks' },
        { text: 'Profile', icon: <AccountCircle />, path: '/profile' },
      ];
    }
  };

  const menuItems = getMenuItems();

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          EMS Enterprise
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                selected={isSelected}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: isSelected ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
            {menuItems.find((item) => item.path === location.pathname)?.text || 'Portal'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 1 }}>
              <Avatar
                alt={user?.name}
                src={user?.profileImage ? `http://localhost:5050${user.profileImage}` : ''}
              />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 },
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
          {unreadCount > 0 && (
            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }} onClick={handleMarkAllRead}>
              Mark all read
            </Typography>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n._id}
              onClick={handleNotificationClose}
              sx={{
                whiteSpace: 'normal',
                bgcolor: n.isRead ? 'transparent' : 'action.hover',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Typography variant="body2" fontWeight={n.isRead ? 'normal' : 'bold'}>
                {n.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {n.message}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>

      {}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
          <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><ExitToApp fontSize="small" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout;
