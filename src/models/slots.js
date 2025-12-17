import sequelize from "../common/config/db1.js";
import { DataTypes } from "sequelize";


const SlotDetails = sequelize.define("slotdetails" , 
    {

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "user",
            key: "id"
        },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
    },

    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "admin",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
       
    date: {
      type: DataTypes.DATE, 
      allowNull: false,
    },

    start_time: {
      type: DataTypes.TIME, 
      allowNull: false,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("booked", "available", "cancelled"),
      defaultValue: "available",
    },

    },
    {
        tableName: "slotdetails",
        timestamps: true
    }
)

export default SlotDetails