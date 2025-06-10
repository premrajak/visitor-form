const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Atlas Connection

mongoose.connect('mongodb+srv://visitordb:visitordb@cluster0.jzfnott.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Define Mongoose Schema
const visitorSchema = new mongoose.Schema({
  fullName: String,
  fatherName: String,
  dob: Date,
  gender: String,
  marriageStatus: String,
  phoneNumber: String,
  emailAddress: String,
  fullAddress: String,
  pinNumber: String,
  aadharCard: String,
  panCard: String,
  referredBy: String,
  regNo: String,
  visitDate: Date,
  visitorPurpose: String,
  photoFile: String,
  signatureFile: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]);

// API Endpoint to Handle Form Submission
app.post('/submit-form', upload, async (req, res) => {
  const data = req.body;
  const files = req.files;

  const newVisitor = new Visitor({
    fullName: data.fullName,
    fatherName: data.fatherName,
    dob: data.dob,
    gender: data.gender,
    marriageStatus: data.marriageStatus,
    phoneNumber: data.phoneNumber,
    emailAddress: data.emailAddress,
    fullAddress: data.fullAddress,
    pinNumber: data.pinNumber,
    aadharCard: data.aadharCard,
    panCard: data.panCard,
    referredBy: data.referredBy,
    regNo: data.regNo,
    visitDate: data.visitDate,
    visitorPurpose: data.visitorPurpose,
    photoFile: files?.photo?.[0]?.filename || null,
    signatureFile: files?.signature?.[0]?.filename || null
  });

  try {
    const savedVisitor = await newVisitor.save();
    console.log('Form Submitted:', savedVisitor);
    res.status(200).json({ message: 'Form submitted successfully', data: savedVisitor });
  } catch (err) {
    console.error('MongoDB Save Error:', err);
    res.status(500).json({ message: 'Error saving form data to MongoDB' });
  }
});

// API Endpoint to Get All Visitors
app.get('/getRegistration', async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 }); // Most recent first
    res.status(200).json({
      success: true,
      data: visitors
    });
  } catch (err) {
    console.error('Error fetching visitors:', err);
    res.status(500).json({
      success: false,
      message: 'Error retrieving visitor data'
    });
  }
});


// Start Server
app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
