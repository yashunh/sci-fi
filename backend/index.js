import express from "express"
import zod from "zod"
import jwt from "jsonwebtoken"
import { db } from "./firebase/config.js"
import { doc, getDoc } from 'firebase/firestore';
import { transporter } from "./transporter/transporter.js"
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from "./middleware/authmiddleware.js"

const prisma = new PrismaClient()
const app = express()
app.use(express.json());


const userSchema = zod.object({
    uid: zod.string().regex(/^2[0-4][A-Za-z]{3}\d{4,5}$/),
    password: zod.string()
})

const otpSchema = zod.object({
    otp: zod.number().max(999999).min(100000),
    uid: zod.string().regex(/^2[0-4][A-Za-z]{3}\d{4,5}$/)
})

const uidSchema = zod.string().regex(/^2[0-4][A-Za-z]{3}\d{4,5}$/);

const postSchema = zod.object({
    uid: zod.string().regex(/^2[0-4][A-Za-z]{3}\d{4,5}$/),
    title: zod.string().min(3),
    content: zod.string().min(10),
    url: zod.string().url().optional()
})

const bulkSchema = zod.number().max(10000).min(0)

app.post("/signup", async (req, res) => {
    const { success } = userSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        })
    }

    const userRef = doc(db, 'sci-fi_member', req.body.uid)
    const isMember = await getDoc(userRef)
    if (!isMember.exists()) {
        return res.status(411).json({
            message: "Not an member of club"
        })
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            UID: req.body.uid
        }
    })
    if (existingUser) {
        return res.status(411).json({
            message: "User already exists"
        })
    }

    let user = await prisma.user.create({
        data: {
            UID: req.body.uid,
            password: req.body.password,
            Name: isMember.data().name,
            clubID: isMember.data().clubId
        }
    })

    const email = user.UID + "@cuchd.in"
    const otp = Math.floor(100000 + Math.random() * 900000)
    user = await prisma.user.update({
        where: {
            UID: user.UID
        },
        data: {
            otp: otp
        }
    })

    const response = await transporter.sendMail({
        from: 'secratary.scifiinnovationclub@gmail.com',
        to: email,
        replyTo: 'no-reply@scifiinnovationclub.com',
        subject: `OTP from Sci-Fi Innovation Club`,
        html: `<b>OTP for verification is ${otp}</b>`
    })
    return res.json({
        msg: "user created",
        uid: user.UID
    })
})

app.post("/otp", async (req, res) => {
    const { success } = otpSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            UID: req.body.uid
        }
    })
    if (!existingUser) {
        return res.status(411).json({
            message: "User does not exists",
        })
    }

    if(existingUser.authorized){
        return res.status(411).json({
            message: "User already authenticated",
        })
    }

    if (req.body.otp == existingUser.otp) {
        const response = await prisma.user.update({
            where: {
                UID: existingUser.UID
            },
            data: {
                authorized: true
            }
        })
        const token = jwt.sign({
            uid: existingUser.UID
        }, process.env.JWT_SECRET)
        return res.json({
            msg: "user authenticated",
            token
        })
    }
    return res.status(411).json({
        message: "Incorrect otp"
    })
})

app.post("/signin", async (req, res) => {
    const { success } = userSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            UID: req.body.uid
        }
    })
    if (!existingUser) {
        return res.status(411).json({
            message: "User does not exists",
        })
    }

    if (!existingUser.authorized) {
        return res.status(411).json({
            message: "Auth required",
        })
    }

    if(existingUser.password !== req.body.password){
        return res.status(411).json({
            message: "Incorrect Password"
        })
    }

    const token = jwt.sign({
        uid: existingUser.UID
    }, process.env.JWT_SECRET)
    return res.json({
        msg: "user logged in",
        token
    })
})

app.get("/getPassword", async (req, res) => {
    const { success } = uidSchema.safeParse(req.body.uid)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            UID: req.body.uid
        }
    })
    if (!existingUser) {
        return res.status(411).json({
            message: "User does not exists",
        })
    }

    const email = existingUser.UID + "@cuchd.in"
    const password = existingUser.password
    const response = await transporter.sendMail({
        from: 'secratary.scifiinnovationclub@gmail.com',
        to: email,
        replyTo: 'no-reply@scifiinnovationclub.com',
        subject: `Password from Sci-Fi Innovation Club`,
        html: `<b>Your Password is ${password}</b>`
    })
    return res.json({
        msg: "password send to your email"
    })
})

app.get("/getattendance", authMiddleware, async(req, res) => {
    const { success } = uidSchema.safeParse(req.body.uid)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            UID: req.body.uid
        }
    })
    if (!existingUser) {
        return res.status(411).json({
            message: "User does not exists",
        })
    }

    res.send({
        PixelAndCode: existingUser.PixelAndCode,
        TechAHunt: existingUser.TechAHunt,
        Synergy: existingUser.Synergy,
        Nipam: existingUser.Nipam
    })
})

app.post("/createPost", authMiddleware, async (req, res)=>{
    const { success } = postSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs",
            body: req.body,
            result: success
        })
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            UID: req.body.uid
        }
    })
    if (!existingUser) {
        return res.status(411).json({
            message: "User does not exists",
        })
    }

    const result = await prisma.post.create({
        data:{
            authorId: existingUser.UID,
            title: req.body.title,
            content: req.body.content,
            url: req.body.url||"",
        }
    })

    res.send(result)
})

app.get("/getPost", authMiddleware, async (req, res)=>{
    const { success } = uidSchema.safeParse(req.body.uid)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            UID: req.body.uid
        }
    })
    if (!existingUser) {
        return res.status(411).json({
            message: "User does not exists",
        })
    }

    const result = await prisma.post.findMany({
        where:{
            authorId: existingUser.UID
        }
    })

    res.send(result)
})

app.get("/bulkPost", async (req, res)=>{
    const { success } = bulkSchema.safeParse(req.body.iterator)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const result = await prisma.post.findMany({
        take: 20,
        skip: req.body.iterator * 20
    })
    res.send(result)
})

app.use((err, req, res, next) => {
    console.log(err)
    return res.send({ err })
})

app.listen(3000, () => {
    console.log('listening at 3000')
})