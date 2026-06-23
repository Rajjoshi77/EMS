const express = require('express');
const {
  createTask,
  getTasks,
  getTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(authorize('Super Admin', 'Employer'), createTask);

router
  .route('/:id')
  .get(getTask)
  .put(updateTaskStatus)
  .delete(authorize('Super Admin', 'Employer'), deleteTask);

module.exports = router;
