const { User, Address } = require('../models');
const redisClient = require('../services/redis.service');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
  const { firstName, lastName, email, password, addresses, age, phone } =
    req.body;
  try {
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

    res.send({
      ...user.dataValues,
      password: undefined,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: error.message,
      ...error,
    });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
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
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.getUser = (req, res) => {
  const user = req.authUser;
  res.send({ ...user.dataValues, password: undefined });
};

exports.updateUser = async (req, res) => {
  const authUser = req.authUser;

  try {
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
    res.status(500).send({ message: error.message, ...error });
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
  const refreshToken = req.body.refreshToken;
  try {
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
    res.status(500).send({ message: error.message, ...error });
  }
};

exports.deleteUser = async (req, res) => {
  const authUser = req.authUser;
  await redisClient.del(authUser.id);

  try {
    await User.destroy({ where: { id: authUser.id } });
    res.send({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error(error);
    send.status(500).send({ message: error.message, ...error });
  }
};
