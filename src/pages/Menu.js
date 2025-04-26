import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../index.css';

function Menu() {
  return (
    <Navbar expand="md" className="custom-navbar" style={{ width: "350px", zIndex: '100', backgroundColor: '#ffffff', padding: '10px 20px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>
  <Navbar.Toggle aria-controls="basic-navbar-nav">
  </Navbar.Toggle>
  <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="d-flex" style={{ flexDirection: 'row' }}>
      <Nav.Link as={Link} to="/" style={{ color: 'black', fontWeight: 'bold', background: 'transparent', padding: '10px 20px' }}>Calculadora de pagos</Nav.Link>
      <Nav.Link as={Link} to="/DateCalc" style={{ color: 'black', fontWeight: 'bold', background: 'transparent', padding: '10px 20px' }}>Calculadora de fechas</Nav.Link>
    </Nav>
  </Navbar.Collapse>
</Navbar>

  );
}

export default Menu;
