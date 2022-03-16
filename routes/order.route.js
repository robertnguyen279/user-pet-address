const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getOrderById,
  deleteOrder,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/store.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.post('/orders', authMiddleware, placeOrder);
router.get('/orders', authMiddleware, adminMiddleware, getAllOrders);
router.get('/orders/:id', authMiddleware, adminMiddleware, getOrderById);
router.delete('/orders/:id', authMiddleware, adminMiddleware, deleteOrder);
router.put('/orders/:id', authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;
