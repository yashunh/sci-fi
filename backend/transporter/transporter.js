import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'scifiinnovationclub@gmail.com',
        pass: "qylt xqjf tzyv lhbp"
    }
});