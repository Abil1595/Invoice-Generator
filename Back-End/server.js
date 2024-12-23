const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const ErrorHandler = require('./utils/ErrorHandler');
const sendEmail=require('./utils/email')
const sendToken=require('./utils/jwt')
const cookieParser = require('cookie-parser');
require('dotenv').config(); // Load environment variables
const User=require('./models/userModel');
const { isAuthenticatedUser } = require('./middlewares/authenticateMiddleware');
const app = express();
app.use(cors());
app.use(express.json());

app.use(cookieParser());

const port = process.env.PORT || 4500; // Use PORT from env or default to 4500

// MongoDB Connection


mongoose.connect('mongodb://127.0.0.1:27017/Invoice-generator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });


  

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Load from .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Load from .env
});

// Mongoose Schema and Model
const invoiceSchema = new mongoose.Schema({
  title: { required: true, type: String },
  description: { type: String },
  amount: { required: true, type: Number },
  dueDate: { required: true, type: Date },
  paymentStatus: { type: String, default: 'Pending' },
});
const invoiceModel = mongoose.model('Invoice-generator', invoiceSchema);

// Create Invoice
app.post('/invoices', async (req, res) => {
  const { title, description, amount, dueDate } = req.body;
  try {
    const newInvoice = new invoiceModel({ title, description, amount, dueDate });
    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Fetch All Invoices
app.get('/invoices', async (req, res) => {
  try {
    const invoices = await invoiceModel.find();
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Update Invoice
app.put('/invoices/:id', async (req, res) => {
  const { title, description, amount, dueDate } = req.body;
  const id = req.params.id;

  try {
    const invoice = await invoiceModel.findByIdAndUpdate(
      id, { title, description, amount, dueDate }, { new: true }
    );
    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Delete Invoice
app.delete('/invoices/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await invoiceModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Invoice deleted successfully' }).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Create Razorpay Order Based on Amount
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ message: 'Amount is required' });
  }

  try {
    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Verify Payment Signature
// Verify Payment Signature
app.post('/verify-payment', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    console.log("Received Payment Details:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
  
    const body = razorpay_order_id + "|" + razorpay_payment_id;
  
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
  
    console.log("Expected Signature:", expectedSignature);
  
    if (expectedSignature === razorpay_signature) {
      console.log("Signature Matched");
      res.json({ message: 'Payment verified successfully' });
    } else {
      console.error("Signature Mismatch", {
        expected: expectedSignature,
        received: razorpay_signature,
      });
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  });
  const tempUserStore={}
  app.post('/register',async(req,res,next)=>{
    const{name,email,password}=req.body;
     if(!name || !email || !password)
     {
      return next(new ErrorHandler('All fields are required ',400))
     }
     const existingUser=await User.findOne({email});
     if(existingUser)
     {
      return next(new ErrorHandler('Email is already registered',400))
     }
     const otp=Math.floor(100000 +Math.random()*900000).toString();
     const otpToken=crypto.createHash('sha256').update(otp).digest('hex');
     const otpExpire=Date.now()+10*60*1000;
     tempUserStore[email]={
      name,email,password,otp:otpToken,otpExpire
     };
     const message=`Your Otp for verifying account is:${otp}.This OTP IS Valid for 10 minutes`;
     try {
      await sendEmail({
        email,
        subject:'verify your account -OTP',
        message,

      })
      res.status(200).json({
        success:true,
        message:`OTP SEND TO ${email}`
      })
     } catch (error) {
          delete tempUserStore[email];
          return next(new ErrorHandler (error.message,500))
     }
  });
  app.post('/otp-verify', async (req, res, next) => {
    const { email, otp } = req.body;

    const tempUserData = tempUserStore[email];
    if (!tempUserData) {
        return next(new ErrorHandler('User not found or OTP expired', 404));
    }

    if (tempUserData.otpExpire < Date.now()) {
        delete tempUserStore[email];
        return next(new ErrorHandler('OTP has expired', 400));
    }

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    if (hashedOtp !== tempUserData.otp) {
        return next(new ErrorHandler('Invalid OTP', 400));
    }

    const user = await User.create({
        name: tempUserData.name,
        email: tempUserData.email,
        password: tempUserData.password,
       
        isVerified: true,
    });

    delete tempUserStore[email];
    sendToken(user, 200, res);
});
  app.post('/resend-otp', async (req, res, next) => {
    const { email } = req.body;

    const tempUserData = tempUserStore[email];
    if (!tempUserData) {
        return next(new ErrorHandler('User not found or OTP expired', 404));
    }

    if (tempUserData.resendAttempts && tempUserData.resendAttempts >= 3) {
        return next(new ErrorHandler('Resend limit exceeded', 429));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    tempUserData.otp = crypto.createHash('sha256').update(otp).digest('hex');
    tempUserData.otpExpire = Date.now() + 10 * 60 * 1000;
    tempUserData.resendAttempts = (tempUserData.resendAttempts || 0) + 1;

    tempUserStore[email] = tempUserData;

    const message = `Your OTP is ${otp}. It will expire in 10 minutes.`;

    await sendEmail({
        email,
        subject: 'Resend OTP',
        message,
    });

    res.status(200).json({
        success: true,
        message: 'OTP resent successfully',
    });
});
app.post('/login',async(req,res,next)=>{
  const{email,password}=req.body;
  if(!email || !password)
  {
    return next(new ErrorHandler('please enter email & password', 400));
 
  }
  const user =await User.findByCredentials(email,password);
  if(!user)
  {
    return next(new ErrorHandler('Invalid email or password', 401));

  }
  user.password=undefined;
  sendToken(user,200,res)
})
app.get('/logout',isAuthenticatedUser,async(req,res,next)=>{
  res.cookie('token',null,{
    expires:new Date(Date.now()),
    httpOnly:true,
  })
  .status(200)
  .json({
    success:true,
    message:"LoggedOut"
  })
})
app.get('/profile',isAuthenticatedUser,async(req,res)=>{
  const user=await User.findById(req.user.id)
  res.status(200).json({
    success:true,
    user
  })
})
// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
