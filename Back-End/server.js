const express =require('express');
const { default: mongoose } = require('mongoose');
const app=express();
const cors=require('cors')
app.use(cors())
app.use(express.json());
const port=4500
mongoose.connect('mongodb://localhost:27017/Invoice-generator')
.then(()=>{
    console.log("MONGO DB IS CONNECTED")
})
const invoiceSchema=new mongoose.Schema({
    title:{
        required:true,
        type:String
    },
    description:{
        type:String
    },
    amount:{
        required:true,
        type:Number
    },
    dueDate:{
        required:true,
        type:Date
    }
})
const invoiceModel=mongoose.model('Invoice-generator',invoiceSchema)
app.post('/invoices',async(req,res)=>{
      const {title,description,amount,dueDate}=req.body;
      try {
          const newInvoice=new invoiceModel({title,description,amount,dueDate});
          await newInvoice.save()
          res.status(201).json(newInvoice)
      } catch (error) {
        console.log(error)
        res.status(500).json({message:error.message})
      }
})
app.get('/invoices' ,async(req,res)=>{
    try {
         const invoices=await invoiceModel.find();
         res.json(invoices);

    } catch (error) {
        console.log(error);
        res.status(500).json({message:error.message})
    }
})

app.put('/invoices/:id',async(req,res)=>{
    const {title,description,amount,dueDate}=req.body;
    const id=req.params.id;

    try {
         const invoices=await invoiceModel.findByIdAndUpdate(id,
            {title,description,amount,dueDate},{new:true}
         );
         res.json(invoices);

    } catch (error) {
        console.log(error);
        res.status(500).json({message:error.message})
    }
})
app.delete('/invoices/:id',async(req,res)=>{
    const id=req.params.id;

    try {
         await invoiceModel.findByIdAndDelete(id);
         res.status(200).json({ message: 'Invoice deleted successfully' }).end();

    } catch (error) {
        console.log(error);
        res.status(500).json({message:error.message})
    }
})
app.listen(port,()=>{
    console.log(`Server is on port ${port}`)
})