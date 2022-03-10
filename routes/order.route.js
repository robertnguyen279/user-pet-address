const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getOrderById,
  deleteOrder,
} = require('../controllers/store.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/order', authMiddleware, placeOrder);
router.get('/order/:id', getOrderById);
router.delete('/order/:id', deleteOrder);

module.exports = router;
