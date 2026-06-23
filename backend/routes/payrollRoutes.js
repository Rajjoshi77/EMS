const express = require('express');
const {
  generatePayroll,
  updatePaymentStatus,
  getAllPayrolls,
  getMyPayslips,
  downloadPayslipPDF,
  exportPayrollExcel,
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/my-payslips', getMyPayslips);
router.get('/:id/pdf', downloadPayslipPDF);

router.use(authorize('Super Admin', 'Employer'));
router
  .route('/')
  .get(getAllPayrolls)
  .post(generatePayroll);

router.put('/:id', updatePaymentStatus);
router.get('/export/excel', exportPayrollExcel);

module.exports = router;
