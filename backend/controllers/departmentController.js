const Department = require('../models/Department');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');




exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('manager', 'name email')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};




exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('manager', 'name email')
      .populate('createdBy', 'name email');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};




exports.createDepartment = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    
    const existing = await Department.findOne({ name: req.body.name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department name already exists' });
    }

    const department = await Department.create(req.body);

    await AuditLog.create({
      userId: req.user.id,
      action: 'DEPT_CREATE',
      details: `Created department: ${department.name}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};




exports.updateDepartment = async (req, res, next) => {
  try {
    let department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'DEPT_UPDATE',
      details: `Updated department: ${department.name}`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};




exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    
    const employeesCount = await Employee.countDocuments({ departmentId: req.params.id });
    if (employeesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${employeesCount} employees assigned to it.`,
      });
    }

    await department.deleteOne();

    await AuditLog.create({
      userId: req.user.id,
      action: 'DEPT_DELETE',
      details: `Deleted department: ${department.name}`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
