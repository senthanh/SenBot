//START

const Sequelize = require("sequelize");
const { resolve } = require("path");

module.exports.sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: resolve(__dirname, 'data.sqlite'),
    define: {
        underscored: false,
        freezeTableName: true,
        charset: 'utf8',
        dialectOptions: {
            collate: 'utf8_general_ci'
        },
        timestamps: true
    },
    sync: {
        force: false
    },
    logging: false,
    pool: {
        max: 30,
        min: 0,
        idle: 30000
    },
    transactionType: 'IMMEDIATE',
    retry: {
        match: [
            /SQLITE_BUSY/,
        ],
        name: 'query',
        max: 10
    }
});

module.exports.Sequelize = Sequelize;

//END