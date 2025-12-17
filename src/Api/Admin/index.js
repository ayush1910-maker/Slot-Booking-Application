import express from "express"
import { validate } from "../../utils/validate.js"
import Joi from "joi"
import { registerAdmin , autoGenerateSlots } from "./controller.js"

const router = express.Router()

router.post("/registeradmin" , validate(Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
})),  registerAdmin)


const autoGenerateSlotsSchema = Joi.object({
  admin_id: Joi.number().required(),
  date: Joi.date().required(),
  slotDuration: Joi.number().min(1).optional(),
  breaks: Joi.array()
    .items(
      Joi.object({
        start: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](am|pm)$/i)
          .required(),
        end: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](am|pm)$/i)
          .required(),
      })
    )
    .optional(),
});

router.post("/auto-generate-slots",  validate(autoGenerateSlotsSchema),autoGenerateSlots)

export default router

