'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }

  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });

  // Move this inside the function
  User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });

  return User;
};
