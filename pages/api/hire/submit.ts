import Enquery from "@/models/hire";
import { connectToDB, disconnectDB } from "@/utils/database";
import MailChecker from "mailchecker"
import nodemailer from "nodemailer"; 
import { NextApiRequest, NextApiResponse } from "next";
import twilio from 'twilio';

const accountSid = process.env.NEXT_TWILLIO_SID;
const authToken = process.env.NEXT_TWILLIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const sendSMS = async ({ email, organisation, subject, message }: any) => {

  // Check if the email sending is enabled via environment variable
  if (process.env.NEXT_ENABLE_SMS != '1' || !process.env.NEXT_RECEIVER_NUMBER ||  !process.env.NEXT_FROM_NUMBER) {
    console.log('SMS sending is disabled. Skipping SMS.');
    return;
  }
  
  try {
    const sms = await client.messages.create({
      body: `From: ${email} (${organisation})\nSubject: ${subject}\nMessage: ${message}`,
      to: process.env.NEXT_RECEIVER_NUMBER,
      from: process.env.NEXT_FROM_NUMBER, // Replace with your Twilio phone number
    });
    console.log('Message sent:', sms.sid);
    return sms;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export async function sendEmail(obj: any) {

   // Check if the email sending is enabled via environment variable
   if (process.env.NEXT_ENABLE_MAIL != '1') {
    console.log('Email sending is disabled. Skipping email.');
    return;
  }


  const { email, subject, message, organisation } = obj;
  
  // Create a transporter object using the default SMTP transport.
  const transporter = nodemailer.createTransport({
    host: process.env.NEXT_MAIL_HOST,  // Example SMTP server, use your actual SMTP server
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.NEXT_MAIL_USER,  // replace with your email
      pass: process.env.NEXT_MAIL_PASS,  // replace with your password
    },
  });

  try {
    const PARAMS = {
      from: `"Deepak Kumar (imdeepak)" <${process.env.NEXT_PUBLIC_EMAIL_ID}>`,  // sender address
      to: process.env.NEXT_PUBLIC_EMAIL_ID,  // recipient address
      subject: subject,  // Subject line
      html: `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Contact Us - Message</title>
                <style>
                  body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f7fc;
                    color: #333;
                    margin: 0;
                    padding: 0;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  }
                  .header {
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #f2f2f2;
                  }
                  .header h1 {
                    color: #4CAF50;
                    font-size: 28px;
                  }
                  .content {
                    margin-top: 20px;
                  }
                  .content p {
                    font-size: 16px;
                    line-height: 1.6;
                  }
                  .content .bold {
                    font-weight: bold;
                  }
                  .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 14px;
                    color: #888;
                  }
                  .footer p {
                    margin: 5px 0;
                  }
                  .button {
                    display: inline-block;
                    background-color: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    font-size: 16px;
                    border-radius: 5px;
                    margin-top: 20px;
                    text-align: center;
                  }
                  .button:hover {
                    background-color: #45a049;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>New Contact Us Message</h1>
                  </div>

                  <div class="content">
                    <p><span class="bold">Email:</span>${email}</p>
                    <p><span class="bold">Organisation:</span> ${organisation}</p>
                    <p><span class="bold">Subject:</span> ${subject} </p>
                    <p><span class="bold">Message:</span></p>
                    <p>${message}</p>
                  </div>
                </div>
              </body>
              </html>`,
    };
    // Send mail with the defined transport object
    console.log(`PARAMS`,PARAMS)
    const info = await transporter.sendMail(PARAMS);

    console.log("Message sent: %s", info.messageId);
    // You will see the message ID in the logs if it was sent successfully
  } catch (error) {
    console.error("Error sending email:", error);
  }
}


// Calling the function to send the email
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate HTTP method
  if (req.method !== 'POST') {
    return res.status(405).json({ msg: 'Method Not Allowed', data: null });
  }

  let dbConnection: any;

  try {
    // Step 1: Connect to the database
    dbConnection = await connectToDB();

    // Step 2: Destructure and validate the request body
    const { email, subject, message, organisation } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ msg: 'Missing required fields', data: null });
    }

    // Step 3: Validate the email format
    if (!MailChecker.isValid(email)) {
      return res.status(400).json({ msg: 'Invalid email', data: null });
    }

    // Step 4: Send the email asynchronously
    const emailPromise = sendEmail({ email, subject, message, organisation });
    const smsPromise =  sendSMS({ 
      email, 
      organisation, 
      subject, 
      message 
    });

    // Step 5: Save the form data to MongoDB
    const formData = new Enquery({ email, subject, message, organisation });
    const savePromise = formData.save();

    // Step 6: Wait for both operations to complete
    const [emailResult, saveResult, smsResult] = await Promise.allSettled([emailPromise, savePromise, smsPromise]);

    // Log the results for debugging
    console.log('Email Result:', emailResult);
    console.log('Save Result:', saveResult);
    console.log(`SMS Result:`,smsResult)

    if (saveResult.status === 'fulfilled') {
      console.log(`Form data saved successfully:`, formData);
      return res.status(200).json({ msg: 'Data saved!', data: formData });
    } else {
      throw new Error('Failed to save form data');
    }
  } catch (error) {
    console.error('Error while processing the request:', error);
    return res.status(500).json({ msg: 'Internal Server Error', data: null });
  } finally {
    // Step 7: Disconnect from the database
    if (dbConnection) {
      await disconnectDB();
      console.log('Database connection closed');
    }
  }
}


export { handler as post };
