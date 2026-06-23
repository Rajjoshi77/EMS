const express = require('express');
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getDepartments)
  .post(authorize('Super Admin', 'Employer'), createDepartment);

router
  .route('/:id')
  .get(getDepartment)
  .put(authorize('Super Admin', 'Employer'), updateDepartment)
  .delete(authorize('Super Admin', 'Employer'), deleteDepartment);

module.exports = router;
