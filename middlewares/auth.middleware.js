const { User, Address } = require('../models');
const jwt = require('jsonwebtoken');

const checkAuth = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    try {
      const user = await verifyAccessToken(bearerToken);
      req.authUser = user;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).send({ error: error.message });
    }
  } else {
    // Forbidden
    res.sendStatus(403);
  }
};

const verifyAccessToken = async (token) => {
  try {
    const { userEmail } = await jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );
    const user = await User.findOne({
      where: { email: userEmail },
      include: [
        {
          model: Address,
          as: 'addresses',
        },
      ],
    });
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = checkAuth;
