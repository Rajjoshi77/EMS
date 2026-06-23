const Task = require('../models/Task');
const { emitNotification } = require('../socket/socketHandler');




exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, deadline } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedBy: req.user.id,
      assignedTo,
      priority,
      deadline: new Date(deadline),
      status: 'Pending',
    });

    
    await emitNotification(
      assignedTo,
      'New Task Assigned',
      `You have been assigned a new task: "${title}". Deadline: ${deadline}`
    );

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};




exports.getTasks = async (req, res, next) => {
  try {
    let filter = {};

    
    if (req.user.role === 'Employee') {
      filter.assignedTo = req.user.id;
    } else if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }

    const tasks = await Task.find(filter)
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};




exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    
    if (req.user.role === 'Employee' && task.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};




exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body; 
    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    
    const isAssignee = task.assignedTo.toString() === req.user.id;
    const isCreator = task.assignedBy.toString() === req.user.id;
    const isAdmin = ['Super Admin', 'Employer'].includes(req.user.role);

    if (!isAssignee && !isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this task' });
    }

    task.status = status;
    await task.save();

    
    if (status === 'Completed' && isAssignee) {
      await emitNotification(
        task.assignedBy,
        'Task Completed',
        `${req.user.name} has completed the task: "${task.title}"`
      );
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};




exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
