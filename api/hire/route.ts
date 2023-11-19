import Hire from "@/models/hire";
import { connectToDB } from "@/utils/database";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDB();
  await addPost(req);
  res.json({});
}

export { handler as post };

const addPost = (req: any) => {
  try {
    const formData = req.body;
    console.log(`formData`, formData);
  } catch (error) {}
};
