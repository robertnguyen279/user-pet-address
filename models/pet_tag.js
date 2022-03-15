'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pet_Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Pet_Tag.belongsTo(models.Pet, {
        foreignKey: 'petId',
        onDelete: 'CASCADE',
      });

      Pet_Tag.belongsTo(models.Tag, {
        foreignKey: 'tagId',
        onDelete: 'CASCADE',
      });
    }
  }
  Pet_Tag.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
    },
    {
      sequelize,
      modelName: 'Pet_Tag',
    }
  );
  return Pet_Tag;
};
