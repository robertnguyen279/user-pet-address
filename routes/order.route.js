const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getOrderById,
  deleteOrder,
  updateOrder,
} = require('../controllers/store.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.post('/order', authMiddleware, placeOrder);
router.get('/order/:id', authMiddleware, adminMiddleware, getOrderById);
router.delete('/order/:id', authMiddleware, adminMiddleware, deleteOrder);
router.put('/order/:id', authMiddleware, adminMiddleware, updateOrder);

module.exports = router;
