const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth');
const {
    getNeededSubstitutions,
    getAvailableTeachers,
    createSubstitution,
    deleteSubstitution
} = require('../controllers/substitution.controller');

router.get('/needed', protect, adminOnly, getNeededSubstitutions);
router.get('/available-teachers', protect, adminOnly, getAvailableTeachers);
router.post('/', protect, adminOnly, createSubstitution);
router.delete('/:id', protect, adminOnly, deleteSubstitution);

module.exports = router;
