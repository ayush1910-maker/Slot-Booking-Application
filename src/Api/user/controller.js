import User from "../../models/user.js"
import SlotDetails from "../../models/slots.js"
import jwt from "jsonwebtoken"
import { Op } from "sequelize"
import cron from "node-cron"


const register = async (req,res) => {
    try {

    const { name, email, gender, dateofbirth } = req.body

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      name,
      email,
      gender,
      dateofbirth,
    });

    return res.status(201).json({
      message: "User registered successfully",
      data: newUser,
    });
        
    } catch (error) {
        return res
        .status(500)
        .json({status: true , message: "internal server problem"})
    }
}


// const getavailableSlots = async (req,res) => {
//   try {

//     const { date } = req.query;

//     const slots = await SlotDetails.findAll({
//       where: {
//         date,
//         status: "available"
//       },
//       order: [["start_time" , "ASC"]]
//     })

//     if(slots.length === 0) {
//       return res.status(404).json({status: false , message: "No Available Slots"})
//     }

//     return res.status(200).json({status: true, data: slots })
//   } catch (error) {
//     return res.status(501).json({status: false , message: error.message})
//   }
// }


const getavailableSlots = async (req, res) => {
  try {
    const { date} = req.query;

    if (!date) {
      return res.status(400).json({ status: false, message: "Date is required" });
    }
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const whereClause = {
      date: { [Op.between]: [startOfDay, endOfDay] },
      status: "available",
    };


    const slots = await SlotDetails.findAll({
      where: whereClause,
      order: [["start_time", "ASC"]],
    });

    if (slots.length === 0) {
      return res.status(404).json({ status: false, message: "No Available Slots" });
    }

    return res.status(200).json({ status: true, data: slots });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const bookSlot = async (req,res) => {
  try {

    // const user_id = req.user.id;
    const {slot_id , user_id} = req.body;

    const slot = await SlotDetails.findByPk(slot_id)
    if(!slot) {
      return res.status(400).json({status: false , message: "Slot not found"})
    }

    if(slot.status === "booked") {
      return res.status(400).json({status: false , message: "This slot is already booked"})
    }

    slot.status = "booked";
    slot.user_id = user_id;
    await slot.save();

    const slotTime = new Date(`${slot.date}T${slot.start_time}`);

    const notifyTime = new Date(slotTime.getTime()  - 10 * 60 * 1000 );
    
    const cronTime = `${notifyTime.getMinutes()} ${notifyTime.getHours()} ${notifyTime.getDate()} ${notifyTime.getMonth() + 1} *`;
    console.log(cronTime);

    cron.schedule(cronTime , () => {
      console.log(` notification: User ${user_id} , your slot (id: ${slot_id}) is sheduled at ${slotTime} `);
    })
    // console.log(cron);
    
    
    cron.schedule("* * * * *", () => {
     console.log("Cron heartbeat: still running at", new Date().toLocaleString());
    });

    return res.status(200).json({
      status: true,
      message: "Slot booked successfully",
      data: slot
    })
  } catch (error) {
    return res.status(501).json({status: false , message: error.message})
  }
}

export {
    register,
    getavailableSlots,
    bookSlot
}