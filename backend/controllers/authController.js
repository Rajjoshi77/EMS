const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../services/mailService');


const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'secretkey123',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      status: user.status,
    },
  });
};




exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    
    if (req.user) {
      if (req.user.role === 'Employer' && role === 'Super Admin') {
        return res.status(403).json({ success: false, message: 'Employers cannot create Super Admins' });
      }
      if (req.user.role === 'Employee') {
        return res.status(403).json({ success: false, message: 'Employees cannot register users' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      profileImage: req.file ? `/uploads/${req.file.filename}` : '',
    });

    await AuditLog.create({
      userId: req.user ? req.user._id : null,
      action: 'USER_REGISTERED',
      details: `Registered user: ${user.email} with role: ${user.role}`,
      ipAddress: req.ip,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};




exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated' });
    }

    await AuditLog.create({
      userId: user._id,
      action: 'USER_LOGIN',
      details: `Logged in user: ${user.email}`,
      ipAddress: req.ip,
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};




exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let employeeProfile = null;

    if (user.role === 'Employee') {
      employeeProfile = await Employee.findOne({ userId: user._id })
        .populate('departmentId', 'name description')
        .populate('manager', 'name email');
    }

    res.status(200).json({
      success: true,
      user,
      employeeProfile,
    });
  } catch (error) {
    next(error);
  }
};




exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    if (req.file) {
      fieldsToUpdate.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};




exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};




exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    
    const resetToken = crypto.randomBytes(20).toString('hex');

    
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 

    await user.save({ validateBeforeSave: false });

    
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};




exports.resetPassword = async (req, res, next) => {
  try {
    
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
