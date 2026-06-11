import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import nodemailer from 'nodemailer';

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}






// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body

        // Email bhejne ke liye pehle appointment ka data nikalna padega
        const appointmentData = await appointmentModel.findById(appointmentId)

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // =======================================================
        // 🚀 CUSTOM FEATURE: SEND EMAIL (ADMIN CANCELLED)
        // =======================================================
        const userData = await userModel.findById(appointmentData.userId);
        const doctorData = await doctorModel.findById(appointmentData.docId);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userData.email,
            subject: 'Appointment Cancellation Notice - ClinicBook',
            text: `Hello ${userData.name},\n\nThis is to notify you that your appointment with Dr. ${doctorData.name} scheduled on ${appointmentData.slotDate} at ${appointmentData.slotTime} has been cancelled by the Hospital Administration.\n\nIf you have any queries regarding this cancellation, please contact our support team.\n\nRegards,\nClinicBook Administration Team`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            // Error handled silently to avoid API crash
        }
        // =======================================================

        res.json({ success: true, message: 'Appointment Cancelled & Notification Sent' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}







// API for adding Doctor
const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        // =======================================================
        // 🚀 CUSTOM FEATURE: SEND CREDENTIALS TO NEW DOCTOR
        // =======================================================
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email, // Bhejne ke liye actual email
            subject: 'Welcome to ClinicBook - Your Login Credentials',
            text: `Hello Dr. ${name},\n\nWelcome to ClinicBook! Your doctor profile has been successfully created by the administration.\n\nHere are your login credentials to access the Doctor Panel:\n\nEmail (Login ID): ${email}\nPassword: ${password}\n\nPlease keep these credentials secure and do not share them.\n\nRegards,\nClinicBook Administration Team`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            // Error handled silently to avoid API crash
        }
        // =======================================================

        res.json({ success: true, message: 'Doctor Added & Credentials Sent' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}








// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    adminDashboard
}