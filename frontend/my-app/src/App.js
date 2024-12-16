import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import {
  Container, Row, Col, FormGroup, Label, Input, Button, Table, Alert,
  CardBody
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import store from './store'
import Header from './Header';
import Register from './Users/Register';
import Login from './Users/Login';
import OtpVerification from './Users/OtpVerification';
import Invoice from './Users/Invoice';
import { loadUser } from './actions/userActions';
function App() {
   useEffect(()=>{
     store.dispatch(loadUser())
   },[])

 
 
 return(
    <div className="App">
  <BrowserRouter>
       <Container style={{border:'2px solid black',borderRadius:'10px',background:'E5C9C9'}}>
    <Header/>
    <Routes>
    <Route path='/register' element={<Register/>} />
    <Route path='/login' element={<Login/>} />
    <Route path='/verify-otp' element={<OtpVerification/>} />
    <Route path='/invoices' element={<Invoice/>} />
    </Routes>
      
      </Container>
      </BrowserRouter>
    </div>
  );
}

export default App;
