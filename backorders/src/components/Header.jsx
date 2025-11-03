import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';

const Header = ({ onToggleSidebar }) => {
  return (
    <Navbar className="header-bg text-white shadow-sm">
      <Container fluid className="px-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          {/* Mobile burger menu button - only visible on mobile */}
          <Button
            variant="link"
            onClick={onToggleSidebar}
            className="p-2 text-white border-0 d-md-none me-2"
            style={{ minWidth: 'auto' }}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          
          <img
            src="https://www.medplusindia.com/images/medplus_logo.png"
            alt="MedPlus Logo"
            style={{ height: '32px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.12)' }}
          />
        </div>

        <Navbar.Brand className="text-white fw-bold mb-0">
          Back Order Fulfilment Dashboard
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default Header;
