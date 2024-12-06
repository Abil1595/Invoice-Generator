const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 4500; // Use PORT from env or default to 4500

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/Invoice-generator')
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
  

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
