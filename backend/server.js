const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const { initSocket } = require('./socket/socketHandler');
const User = require('./models/User');


connectDB();

const app = express();
const server = http.createServer(app);


initSocket(server);


app.use(helmet({
  crossOriginResourcePolicy: false 
}));


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, 
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api/', limiter);


app.use(express.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));


app.get('/', (req, res) => {
  res.send('Employee Management System API is running...');
});


app.use(errorHandler);


const PORT = process.env.PORT || 5000;


const seedAdmin = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'Super Admin' });
    if (adminCount === 0) {
      await User.create({
        name: 'System Admin',
        email: 'admin@company.com',
        password: 'admin123', 
        role: 'Super Admin',
        status: 'Active',
      });
      console.log('Seeded default Super Admin user: admin@company.com / admin123');
    }
  } catch (error) {
    console.error('Error seeding Super Admin:', error.message);
  }
};


server.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  await seedAdmin();
});
