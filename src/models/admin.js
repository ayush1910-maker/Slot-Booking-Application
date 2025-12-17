import sequelize from "../common/config/db1.js";
import { DataTypes } from "sequelize";

const Admin = sequelize.define(
  "admin",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "admin",
    timestamps: true,
  }
);

export default Admin;
