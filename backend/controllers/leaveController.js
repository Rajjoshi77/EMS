const Leave = require('../models/Leave');
const User = require('../models/User');
const { emitNotification } = require('../socket/socketHandler');




exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const leave = await Leave.create({
      employeeId: req.user.id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'Pending',
    });

    
    
    const adminsAndEmployers = await User.find({ role: { $in: ['Super Admin', 'Employer'] } });
    for (const manager of adminsAndEmployers) {
      await emitNotification(
        manager._id,
        'New Leave Request',
        `${req.user.name} has requested ${leaveType} from ${startDate} to ${endDate}`
      );
    }

    res.status(201).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};




exports.getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};




exports.getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find()
      .populate('employeeId', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};




exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body; 
    
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.approvedBy = req.user.id;
    await leave.save();

    
    await emitNotification(
      leave.employeeId,
      `Leave Request ${status}`,
      `Your request for ${leave.leaveType} has been ${status.toLowerCase()} by management.`
    );

    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};
