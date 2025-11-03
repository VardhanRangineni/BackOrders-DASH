import React from 'react';
import { Modal as BootstrapModal, Button } from 'react-bootstrap';

const Modal = ({ isOpen, onClose, title, children, widthClass = 'modal-lg' }) => {
  return (
    <BootstrapModal show={isOpen} onHide={onClose} size={widthClass === 'sm:max-w-4xl' ? 'xl' : 'lg'} centered>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
              <svg className="text-primary" style={{ width: '24px', height: '24px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {title}
          </div>
        </BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        {children}
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </BootstrapModal.Footer>
    </BootstrapModal>
  );
};

export default Modal;
