const { User, Address } = require('../models');
const redisClient = require('../services/redis.service');
const jwt = require('jsonwebtoken');
const filterBody = require('../services/filterBody.service');

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, addresses, age, phone } =
      filterBody(
        [
          'firstName',
          'lastName',
          'email',
          'password',
          'addresses',
          'age',
          'phone',
        ],
        req.body
      );
    const user = await User.create(
      {
        firstName,
        lastName,
        age,
        email,
        phone,
        password,
        addresses,
      },
      {
        include: [
          {
            association: User.Address,
            as: 'addresses',
          },
        ],
      }
    );

    const token = await User.generateAccessToken(req.body.email);
    const refreshToken = await User.generateRefreshToken(req.body.email);

    await redisClient.set(user.email, { refreshToken });

    res.status(201).send({
      ...user.dataValues,
      password: undefined,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    if (error.message.includes('Invalid request body key')) {
      res.status(406);
    } else {
      res.status(500);
    }

    res.send({
      message: error.message,
      ...error,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = filterBody(['email', 'password'], req.body);
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Address,
          as: 'addresses',
        },
      ],
    });

    if (!user) {
      throw new Error('User not found.');
    }

    if (user.comparePassword(password)) {
      const token = await User.generateAccessToken(user.email);
      const refreshToken = await User.generateRefreshToken(user.email);

      await redisClient.set(user.email, { refreshToken });
      await User.update({ token }, { where: { id: user.id } });

      res.send({
        ...user.dataValues,
        password: undefined,
        token,
        refreshToken,
      });
    } else {
      throw new Error('Password is not correct.');
    }
  } catch (error) {
    console.error(error);
    if (error.message.includes('Invalid request body key')) {
      res.status(406);
    } else if (
      error.message.includes('User not found') ||
      error.message.includes('Password is not correct')
    ) {
      res.status(400);
    } else {
      res.status(500);
    }

    res.send({ message: error.message, ...error });
  }
};

exports.getUser = (req, res) => {
  const user = req.authUser;
  res.send({ ...user.dataValues, password: undefined });
};

exports.updateUser = async (req, res) => {
  const authUser = req.authUser;

  try {
    filterBody(
      ['firstName', 'lastName', 'email', 'password', 'age', 'phone'],
      req.body
    );

    if (req.body.email) {
      throw new Error('Cannot change email.');
    }

    for (const key in req.body) {
      authUser[key] = req.body[key];
    }

    await authUser.save();

    res.send({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);

    if (
      error.message.includes('Cannot change email') ||
      error.message.includes('Invalid request body key')
    ) {
      res.status(406);
    } else {
      res.status(500);
    }

    res.send({ message: error.message, ...error });
  }
};

exports.logoutUser = async (req, res) => {
  const authUser = req.authUser;

  try {
    await redisClient.del(authUser.email);

    res.send({ message: 'User logout successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: error.message,
      ...error,
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = filterBody(['refreshToken'], req.body);
    const { userEmail } = await jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    const { refreshToken: storedToken } = await redisClient.get(userEmail);
    if (storedToken !== refreshToken) {
      throw new Error('Token is invalid.');
    }

    const token = await User.generateAccessToken(userEmail);
    const newRefreshToken = await User.generateRefreshToken(userEmail);
    await redisClient.set(userEmail, { refreshToken: newRefreshToken });
    res.send({ token, refreshToken: newRefreshToken });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Invalid request body key')) {
      res.status(406);
    } else {
      res.status(500);
    }
    res.send({ message: error.message, ...error });
  }
};

exports.deleteUser = async (req, res) => {
  const authUser = req.authUser;
  await redisClient.del(authUser.id);

  try {
    const num = await User.destroy({ where: { id: authUser.id } });

    if (num === 0) {
      throw new Error('No user found');
    }

    res.send({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error(error);

    if (error.message.includes('No user found')) {
      res.status(404);
    } else {
      res.status(500);
    }

    res.send({ message: error.message, ...error });
  }
};

exports.addAddress = async (req, res) => {
  const authUser = req.authUser;

  try {
    const { unit, road, city } = filterBody(['unit', 'road', 'city'], req.body);
    await Address.create({ unit, road, city, userId: authUser.id });
    res.send({ message: 'Add address successfully' });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Invalid request body key')) {
      res.status(406);
    } else {
      res.status(500);
    }

    res.send({ message: error.message, ...error });
  }
};

exports.deleteAddress = async (req, res) => {
  const id = req.params.id;
  const authUser = req.authUser;

  try {
    const num = await Address.destroy({ where: { id, userId: authUser.id } });

    if (num === 0) {
      throw new Error('Address not found');
    }

    res.send({ message: 'Delete address successfully' });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Address not found')) {
      res.status(404);
    } else {
      res.status(500);
    }
    res.send({ message: error.message, ...error });
  }
};

exports.updateAddress = async (req, res) => {
  const id = req.params.id;
  const authUser = req.authUser;

  try {
    filterBody(['unit', 'road', 'city'], req.body);

    await Address.update(
      { ...req.body },
      { where: { id, userId: authUser.id } }
    );
    res.send({ message: 'Update address successfully' });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Invalid request body key')) {
      res.status(406);
    } else {
      res.status(500);
    }

    res.send({ message: error.message, ...error });
  }
};

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
    const num = await User.destroy({ where: { id } });

    if (num === 0) {
      throw new Error('No user to delete');
    }

    res.send({ message: 'Delete user successfully' });
  } catch (error) {
    console.error(error);

    if (error.message.includes('No user to delete')) {
      res.status(404);
    } else {
      res.status(500);
    }
    res.send({ message: error.message, ...error });
  }
};

exports.updateUserById = async (req, res) => {
  const id = req.params.id;

  try {
    filterBody(
      [
        'firstName',
        'lastName',
        'email',
        'password',
        'addresses',
        'age',
        'phone',
      ],
      req.body
    );

    await User.update({ ...req.body }, { where: { id } });
    res.send({ message: 'Update user successfully' });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Invalid request body key')) {
      res.status(406);
    } else {
      res.status(500);
    }

    res.send({ message: error.message, ...error });
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
    console.error(error);

    if (error.message.includes('User not found')) {
      res.status(404);
    } else {
      res.status(500);
    }

    res.send({ message: error.message, ...error });
  }
};
