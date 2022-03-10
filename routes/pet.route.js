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
const multerMiddleware = require('../middlewares/multer.middleware');

router.post('/', createPet);
router.post('/:id/uploadImage', multerMiddleware, uploadPetImages);
router.get('/', getAllPets);
router.get('/findByStatus', getPetByStatus);
router.get('/:id', getPet);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

module.exports = router;
