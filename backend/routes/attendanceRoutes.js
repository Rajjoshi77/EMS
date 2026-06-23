const express = require('express');
const {
  checkIn,
  checkOut,
  getMyHistory,
  getDailyAttendance,
  markAbsents,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/checkin', checkIn);
router.put('/checkout', checkOut);
router.get('/my-history', getMyHistory);

router.get('/daily', authorize('Super Admin', 'Employer'), getDailyAttendance);
router.post('/mark-absent', authorize('Super Admin', 'Employer'), markAbsents);

module.exports = router;
