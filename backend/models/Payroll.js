const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: String, 
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);


payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
