const express = require('express');
const router = express.Router();
const {
  createPet,
  getPet,
  getAllPets,
  updatePet,
  deletePet,
  getPetByStatus,
  uploadPetImages,
} = require('../controllers/pet.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.post('/', authMiddleware, adminMiddleware, createPet);
router.post(
  '/:id/uploadImage',
  authMiddleware,
  adminMiddleware,
  uploadPetImages
);
router.get('/', getAllPets);
router.get('/findByStatus', getPetByStatus);
router.get('/:id', getPet);
router.put('/:id', authMiddleware, adminMiddleware, updatePet);
router.delete('/:id', authMiddleware, adminMiddleware, deletePet);

module.exports = router;
