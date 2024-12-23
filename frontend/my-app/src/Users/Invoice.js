import React, { useState, useEffect } from 'react';
import { Card } from 'reactstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable'
import axios from 'axios';
import Payment from '../Payment'
import {
    Container, Row, Col, FormGroup, Label, Input, Button, Table, Alert,
    CardBody
  } from 'reactstrap';
  import 'bootstrap/dist/css/bootstrap.min.css';
export default function Invoice()
{
    const [invoices, setInvoices] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editId,setEditId]=useState(null);
  const [editTitle,setEditTitle]=useState('')
  const [editDescription,setEditDescription]=useState('')
  const [editAmount,setEditAmount]=useState('')
  const [editDueDate,setEditDueDate]=useState('')

  const apiUrl = 'http://localhost:4500/invoices';
  const [billTo, setBillTo] = useState({ name: '', address: '', phone: '', gst: '' });
  const [shipTo, setShipTo] = useState({ name: '', address: '', phone: '', gst: '' });

  const [products, setProducts] = useState([]);
  const [productDetails,setProductDetails]=useState('')
  const[quantity,setQuantity]=useState('')
  const[unitPrice,setUnitPrice]=useState(0)
  const[gst,setGst]=useState(0.18)
  const [grandTotal,setGrandTotal]=useState(0)
  useEffect(() => {
    fetchInvoices();
   
  }, []);
  const fetchInvoices = async () => {
    try {
      const response = await axios.get(apiUrl);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };
  const handleEdit=(invoice)=>{
      setEditId(invoice._id)
      setEditTitle(invoice.title)
      setEditDescription(invoice.description);
      setEditAmount(invoice.amount.toString())
      setEditDueDate(invoice.dueDate)
  }
  const handleDelete=async(id)=>{
     if(window.confirm("are you sure want to delete"))
      try {
        await axios.delete(`${apiUrl}/${id}`);
        setInvoices(invoices.filter(invoice=>invoice._id!==id))
      } catch (error) {
        setError("unable to delete invoice")
      }
  }
  const handleUpdate=async()=>{
    setError('')
    setMessage('')
    const numericAmount=parseFloat(editAmount)
    if(editTitle.trim()&& editDescription.trim() && !isNaN(numericAmount) && editDueDate.trim()){
      try {
          const response=await axios.put(`${apiUrl}/${editId}`,{
            title:editTitle,
            description:editDescription,
            amount:numericAmount,
            dueDate:editDueDate
          });
          const updateInvoices=invoices.map(invoice=>invoice._id===editId?response.data:invoice)
          setInvoices(updateInvoices)
          setEditId(null);
          setEditTitle('');
          setEditDescription('');
          setEditAmount('')
          setEditDueDate('')
          setMessage("Invoice updated successfully")
      } catch (error) {
        setError("unable to update invoice")
      }
    }
  }
  const handleSubmit=async()=>{
    setError('');
    setMessage('');
    const numericAmount=parseFloat(amount)
    if(title.trim()&& description.trim() && !isNaN(numericAmount) && dueDate.trim()){
      try {
          const response=await axios.post(apiUrl,{
            title, 
            description,
            amount:numericAmount,
            dueDate
          });
       
          setInvoices([...invoices,response.data])
         
          setEditTitle('');
          setEditDescription('');
          setEditAmount('')
          setEditDueDate('')
          setMessage("Invoice updated successfully")
      } catch (error) {
        setError("unable to update invoice")
      }
    }
  }
  const addProduct = () => {
    if (productDetails.trim() && quantity > 0 && unitPrice > 0) {
      const total = quantity * unitPrice;
      const gstAmount = total * gst;
      setProducts([...products, { details: productDetails, quantity, unitPrice, total, gst: gstAmount }]);
      setProductDetails('');
      setQuantity(1);
      setUnitPrice(0);
    }
  };
const handleQuantityChange=(index,newQuantity)=>{
     const updatedProducts=[...products]
     const product=updatedProducts[index]
     product.quantity=newQuantity;
     product.total=newQuantity*product.unitPrice;
     product.gst=product.total*gst;
     setProducts(updatedProducts)

}
const handleRemoveProduct=(index)=>{
  const updatedProducts=products.filter((_,i)=>i!==index)
  setProducts(updatedProducts)
}
const calculateGrandToatl=()=>{
  return products.reduce((total,product)=>total+product.total+product.gst,0).toFixed(2);
}
useEffect(() => {
  setGrandTotal(calculateGrandToatl());
}, [products]);  // Only run when `products` changes

const handleDownloadPdf=()=>{
  const doc=new jsPDF();
  const backgroundColor=[240,240,240];
  const x=12;
  const y=13;
  const width=180;
  const height=110;
 doc.setFillColor(...backgroundColor);
 doc.rect(x,y,width,height,'F');
 doc.setDrawColor(0,0,0)
 doc.rect(x,y,width,height)
 doc.setFontSize(16)
 doc.text('INVOICE BILL TO:',14,20)
 doc.setFontSize(12)
 doc.text(`Name:${billTo.name}`,14,30)
 doc.text(`Address:${billTo.address}`,14,40)
 doc.text(`Phone Number:${billTo.phone}`,14,50)
 doc.text(`GST Number:${billTo.gst}`,14,60)
 doc.setFontSize(16)
 doc.text('SHIP BILL TO:',14,80)
 doc.setFontSize(12)
 doc.text(`Name:${shipTo.name}`,14,90)
 doc.text(`Address:${shipTo.address}`,14,100)
 doc.text(`Phone Number:${shipTo.phone}`,14,110)
 doc.text(`GST Number:${shipTo.gst}`,14,120)
const columns=[
  {header:'S.NO',dataKey:'serialNumber'},
  {header:'Product Details',dataKey:'details'},
  {header:'Quantity',dataKey:'quantity'},
  {header:'Unit Price',dataKey:'unitPrice'},
  {header:'Total',dataKey:'total'},
  {header:'GST',dataKey:'gst'},
];
const data=products.map((product,index)=>({
  serialNumber:index+1,
  details:product.details,
  quantity:product.quantity,
  unitPrice:`$${product.unitPrice.toFixed(2)}`,
  total:`$${product.total.toFixed(2)}`,
  gst:`$${product.gst.toFixed(2)}`
}));
doc.setFontSize(20);
doc.text('Product List:',14,140)
doc.autoTable({
  columns:columns,
  body:data,
  startY:160,
  margin:{top:10},
  styles:{fontSize:12},
  headStyles:{fillColor:[22,160,133]},
  theme:'striped',
 

})
doc.text(`Grand Total ()including GST):$${calculateGrandToatl()}`,14,doc.lastAutoTable.finalY+10)
doc.save('invoice.pdf')
}
    
    return(
        <div>
             <Container style={{border:'2px solid black',borderRadius:'10px',background:'E5C9C9'}}>
 <Row className="mt-5" >
        <Col>
        <Card >
          <h1 className="text-center">Invoice Generator</h1>
          </Card>
        </Col>
      </Row><br/><br/>
      <Row>
        <Col md={6}>
       <Card body inverse color="info">
          <Table bordered>
            <thead>
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '30px' }}>BILL TO :</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Buyer's Name</td>
                <td><Input type='text' value={billTo.name} onChange={(e) => setBillTo({ ...billTo, name: e.target.value })} /></td>
              </tr>
              <tr>
                <td>Address</td>
                <td><Input type="textarea" value={billTo.address} onChange={(e) => setBillTo({ ...billTo, address: e.target.value })} /></td>
              </tr>
              <tr>
                <td>Phone Number</td>
                <td><Input type='number' value={billTo.phone} onChange={(e) => setBillTo({ ...billTo, phone: e.target.value })} /></td>
              </tr>
              <tr>
                <td>GST Number</td>
                <td><Input value={billTo.gst} onChange={(e) => setBillTo({ ...billTo, gst: e.target.value })} /></td>
              </tr>
            </tbody>
          </Table>
          </Card>
        </Col>
        <Col md={6}>
        <Card body inverse color="danger">
          <Table bordered>
            <thead>
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '30px' }}>SHIP TO :</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Buyer's Name</td>
                <td><Input value={shipTo.name} onChange={(e) => setShipTo({ ...shipTo, name: e.target.value })} /></td>
              </tr>
              <tr>
                <td>Address</td>
                <td><Input type="textarea" value={shipTo.address} onChange={(e) => setShipTo({ ...shipTo, address: e.target.value })} /></td>
              </tr>
              <tr>
                <td>Phone Number</td>
                <td><Input type='number' value={shipTo.phone} onChange={(e) => setShipTo({ ...shipTo, phone: e.target.value })} /></td>
              </tr>
              <tr>
                <td>GST Number</td>
                <td><Input  /></td>
              </tr>
            </tbody>
          </Table>
          </Card>
        </Col>
      </Row><br/><br/>
       <Row className="mt-4">
        <Col md={12}>
        <Card body outline color="primary">
          <FormGroup>
            <h3>{editId ? 'Edit Invoice' : 'Add Invoice'}</h3>
            {message && <Alert color="success">{message}</Alert>}
            {error && <Alert color="danger">{error}</Alert>}
            <Label for="title">Title</Label>
            <Input
              type="text"
              id="title"
              placeholder="Title"
              value={editId ? editTitle : title}
              onChange={(e) => editId ? setEditTitle(e.target.value) : setTitle(e.target.value)}
            />
            <Label for="description" className="mt-2">Description</Label>
            <Input
              type="text"
              id="description"
              placeholder="Description"
              value={editId ? editDescription : description}
              onChange={(e) => editId ? setEditDescription(e.target.value) : setDescription(e.target.value)}
            />
            <Label for="amount" className="mt-2">Amount</Label>
            <Input
              type="number"
              id="amount"
              placeholder="Amount"
              value={editId ? editAmount : amount}
              onChange={(e) => editId ? setEditAmount(e.target.value) : setAmount(e.target.value)}
            />
            <Label for="dueDate" className="mt-2">Due Date</Label>
            <Input
              type="date"
              id="dueDate"
              placeholder="Due Date"
              value={editId ? editDueDate : dueDate}
              onChange={(e) => editId ? setEditDueDate(e.target.value) : setDueDate(e.target.value)}
            />
            {editId ? (
              <div className="mt-3">
                <Button color="primary" onClick={handleUpdate}>Update</Button>{' '} 
                <Button color="secondary"  className="ml-2">Cancel</Button>
              </div>
            ) : (
              <Button color="success" onClick={handleSubmit} className="mt-3">Submit</Button>
            )}
          </FormGroup>
          </Card>
        </Col>
      </Row><br/><br/>
      <Row className="mt-4">
        <Col>
        <Card body  color='light'> 
          <h3>Invoices</h3>
          <Table striped>
            <thead>
              <tr>
                <th>S.NO</th>
                <th>Title</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={invoice._id}>
                  <td>{index + 1}</td>
                  <td>{invoice.title}</td>
                  <td>{invoice.description}</td>
                  <td>${invoice.amount}</td>
                  <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td>
                    <Button color="warning" onClick={() => handleEdit(invoice)} className="mr-3">Edit</Button>{' '}
                    <Button color="danger" onClick={() => handleDelete(invoice._id)} className="mr-3">Delete</Button>{' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          </Card>
        </Col>
      </Row><br/><br/>
      <Row>
        <Col md={4}>
        <Card body  color='light'>
          <FormGroup>
            <h3>Add Product</h3>
            <Label for="productDetails">Product Details</Label>
            <Input
              type="text"
              id="productDetails"
              placeholder="Product Details"
              value={productDetails}
              onChange={(e)=>setProductDetails(e.target.value)}
            />
            <Label for="quantity" className="mt-2">Quantity</Label>
            <Input
              type="number"
              id="quantity"
              placeholder="Quantity"
              value={quantity}
              onChange={(e)=>setQuantity (Number(e.target.value))}
            />
            <Label for="unitPrice" className="mt-2">Unit Price</Label>
            <Input
              type="number"
              id="unitPrice"
              placeholder="Unit Price"
             value={unitPrice}
             onChange={(e)=>setUnitPrice(Number(e.target.value))}
            />
            <Button color="primary"  className="mt-3" onClick={addProduct}>Add Product</Button>
          </FormGroup>
          </Card>
        </Col>
        <Col md={8}>
        <Card body  color='light'>
          <Table striped>
            <thead>
              <tr>
                <th>S.NO</th>
                <th>Product Details</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>GST</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{product.details}</td>
                  <td>
                    <Input
                      type="number"
                      value={product.quantity}
                      onChange={(e)=>handleQuantityChange(index,Number(e.target.value))}
                      min="1"
                    /> 
                  </td>
                  <td>${product.unitPrice.toFixed(2)}</td>
                  <td>${product.total.toFixed(2)}</td>
                  <td>${product.gst.toFixed(2)}</td>
                  <td>
                    <Button color="danger"  onClick={()=>handleRemoveProduct(index)} >Remove</Button>
                  </td>
                </tr>
              ))}     
              <tr>
                <td colSpan="5" className="text-right">Grand Total (including GST)</td>
                <td>${grandTotal}</td>
                <td></td>
              </tr>
            </tbody> 
          </Table> 
          </Card>
          <Button color="primary"  className="mt-3" onClick={handleDownloadPdf}>Download Products PDF</Button>
          <Payment totalAmount={grandTotal} setGrandTotal={setGrandTotal}/>
        </Col>
      </Row><br/><br/>  
      </Container>
        </div>
    )
}