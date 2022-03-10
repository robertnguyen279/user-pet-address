const { User } = require('../models');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ['password'],
      },
    });

    res.send(users);
  } catch (error) {
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.deleteUserById = async (req, res) => {
  const id = req.params.id;

  try {
    await User.destroy({ where: { id } });
    res.send({ message: 'Delete user successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.updateUserById = async (req, res) => {
  const id = req.params.id;

  try {
    await User.update({ ...req.body }, { where: { id } });
    res.send({ message: 'Update user successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.getUserById = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findOne(
      {
        attributes: {
          exclude: ['password'],
        },
      },
      { where: { id } }
    );

    if (!user) {
      throw new Error('User not found.');
    }

    res.send(user);
  } catch (error) {
    res.status(500).send({ message: error.message, ...error });
  }
};
