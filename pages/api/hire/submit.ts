import Enquery from "@/models/hire";
import { connectToDB } from "@/utils/database";

import { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDB();
    const { name, email, subject, message, organisation } = req.body;
    console.log(`formData`, req.body);
    // Save the form data to MongoDB using Mongoose
    const formData = new Enquery({ name, email, subject, message, organisation });
    await formData.save();
    res.json({ msg: "data saved!", data: formData });
  } catch (error) {
    console.log(`Error while saving data!!!`, error);
    res.json({ msg: "Error in saving", data: null });
  }
}

export { handler as post };
