import React, { useEffect } from 'react';
import { Toast as BootstrapToast, ToastContainer } from 'react-bootstrap';

const Toast = ({ message, isVisible, isError = false, onHide }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  return (
    <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
      <BootstrapToast show={isVisible} onClose={onHide} bg={isError ? 'danger' : 'dark'} delay={3000} autohide>
        <BootstrapToast.Body className="text-white">
          {message}
        </BootstrapToast.Body>
      </BootstrapToast>
    </ToastContainer>
  );
};

export default Toast;
