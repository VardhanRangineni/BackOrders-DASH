import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';
import Toast from './components/Toast';
import HomeOverview from './pages/HomeOverview';
import WebOrderBacklog from './pages/WebOrderBacklog';
import SourcingView from './pages/SourcingView';
import ReportScheduler from './pages/ReportScheduler';
import { webOrders as initialWebOrders, sourcingOrders as initialSourcingOrders } from './data/mockData';
import './App.css';

function App() {
  // Initialize sidebar as collapsed by default
  const [sidebarMode, setSidebarMode] = useState('collapsed');
  const [activePage, setActivePage] = useState('home');
  const [webOrders, setWebOrders] = useState(initialWebOrders);
  const [sourcingOrders, setSourcingOrders] = useState(initialSourcingOrders);
  const [highlightedWebOrder, setHighlightedWebOrder] = useState(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalWidth, setModalWidth] = useState('sm:max-w-2xl');
  
  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);

  const handleToggleSidebar = () => {
    if (sidebarMode === 'expanded') {
      setSidebarMode('collapsed');
    } else {
      setSidebarMode('expanded');
    }
  };

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      setSidebarMode('collapsed');
    }
  };

  const handleOpenModal = (title, content, width = 'sm:max-w-2xl') => {
    setModalTitle(title);
    setModalContent(content);
    setModalWidth(width);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleShowToast = (message, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setToastVisible(true);
  };

  const handleHideToast = () => {
    setToastVisible(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomeOverview webOrders={webOrders} sourcingOrders={sourcingOrders} />;
      case 'web-order':
        return (
          <WebOrderBacklog
            webOrders={webOrders}
            setWebOrders={setWebOrders}
            onShowToast={handleShowToast}
            onOpenModal={handleOpenModal}
            highlightedWebOrder={highlightedWebOrder}
            setHighlightedWebOrder={setHighlightedWebOrder}
          />
        );
      case 'sourcing':
        return (
          <SourcingView
            sourcingOrders={sourcingOrders}
            setSourcingOrders={setSourcingOrders}
            onShowToast={handleShowToast}
            onOpenModal={handleOpenModal}
            onNavigate={handleNavigate}
            setHighlightedWebOrder={setHighlightedWebOrder}
          />
        );
      case 'reports':
        return (
          <ReportScheduler
            onShowToast={handleShowToast}
            onOpenModal={handleOpenModal}
          />
        );
      default:
        return <HomeOverview webOrders={webOrders} sourcingOrders={sourcingOrders} />;
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header onToggleSidebar={handleToggleSidebar} />
      
      <div className="d-flex flex-grow-1">
        <Sidebar 
          mode={sidebarMode} 
          activePage={activePage} 
          onNavigate={handleNavigate}
          onToggle={handleToggleSidebar}
        />
        
        {/* Mobile overlay - closes sidebar when clicked */}
        {sidebarMode === 'expanded' && (
          <div 
            className="mobile-overlay d-md-none"
            onClick={() => setSidebarMode('collapsed')}
          />
        )}
        
        <main className={`main-content ${sidebarMode === 'expanded' ? '' : sidebarMode === 'collapsed' ? 'sidebar-collapsed' : 'expanded'}`}>
          {renderPage()}
        </main>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        widthClass={modalWidth}
      >
        <div dangerouslySetInnerHTML={{ __html: modalContent }} />
      </Modal>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        isError={toastError}
        onHide={handleHideToast}
      />
    </div>
  );
}

export default App;
