import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
import { env } from 'node:process';




dotenv.config({ path: '.env' });

// Create connection to MySQL database
export const sequelize = new Sequelize(process.env.DATABASE, process.env.USERNAME, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: 'mysql'
});


  // Define User model
export const User = sequelize.define('user', {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  company: {
    type: Sequelize.STRING,
    required: true
  },
  prToken: {
    type: Sequelize.STRING,
    allowNull: true
  },
  emailVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  accessLevel: {
    type: Sequelize.TINYINT,
    allowNull: true,
    defaultValue: 1
  }

});

