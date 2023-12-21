const Sequelize = require("sequelize");

const sequelize = require("../config/db");

const Cart = sequelize.define(
    "cart",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        product_name:{
            type:Sequelize.STRING,
        },
        price:{
            type:Sequelize.INTEGER,
            allowNull: false,
        },
        category:{
            type:Sequelize.STRING,
            allowNull: false
        },
        product_quantity: {
            type:Sequelize.INTEGER,
            allowNull: false,
        }
    },
    { indexes: [{ unique: true, fields: ['id'] }],
      paranoid: true,
    }
);

module.exports = Cart;