const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
  addAddress,
  deleteAddress,
  updateAddress,
} = require('../controllers/address.controller');

router.post('/', authMiddleware, addAddress);
router.delete('/:id', authMiddleware, deleteAddress);
router.put('/:id', authMiddleware, updateAddress);

module.exports = router;
