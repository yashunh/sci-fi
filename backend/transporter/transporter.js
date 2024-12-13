import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'scifiinnovationclub@gmail.com',
        pass: process.env.EMAIL_KEY
    }
});