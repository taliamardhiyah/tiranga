const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});

const CrashGame = sequelize.define('CrashGame', {
    crash_point: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'waiting' },
}, { timestamps: true });

module.exports = { CrashGame, sequelize };
