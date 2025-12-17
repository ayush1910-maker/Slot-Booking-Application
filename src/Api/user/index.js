import express from "express"
import { validate } from "../../utils/validate.js"
import Joi from "joi"


import { getavailableSlots, register , bookSlot} from "./controller.js"

const router = express.Router()

router.post("/register" , validate(Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    gender: Joi.string().valid("Male" , "Female" , "Other").optional(),
    dateofbirth: Joi.date().required()
})) ,register)

router.get("/getavailableslots" , getavailableSlots)

router.post("/bookslot" , bookSlot)

export default router
