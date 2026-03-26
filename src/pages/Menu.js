import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../index.css';

function Menu() {
  return (
    <Navbar 
      expand="md" 
      className="custom-navbar" 
      style={{
        width: "100%",
        zIndex: '100',
        backgroundColor: '#ffffff',
        padding: '16px 20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        borderBottom: '2px solid #10b981'
      }}
    >
      <Navbar.Brand style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginRight: '30px' }}>
        💼 Calculadora Pro
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto" style={{ display: 'flex', gap: '8px' }}>
          <Nav.Link 
            as={Link} 
            to="/" 
            style={{
              color: '#374151',
              fontWeight: '600',
              background: 'transparent',
              padding: '10px 20px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              fontSize: 'clamp(0.8rem, 2vw, 0.95rem)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f0fdf4';
              e.target.style.color = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#374151';
            }}
          >
            💰 Pagos
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/DateCalc" 
            style={{
              color: '#374151',
              fontWeight: '600',
              background: 'transparent',
              padding: '10px 20px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              fontSize: 'clamp(0.8rem, 2vw, 0.95rem)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f0fdf4';
              e.target.style.color = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#374151';
            }}
          >
            📅 Fechas
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/Simulator" 
            style={{
              color: '#374151',
              fontWeight: '600',
              background: 'transparent',
              padding: '10px 20px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              fontSize: 'clamp(0.8rem, 2vw, 0.95rem)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f0fdf4';
              e.target.style.color = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#374151';
            }}
          >
            🧾 Simulador
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Menu;
