const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { emitNotification } = require('../socket/socketHandler');




exports.generatePayroll = async (req, res, next) => {
  try {
    const { employeeId, month, bonus, deductions, tax } = req.body;

    
    const existing = await Payroll.findOne({ employeeId, month });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Payroll already generated for this employee for ${month}`,
      });
    }

    
    const employee = await Employee.findOne({ userId: employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const basicSalary = employee.salary;
    const bonusVal = parseFloat(bonus) || 0;
    const deductionsVal = parseFloat(deductions) || 0;
    const taxVal = parseFloat(tax) || 0;

    const netSalary = basicSalary + bonusVal - deductionsVal - taxVal;

    const payroll = await Payroll.create({
      employeeId,
      month,
      basicSalary,
      bonus: bonusVal,
      deductions: deductionsVal,
      tax: taxVal,
      netSalary,
      paymentStatus: 'Pending',
    });

    
    await emitNotification(
      employeeId,
      'Payroll Generated',
      `Your payslip for ${month} has been generated. Net Salary: $${netSalary}`
    );

    res.status(201).json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};




exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body; 
    
    let payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    payroll.paymentStatus = paymentStatus;
    await payroll.save();

    res.status(200).json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};




exports.getAllPayrolls = async (req, res, next) => {
  try {
    const { month } = req.query;
    let filter = {};
    if (month) {
      filter.month = month;
    }

    const payrolls = await Payroll.find(filter)
      .populate({
        path: 'employeeId',
        select: 'name email',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ month: -1 });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    next(error);
  }
};




exports.getMyPayslips = async (req, res, next) => {
  try {
    const payslips = await Payroll.find({ employeeId: req.user.id }).sort({ month: -1 });

    res.status(200).json({
      success: true,
      count: payslips.length,
      data: payslips,
    });
  } catch (error) {
    next(error);
  }
};




exports.downloadPayslipPDF = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employeeId', 'name email');

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }

    
    if (req.user.role === 'Employee' && payroll.employeeId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const employee = await Employee.findOne({ userId: payroll.employeeId._id })
      .populate('departmentId', 'name');

    
    const doc = new PDFDocument({ margin: 50 });
    
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip_${payroll.month}_${payroll.employeeId.name.replace(/\s+/g, '_')}.pdf`);
    
    doc.pipe(res);

    
    doc.fontSize(24).text('PAYSLIP', { align: 'center' }).moveDown();

    
    doc.fontSize(12)
       .text(`Company Name: Enterprise Corp`, { align: 'left' })
       .text(`Date of Issue: ${new Date().toLocaleDateString()}`)
       .text(`Month: ${payroll.month}`)
       .moveDown();

    doc.text(`Employee Name: ${payroll.employeeId.name}`)
       .text(`Employee Code: ${employee ? employee.employeeCode : 'N/A'}`)
       .text(`Designation: ${employee ? employee.designation : 'N/A'}`)
       .text(`Department: ${employee && employee.departmentId ? employee.departmentId.name : 'N/A'}`)
       .moveDown();

    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

    
    doc.fontSize(14).text('Salary Structure Details', { underline: true }).moveDown();
    
    const tableTop = doc.y;
    doc.fontSize(11);
    
    doc.text('Description', 50, tableTop, { bold: true });
    doc.text('Amount ($)', 400, tableTop, { align: 'right', bold: true });

    
    const rows = [
      { label: 'Basic Salary', val: payroll.basicSalary },
      { label: 'Bonus / Allowances', val: payroll.bonus },
      { label: 'Deductions', val: -payroll.deductions },
      { label: 'Tax', val: -payroll.tax },
      { label: 'Net Salary Paid', val: payroll.netSalary, isBold: true },
    ];

    let currentY = tableTop + 20;
    rows.forEach((row) => {
      doc.text(row.label, 50, currentY);
      doc.text(row.val.toFixed(2), 400, currentY, { align: 'right' });
      currentY += 20;
    });

    doc.moveDown();
    doc.fontSize(12).text(`Payment Status: ${payroll.paymentStatus}`, { bold: true });

    
    doc.moveDown(4);
    doc.fontSize(10).text('Authorized Signature: ________________________', { align: 'right' });

    doc.end();
  } catch (error) {
    next(error);
  }
};




exports.exportPayrollExcel = async (req, res, next) => {
  try {
    const { month } = req.query;
    let filter = {};
    if (month) {
      filter.month = month;
    }

    const payrolls = await Payroll.find(filter)
      .populate('employeeId', 'name email');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll List');

    worksheet.columns = [
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Month', key: 'month', width: 15 },
      { header: 'Basic Salary', key: 'basic', width: 15 },
      { header: 'Bonus', key: 'bonus', width: 15 },
      { header: 'Deductions', key: 'deductions', width: 15 },
      { header: 'Tax', key: 'tax', width: 15 },
      { header: 'Net Salary', key: 'net', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    payrolls.forEach((p) => {
      worksheet.addRow({
        name: p.employeeId ? p.employeeId.name : 'N/A',
        email: p.employeeId ? p.employeeId.email : 'N/A',
        month: p.month,
        basic: p.basicSalary,
        bonus: p.bonus,
        deductions: p.deductions,
        tax: p.tax,
        net: p.netSalary,
        status: p.paymentStatus,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=payroll_report_${month || 'all'}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
