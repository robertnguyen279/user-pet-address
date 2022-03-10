const express = require('express');
const router = express.Router();
const {
  createPet,
  getPet,
  getAllPets,
  updatePet,
  deletePet,
  getPetByStatus,
} = require('../controllers/pet.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.post('/', createPet);
router.get('/', getAllPets);
router.get('/findByStatus', getPetByStatus);
router.get('/:id', getPet);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

module.exports = router;
