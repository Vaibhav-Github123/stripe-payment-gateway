const Sequelize = require("sequelize");

const sequelize = require("../config/db");

const Product = sequelize.define(
    "product",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        product_name:{
            type:Sequelize.STRING,
            allowNull: false,
        },
        price:{
            type:Sequelize.INTEGER,
            allowNull: false,
        },
        category:{
            type:Sequelize.STRING,
            allowNull: false
        },
        product_id:{
            type:Sequelize.STRING,
        },
        downpayment_price_id:{
            type:Sequelize.STRING,
        },
        restamount_price_id:{
            type:Sequelize.STRING,
        },
        tranction_price_id:{
            type:Sequelize.STRING,
        }
    },
    { indexes: [{ unique: true, fields: ['id'] }],
      paranoid: true,
    }
);

module.exports = Product;