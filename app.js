const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const db = require('./models');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

const userRoutes = require('./routes/user.route');
const addressRoutes = require('./routes/address.route');
const adminRoutes = require('./routes/admin.route');
const petRoutes = require('./routes/pet.route');

const app = express();

db.sequelize
  .sync()
  .then(() => {
    console.log('Drop and re-sync db.');
  })
  .catch((err) => {
    console.error(err);
  });

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Address API',
      version: '1.0.0',
      description: 'A simple Address API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsDoc(options);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/users', userRoutes);
app.use('/addresses', addressRoutes);
app.use('/admin', adminRoutes);
app.use('/pets', petRoutes);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is up on port 3000');
});
