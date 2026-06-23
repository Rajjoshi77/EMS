const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);


router.use(protect);
router.post('/register', authorize('Super Admin', 'Employer'), upload.single('profileImage'), register);
router.get('/me', getMe);
router.put('/updatedetails', upload.single('profileImage'), updateDetails);
router.put('/updatepassword', updatePassword);

module.exports = router;
