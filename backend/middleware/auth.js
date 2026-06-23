const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this id',
      });
    }

    if (req.user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated',
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};


exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route`,
      });
    }
    next();
  };
};
