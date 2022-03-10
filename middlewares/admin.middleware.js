const checkAdmin = (req, res, next) => {
  if (req.authUser.role === 'user') {
    res.status(401).send({ message: 'You are not authorized.' });
  }

  next();
};

module.exports = checkAdmin;
