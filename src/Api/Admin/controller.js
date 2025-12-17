import SlotDetails from "../../models/slots.js";
import Admin from "../../models/admin.js"
import { Op } from "sequelize";
import User from "../../models/user.js";


// const registerAdmin = async  (req,res) => {

//   try {
//     const {name , email} = req.body

//     const existingAdmin = await User.findOne({ where: { email } });
//     if (existingAdmin) {
//       return res.status(400).json({ message: "Admin already exists" });
//     }

//     const admin = await Admin.create({
//       name,
//       email,
//     });

//     return res.status(201).json({status: true , message: "admin create successfully" , data: admin})

//   } catch (error) {
//     return res.status(501).json({status: false , message: error.message})
//   }

// }

const registerAdmin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({
        status: false,
        message: "An admin already exists. Only one admin is allowed."
      });
    }

    const { name, email } = req.body;

    const admin = await Admin.create({
      name,
      email,
    });

    return res.status(201).json({
      status: true,
      message: "Admin created successfully",
      data: admin
    });

  } catch (error) {
    return res.status(501).json({
      status: false,
      message: error.message
    });
  }
};




const timeToMinutes = (timeStr) => {
  if (!timeStr) throw new Error("Invalid time string");

  let t = timeStr.trim().toLowerCase();
  let period = "";

  if (t.endsWith("am") || t.endsWith("pm")) {
    period = t.slice(-2);
    t = t.slice(0, -2).trim();
  }

  let [h, m = "0"] = t.split(":").map((v) => parseInt(v.trim(), 10));

  if (isNaN(h) || isNaN(m)) throw new Error("Invalid time format: " + timeStr);

  if (period) {
    if (period === "pm" && h < 12) h += 12;
    if (period === "am" && h === 12) h = 0;
  }

  return h * 60 + m;
};

const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};


const autoGenerateSlots = async (req, res) => {
  try {
    const { admin_id, date, slotDuration = 45, breaks = [] } = req.body;

    if (!admin_id || !date) {
      return res.status(400).json({ status: false, message: "admin_id and date are required" });
    }

    if (!Array.isArray(breaks)) {
      return res.status(400).json({ status: false, message: "breaks must be an array" });
    }

    // validate admin
    const admin = await Admin.findByPk(admin_id);
    if (!admin) {
      return res.status(404).json({ status: false, message: "Admin not found" });
    }

    // check if slots already exist for that date
    const existingSlots = await SlotDetails.findAll({ where: { admin_id, date } });
    if (existingSlots.length > 0) {
      return res.status(200).json({
        status: false,
        message: "Slots already generated for this date",
        slots: existingSlots,
      });
    }

    // validate breaks
    const breakRanges = breaks.map((br) => {
      if (!br.start || !br.end) throw new Error("Each break must have start and end");
      const start = timeToMinutes(br.start);
      const end = timeToMinutes(br.end);
      if (end <= start) throw new Error(`Invalid break range: ${br.start} - ${br.end}`);
      return { start, end };
    });

    // working hours (12 PM – 6 PM)
    const startMinutes = timeToMinutes("12:00pm");
    const endMinutes = timeToMinutes("6:00pm");

    // generate slots
    const slotsToCreate = [];
    let current = startMinutes;

    while (current + slotDuration <= endMinutes) {
      const slotStart = current;
      const slotEnd = current + slotDuration;

      const inBreak = breakRanges.some((br) => slotStart < br.end && slotEnd > br.start);

      if (!inBreak) {
        slotsToCreate.push({
          admin_id,
          date,
          start_time: minutesToTime(slotStart),
          end_time: minutesToTime(slotEnd),
          status: "available",
        });
      }
      current = slotEnd;
    }

    // save in db
    const savedSlots = await SlotDetails.bulkCreate(slotsToCreate);

    return res.status(201).json({
      status: true,
      message: "Slots auto-generated successfully",
      data: savedSlots,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Server error" });
  }
};



export {
  autoGenerateSlots,
  registerAdmin
}