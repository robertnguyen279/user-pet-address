'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Photo.belongsTo(models.Pet, { foreignKey: 'petId', onDelete: 'CASCADE' });
    }
  }
  Photo.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      url: {
        type: DataTypes.STRING,
      },
      petId: {
        type: DataTypes.UUID,
        onDelete: 'CASCADE',
        allowNull: false,
        references: {
          model: 'Pets',
          key: 'id',
          as: 'petId',
        },
      },
    },
    {
      sequelize,
      modelName: 'Photo',
    }
  );
  return Photo;
};
