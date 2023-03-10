import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Menu() {
  return (
    <Navbar expand="md" className="fixed-top" style={{ zIndex: '100' }}>
      <Navbar.Toggle aria-controls="basic-navbar-nav" >
      </Navbar.Toggle>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/" style={{color: 'black', fontWeight: 'bold', background: '#dcdcdc'}}>Calculadora de pagos</Nav.Link>
          <Nav.Link as={Link} to="/DateCalc" style={{color: 'black', fontWeight: 'bold', background: '#dcdcdc'}}>Calculadora de fechas</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Menu;
