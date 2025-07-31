import { DataTypes } from "sequelize";
import sequelize from "../config/connectDB.js";

const User = sequelize.define("users", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  phone: { type: DataTypes.STRING },
  money: { type: DataTypes.INTEGER },
}, {
  timestamps: false,
});

export default User;
