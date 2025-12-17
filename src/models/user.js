import sequelize from "../common/config/db1.js";
import { DataTypes } from "sequelize";

const User = sequelize.define("user" , 
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false
        },

        gender: {
            type: DataTypes.ENUM("Male" , "Female" , "Other"),
            allowNull: true
        },
      
        dateofbirth:  {
            type: DataTypes.DATE,
            allowNull: false
        },        
    },
    {
        tableName: "user",
        timestamps: true
    }
)

export default User