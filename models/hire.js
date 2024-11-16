import { Schema, model, models } from "mongoose";

const EnquerySchema = new Schema(
  {
    email: {
      type: "string",
      // unique: [true, "Email already exists!!!"],
      required: [true, "Email is requried!!"],
    },
    organisation: {
      type: "string",
    },
    subject: {
      type: "string",
      required: [true, "subject is requried!!!"],
    },
    message: {
      type: "string",
      required: [true, "message is requried!!!"],
    },
    attachment: {
      type: "string",
    },
  },
  { timestamps: true },
);

const Enquery = models.Enquery || model("Enquery", EnquerySchema);
export default Enquery;
