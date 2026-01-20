const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth');
const studentController = require('../controllers/admin/student.controller');
const assignmentController = require('../controllers/admin/assignment.controller');
const masterDataController = require('../controllers/admin/masterData.controller');
const teacherController = require('../controllers/admin/teacher.controller');
const dashboardController = require('../controllers/admin/dashboard.controller');

// All routes here are protected and Admin only
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// Teachers
router.get('/teachers', teacherController.getTeachers);
router.get('/teachers/:id', teacherController.getTeacherById);
router.post('/teachers', teacherController.createTeacher);
router.put('/teachers/:id', teacherController.updateTeacher);
router.delete('/teachers/:id', teacherController.deleteTeacher);

// Master Data
router.get('/master-data', masterDataController.getAllMasterData);
router.post('/master-data/init', masterDataController.initDefaults);
router.post('/master-data/:type', masterDataController.createItem);
router.delete('/master-data/:type/:id', masterDataController.deleteItem);

// Students
router.post('/students', studentController.createStudent);
router.get('/students', studentController.getStudents);
router.get('/students/:id', studentController.getStudentById);
router.put('/students/:id', studentController.updateStudent);

// Assignments
router.post('/assignments', assignmentController.createAssignment);
router.get('/assignments', assignmentController.getAssignments);
router.delete('/assignments/:id', assignmentController.removeAssignment);

module.exports = router;
