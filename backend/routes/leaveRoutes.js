const express = require('express');
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('Super Admin', 'Employer'), getAllLeaves)
  .post(applyLeave);

router.get('/my-leaves', getMyLeaves);
router.put('/:id', authorize('Super Admin', 'Employer'), updateLeaveStatus);

module.exports = router;
