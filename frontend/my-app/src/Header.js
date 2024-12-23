import React, { useState } from "react";
import {
  Nav,
  Navbar,
  NavbarToggler,
  Collapse,
  NavItem,
  NavLink,
  NavbarBrand,
  Container,
} from "reactstrap";
import { Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { Dropdown, Image } from "react-bootstrap";
import { logoutUser } from "./actions/userActions";
import { toast } from "react-toastify";

function Header() {
  const { isAuthenticated, user } = useSelector((state) => state.authState);
 
  const [nav1, setNav] = useState(false);
  const Navtoggle = () => setNav(!nav1);
  const dispatch = useDispatch();

  const logoutHandler = () => {
    dispatch(logoutUser());
    toast('Logged Out Successfully!', {
      type: 'success',
      position: 'bottom-center',
    });
  };

  return (
    <div>
      <Container fluid>
        <Navbar color="light" light expand="lg">
          <NavbarBrand>
            <Link style={{textDecoration:"none",color:"black"}} to="/">
             Electric & Tech World
            </Link>
          </NavbarBrand>
          <NavbarToggler onClick={Navtoggle} />
          <Collapse isOpen={nav1} navbar>
            <Nav className="navbar-nav" navbar>
              
             
            </Nav>

            {/* Right-aligned elements */}
            <Nav className="navbar-nav-right" navbar>
               <NavItem>
                <NavLink>
                <Link to="/invoices" className="btn" id="login_btn">
                      invoices
                    </Link>
                </NavLink>
               </NavItem>
              <NavItem>
                <NavLink>
                  {isAuthenticated && user ? (
                    <Dropdown className="d-inline">
                      <Dropdown.Toggle variant="default text-black pr-5" id="dropdown-basic">
                       
                        <span>{user.name}</span>
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        
                       
                      
                        <Dropdown.Item onClick={logoutHandler} className="text-danger">
                          Logout
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : (
                    <Link to="/login" className="btn" id="login_btn">
                      Login
                    </Link>
                  )}
                </NavLink>
              </NavItem>
             
            </Nav>
          </Collapse>
        </Navbar>
        <br />
      </Container>
    </div>
  );
}

export default Header;
