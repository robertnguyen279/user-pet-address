const { Address } = require('../models');

exports.addAddress = async (req, res) => {
  const authUser = req.authUser;

  const { unit, road, city } = req.body;
  try {
    await Address.create({ unit, road, city, userId: authUser.id });
    res.send({ message: 'Add address successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.deleteAddress = async (req, res) => {
  const id = req.params.id;
  const authUser = req.authUser;

  try {
    await Address.destroy({ where: { id, userId: authUser.id } });
    res.send({ message: 'Delete address successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.updateAddress = async (req, res) => {
  const id = req.params.id;
  const authUser = req.authUser;

  try {
    await Address.update(
      { ...req.body },
      { where: { id, userId: authUser.id } }
    );
    res.send({ message: 'Update address successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message, ...error });
  }
};
