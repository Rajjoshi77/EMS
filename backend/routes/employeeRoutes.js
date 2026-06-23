const express = require('express');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployers,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/employers', authorize('Super Admin'), getEmployers);

router
  .route('/')
  .get(getEmployees)
  .post(authorize('Super Admin', 'Employer'), upload.single('profileImage'), createEmployee);

router
  .route('/:id')
  .get(getEmployee)
  .put(upload.single('profileImage'), updateEmployee)
  .delete(authorize('Super Admin', 'Employer'), deleteEmployee);

module.exports = router;
