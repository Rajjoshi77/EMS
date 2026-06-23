const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Payroll = require('../models/Payroll');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const AuditLog = require('../models/AuditLog');




exports.getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'Super Admin') {
      
      const totalEmployers = await User.countDocuments({ role: 'Employer' });
      const totalEmployees = await User.countDocuments({ role: 'Employee' });
      const totalDepartments = await Department.countDocuments({});
      
      const payrollSum = await Payroll.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$netSalary' } } },
      ]);
      const monthlyPayrollCost = payrollSum[0] ? payrollSum[0].total : 0;
      
      const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

      
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAttendanceCount = await Attendance.countDocuments({ date: todayStr, attendanceStatus: { $ne: 'Absent' } });
      const totalEmpActive = await User.countDocuments({ role: 'Employee', status: 'Active' });
      const attendanceRate = totalEmpActive > 0 ? ((todayAttendanceCount / totalEmpActive) * 100).toFixed(1) : 0;

      
      
      const userGrowth = await User.aggregate([
        { $match: { role: 'Employee' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      
      const deptDistribution = await Employee.aggregate([
        {
          $group: {
            _id: '$departmentId',
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'department',
          },
        },
        { $unwind: '$department' },
        {
          $project: {
            name: '$department.name',
            count: 1,
          },
        },
      ]);

      
      const recentActivity = await AuditLog.find()
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .limit(10);

      return res.status(200).json({
        success: true,
        role,
        widgets: {
          totalEmployers,
          totalEmployees,
          totalDepartments,
          monthlyPayrollCost,
          pendingLeaves,
          attendanceRate,
        },
        charts: {
          userGrowth,
          deptDistribution,
        },
        recentActivity,
      });
    }

    if (role === 'Employer') {
      const totalEmployees = await User.countDocuments({ role: 'Employee' });
      const totalDepartments = await Department.countDocuments({});
      const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

      const todayStr = new Date().toISOString().split('T')[0];
      const presentToday = await Attendance.countDocuments({ date: todayStr, attendanceStatus: { $ne: 'Absent' } });
      const totalEmpActive = await User.countDocuments({ role: 'Employee', status: 'Active' });
      const attendanceRate = totalEmpActive > 0 ? ((presentToday / totalEmpActive) * 100).toFixed(1) : 0;

      
      const deptDistribution = await Employee.aggregate([
        {
          $group: {
            _id: '$departmentId',
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'department',
          },
        },
        { $unwind: '$department' },
        {
          $project: {
            name: '$department.name',
            count: 1,
          },
        },
      ]);

      
      const recentLeaves = await Leave.find()
        .populate('employeeId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        role,
        widgets: {
          totalEmployees,
          totalDepartments,
          pendingLeaves,
          presentToday,
          attendanceRate,
        },
        charts: {
          deptDistribution,
        },
        recentLeaves,
      });
    }

    if (role === 'Employee') {
      
      const attendanceCount = await Attendance.countDocuments({ employeeId: req.user.id, attendanceStatus: { $ne: 'Absent' } });
      const totalDays = await Attendance.countDocuments({ employeeId: req.user.id });
      const attendanceSummary = totalDays > 0 ? `${attendanceCount}/${totalDays}` : '0/0';

      const leaveBalance = 24 - (await Leave.countDocuments({ employeeId: req.user.id, status: 'Approved' }) * 2); 
      
      const lastPayslip = await Payroll.findOne({ employeeId: req.user.id }).sort({ month: -1 });
      const salaryInformation = lastPayslip ? `$${lastPayslip.netSalary}` : 'N/A';

      
      const attendanceHistory = await Attendance.find({ employeeId: req.user.id })
        .sort({ date: -1 })
        .limit(10);

      return res.status(200).json({
        success: true,
        role,
        widgets: {
          attendanceSummary,
          leaveBalance,
          salaryInformation,
        },
        attendanceHistory,
      });
    }
  } catch (error) {
    next(error);
  }
};
