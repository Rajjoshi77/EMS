const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: [true, 'Please add an employee code'],
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    designation: {
      type: String,
      required: [true, 'Please add a designation'],
    },
    salary: {
      type: Number,
      required: [true, 'Please add basic salary'],
    },
    joiningDate: {
      type: Date,
      required: [true, 'Please add a joining date'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    emergencyContact: {
      name: { type: String, required: true },
      relation: { type: String, required: true },
      phone: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
