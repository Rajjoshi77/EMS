const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, 
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    attendanceStatus: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Half Day'],
      default: 'Present',
    },
  },
  {
    timestamps: true,
  }
);


attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
