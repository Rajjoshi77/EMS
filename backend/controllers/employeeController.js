const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');




exports.getEmployees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    
    let query = {};

    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      
      
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');

      const userIds = matchingUsers.map(u => u._id);

      query.$or = [
        { employeeCode: searchRegex },
        { userId: { $in: userIds } },
        { designation: searchRegex },
      ];
    }

    
    if (req.query.department) {
      query.departmentId = req.query.department;
    }

    const total = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .populate('userId', 'name email status role profileImage')
      .populate('departmentId', 'name')
      .populate('manager', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalEmployees: total,
      },
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};




exports.getEmployee = async (req, res, next) => {
  try {
    let employee;
    
    
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      employee = await Employee.findOne({
        $or: [{ _id: req.params.id }, { userId: req.params.id }]
      })
        .populate('userId', 'name email status role profileImage')
        .populate('departmentId', 'name description')
        .populate('manager', 'name email');
    } else {
      employee = await Employee.findOne({ employeeCode: req.params.id })
        .populate('userId', 'name email status role profileImage')
        .populate('departmentId', 'name description')
        .populate('manager', 'name email');
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};




exports.createEmployee = async (req, res, next) => {
  let createdUser = null;
  try {
    const {
      name,
      email,
      password,
      employeeCode,
      departmentId,
      designation,
      salary,
      joiningDate,
      phone,
      address,
      manager,
      emergencyName,
      emergencyRelation,
      emergencyPhone,
    } = req.body;

    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    
    const codeExists = await Employee.findOne({ employeeCode });
    if (codeExists) {
      return res.status(400).json({ success: false, message: 'Employee code already exists' });
    }

    
    if (!departmentId || departmentId === '') {
      return res.status(400).json({ success: false, message: 'Please select a department' });
    }

    
    createdUser = await User.create({
      name,
      email,
      password: password || 'Welcome123!', 
      role: 'Employee',
      profileImage: req.file ? `/uploads/${req.file.filename}` : '',
    });

    
    const employee = await Employee.create({
      employeeCode,
      userId: createdUser._id,
      departmentId,
      designation,
      salary: parseFloat(salary),
      joiningDate: new Date(joiningDate),
      phone,
      address,
      manager: (manager && manager !== '') ? manager : null,
      emergencyContact: {
        name: emergencyName,
        relation: emergencyRelation,
        phone: emergencyPhone,
      },
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'EMPLOYEE_CREATE',
      details: `Created employee: ${name} (Code: ${employeeCode})`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    
    if (createdUser) {
      await User.findByIdAndDelete(createdUser._id);
    }
    next(error);
  }
};




exports.getEmployers = async (req, res, next) => {
  try {
    const employers = await User.find({ role: 'Employer' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: employers.length,
      data: employers,
    });
  } catch (error) {
    next(error);
  }
};




exports.updateEmployee = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    let employee = await Employee.findById(employeeId);

    if (!employee) {
      
      const user = await User.findById(employeeId);
      if (user && user.role === 'Employer') {
        const userFields = {};
        if (req.body.name) userFields.name = req.body.name;
        if (req.body.email) userFields.email = req.body.email;
        if (req.body.status) userFields.status = req.body.status;
        if (req.file) userFields.profileImage = `/uploads/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(employeeId, userFields, {
          new: true,
          runValidators: true,
        });

        await AuditLog.create({
          userId: req.user.id,
          action: 'EMPLOYER_UPDATE',
          details: `Updated employer ID: ${employeeId}`,
          ipAddress: req.ip,
        });

        return res.status(200).json({
          success: true,
          data: updatedUser,
        });
      }
      return res.status(404).json({ success: false, message: 'Employee or Employer profile not found' });
    }

    
    if (req.user.role === 'Employee' && req.user.id !== employee.userId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update your own profile' });
    }

    const {
      name,
      email,
      departmentId,
      designation,
      salary,
      joiningDate,
      phone,
      address,
      manager,
      emergencyName,
      emergencyRelation,
      emergencyPhone,
      status, 
    } = req.body;

    
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (status && req.user.role !== 'Employee') userFields.status = status;
    if (req.file) userFields.profileImage = `/uploads/${req.file.filename}`;

    await User.findByIdAndUpdate(employee.userId, userFields, {
      new: true,
      runValidators: true,
    });

    
    const empFields = {};
    if (departmentId !== undefined && req.user.role !== 'Employee') {
      if (departmentId === '') {
        return res.status(400).json({ success: false, message: 'Please select a department' });
      }
      empFields.departmentId = departmentId;
    }
    if (designation && req.user.role !== 'Employee') empFields.designation = designation;
    if (salary && req.user.role !== 'Employee') empFields.salary = parseFloat(salary);
    if (joiningDate && req.user.role !== 'Employee') empFields.joiningDate = new Date(joiningDate);
    if (phone) empFields.phone = phone;
    if (address) empFields.address = address;
    if (manager !== undefined && req.user.role !== 'Employee') {
      empFields.manager = (manager && manager !== '') ? manager : null;
    }

    if (emergencyName || emergencyRelation || emergencyPhone) {
      empFields.emergencyContact = {
        name: emergencyName || employee.emergencyContact.name,
        relation: emergencyRelation || employee.emergencyContact.relation,
        phone: emergencyPhone || employee.emergencyContact.phone,
      };
    }

    employee = await Employee.findByIdAndUpdate(employeeId, empFields, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email status role profileImage');

    await AuditLog.create({
      userId: req.user.id,
      action: 'EMPLOYEE_UPDATE',
      details: `Updated employee ID: ${employeeId}`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};




exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      
      const user = await User.findById(req.params.id);
      if (user && user.role === 'Employer') {
        await User.findByIdAndDelete(req.params.id);
        
        await AuditLog.create({
          userId: req.user.id,
          action: 'EMPLOYER_DELETE',
          details: `Deleted employer: ${user.email}`,
          ipAddress: req.ip,
        });

        return res.status(200).json({
          success: true,
          message: 'Employer deleted successfully',
        });
      }
      return res.status(404).json({ success: false, message: 'Employee or Employer profile not found' });
    }

    
    await User.findByIdAndDelete(employee.userId);

    
    await employee.deleteOne();

    await AuditLog.create({
      userId: req.user.id,
      action: 'EMPLOYEE_DELETE',
      details: `Deleted employee: ${employee.employeeCode}`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Employee profile deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
