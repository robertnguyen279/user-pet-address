const express = require('express');
const router = express.Router();
const {
  createUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
  logoutUser,
  refreshToken,
} = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', createUser);
router.post('/login', loginUser);
router.post('/token', refreshToken);
router.get('/', authMiddleware, getUser);
router.put('/', authMiddleware, updateUser);
router.delete('/logout', authMiddleware, logoutUser);
router.delete('/', authMiddleware, deleteUser);

module.exports = router;
