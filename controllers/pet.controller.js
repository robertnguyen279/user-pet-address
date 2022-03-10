const { Pet, Category, Pet_Tag, Tag, Photo } = require('../models');
const { v4: uuid } = require('uuid');

exports.createPet = async (req, res) => {
  const { category, name, tags, status } = req.body;
  const petId = uuid();

  try {
    if (!category) {
      throw new Error('Category must be specified');
    }

    const categoryIns = await Category.findOrCreate({
      where: { name: category },
    });

    const pet = await Pet.create({
      id: petId,
      name,
      categoryId: categoryIns[0].id,
      status,
    });

    if (tags) {
      await Promise.all(
        tags.map(async (tag) => {
          const tagInc = await Tag.findOrCreate({ where: { name: tag } });
          await Pet_Tag.findOrCreate({ where: { petId, tagId: tagInc[0].id } });
        })
      );
    }

    res.send({ message: 'Create pet successfully', petId: pet.id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.getPet = async (req, res) => {
  const id = req.params.id;

  try {
    const pet = await Pet.findOne({
      where: { id },
      include: [
        {
          model: Category,
          as: 'category',
        },
        {
          model: Tag,
          as: 'tags',
        },
        {
          model: Photo,
          as: 'photos',
        },
      ],
      attributes: {
        exclude: ['categoryId'],
      },
    });

    if (!pet) {
      throw new Error('No pet found');
    }

    res.send(pet);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.getAllPets = async (req, res) => {
  try {
    const pets = await Pet.findAll({
      include: [
        {
          model: Category,
          as: 'category',
        },
        {
          model: Tag,
          as: 'tags',
        },
        {
          model: Photo,
          as: 'photos',
        },
      ],
      attributes: {
        exclude: ['categoryId'],
      },
    });

    res.send(pets);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.updatePet = async (req, res) => {
  const id = req.params.id;
  try {
    const pet = await Pet.findByPk(id);

    for (const key in req.body) {
      pet[key] = req.body[key];
    }

    if (req.body.category) {
      const categoryIns = await Category.findOrCreate({
        where: { name: req.body.category },
      });

      pet.categoryId = categoryIns[0].id;
    }

    await pet.save();

    if (req.body.tags) {
      await Pet_Tag.destroy({ where: { petId: pet.id } });
      await Promise.all(
        req.body.tags.map(async (tag) => {
          const tagInc = await Tag.findOrCreate({ where: { name: tag } });

          await Pet_Tag.findOrCreate({
            where: { petId: pet.id, tagId: tagInc[0].id },
          });
        })
      );
    }

    res.send({ message: 'Update pet successfully', petId: pet.id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.deletePet = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Pet.destroy({ where: { id } });

    if (!num) {
      throw new Error('Pet not found');
    }

    res.send({ message: 'Delete pet successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.getPetByStatus = async (req, res) => {
  const status = req.query.status;

  try {
    const pets = await Pet.findAll({
      where: { status },
      include: [
        {
          model: Category,
          as: 'category',
        },
        {
          model: Tag,
          as: 'tags',
        },
        {
          model: Photo,
          as: 'photos',
        },
      ],
      attributes: {
        exclude: ['categoryId'],
      },
    });

    res.send(pets);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.uploadPetImages = async (req, res) => {
  const id = req.params.id;
  try {
    const pet = await Pet.findByPk(id);

    if (!req.files) {
      throw new Error('Images must be provided');
    }

    const photos = req.files.map((file) => {
      return {
        petId: pet.id,
        url: `/images/${file.filename}`,
      };
    });

    const photosIns = await Photo.bulkCreate(photos);

    res.send(photosIns);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message, ...error });
  }
};
