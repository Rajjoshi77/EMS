const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const User = require('../models/User');


const SHIFT_START_HOUR = 9;
const SHIFT_START_MINUTE = 15;




exports.checkIn = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    
    const existing = await Attendance.findOne({
      employeeId: req.user.id,
      date: todayStr,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in for today',
      });
    }

    const checkInTime = new Date();
    
    
    let status = 'Present';
    const limitTime = new Date();
    limitTime.setHours(SHIFT_START_HOUR, SHIFT_START_MINUTE, 0, 0);
    
    if (checkInTime > limitTime) {
      status = 'Late';
    }

    const attendance = await Attendance.create({
      employeeId: req.user.id,
      date: todayStr,
      checkIn: checkInTime,
      attendanceStatus: status,
    });

    res.status(201).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};




exports.checkOut = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      employeeId: req.user.id,
      date: todayStr,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today. Please check-in first.',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out for today',
      });
    }

    const checkOutTime = new Date();
    const diffMs = checkOutTime - new Date(attendance.checkIn);
    const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    attendance.checkOut = checkOutTime;
    attendance.totalHours = totalHours;

    
    if (totalHours < 4 && totalHours > 0) {
      attendance.attendanceStatus = 'Half Day';
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};




exports.getMyHistory = async (req, res, next) => {
  try {
    const month = req.query.month; 
    let filter = { employeeId: req.user.id };

    if (month) {
      filter.date = new RegExp(`^${month}`);
    }

    const history = await Attendance.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};




exports.getDailyAttendance = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const attendanceList = await Attendance.find({ date })
      .populate('employeeId', 'name email profileImage');

    res.status(200).json({
      success: true,
      count: attendanceList.length,
      data: attendanceList,
    });
  } catch (error) {
    next(error);
  }
};




exports.markAbsents = async (req, res, next) => {
  try {
    const targetDate = req.body.date || new Date().toISOString().split('T')[0];

    
    const activeEmployees = await User.find({ role: 'Employee', status: 'Active' });

    let count = 0;
    for (const employee of activeEmployees) {
      const attendance = await Attendance.findOne({
        employeeId: employee._id,
        date: targetDate,
      });

      if (!attendance) {
        
        
        const dummyTime = new Date(targetDate);
        dummyTime.setHours(9, 0, 0, 0);

        await Attendance.create({
          employeeId: employee._id,
          date: targetDate,
          checkIn: dummyTime,
          checkOut: dummyTime,
          totalHours: 0,
          attendanceStatus: 'Absent',
        });
        count++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Auto-marked absent completed. ${count} employees marked absent for ${targetDate}.`,
    });
  } catch (error) {
    next(error);
  }
};
