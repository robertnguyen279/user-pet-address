'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Pet.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        onDelete: 'CASCADE',
        as: 'category',
      });

      Pet.hasOne(models.Order, { foreignKey: 'petId' });
      Pet.hasMany(models.Photo, { foreignKey: 'petId', as: 'photos' });
      Pet.Tag = Pet.belongsToMany(models.Tag, {
        through: models.Pet_Tag,
        foreignKey: 'petId',
        as: 'tags',
      });
    }
  }
  Pet.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      categoryId: {
        type: DataTypes.UUID,
        onDelete: 'CASCADE',
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'id',
          as: 'petId',
        },
      },
      status: {
        type: DataTypes.ENUM('available', 'pending', 'sold'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Pet',
    }
  );
  return Pet;
};
