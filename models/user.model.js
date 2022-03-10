'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.Address = User.hasMany(models.Address, {
        foreignKey: 'userId',
        as: 'addresses',
      });

      User.hasMany(models.Order, {
        foreignKey: 'userId',
        as: 'orders',
      });
    }

    static generateHashedPassword(password) {
      return bcrypt.hashSync(password, 8);
    }

    static async generateAccessToken(email) {
      return jwt.sign({ userEmail: email }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TIMEOUT,
      });
    }

    static async generateRefreshToken(email) {
      return jwt.sign({ userEmail: email }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_TIMEOUT,
      });
    }

    comparePassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      phone: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          // Storing passwords in plaintext in the database is terrible.
          // Hashing the value with an appropriate cryptographic hash function is better.
          this.setDataValue('password', bcrypt.hashSync(value));
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
