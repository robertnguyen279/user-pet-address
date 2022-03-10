const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUserById,
  updateUserById,
  getUserById,
} = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.get('/users/:id', authMiddleware, adminMiddleware, getUserById);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUserById);
router.put('/users/:id', authMiddleware, adminMiddleware, updateUserById);

module.exports = router;
