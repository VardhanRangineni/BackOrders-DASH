import React from 'react';
import { Nav, Button } from 'react-bootstrap';

const Sidebar = ({ mode, activePage, onNavigate, onToggle }) => {
  const isCollapsed = mode === 'collapsed';

  const navItems = [
    {
      id: 'home',
      label: 'Home Overview',
      icon: (
        <svg style={{ width: '20px', height: '20px', minWidth: '20px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-5a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
      )
    },
    {
      id: 'web-order',
      label: 'Web Order Backlog',
      icon: (
        <svg style={{ width: '20px', height: '20px', minWidth: '20px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.5 9.5a1 1 0 100 2h7a1 1 0 100-2h-7z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      id: 'sourcing',
      label: 'Sourcing (TO/PO) View',
      icon: (
        <svg style={{ width: '20px', height: '20px', minWidth: '20px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-2V4H7v1H5V4zM5 7h10v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7zm2 1h1v8H7V8zm4 0h1v8h-1V8z"/>
        </svg>
      )
    },
    {
      id: 'reports',
      label: 'Report Scheduler',
      icon: (
        <svg style={{ width: '20px', height: '20px', minWidth: '20px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
        </svg>
      )
    }
  ];

  return (
    <aside className={`sidebar-bg ${mode}`}>
      {/* Burger Menu Toggle Button - Hidden on mobile (shown in header instead) */}
      <div className="sidebar-toggle-wrapper p-3 border-bottom border-secondary d-none d-md-block">
        <Button
          variant="link"
          onClick={onToggle}
          className="p-2 text-white border-0 d-flex align-items-center justify-content-center w-100"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            // Menu icon when collapsed
            <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            // Close/Minimize icon when expanded
            <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </Button>
      </div>

      <Nav className="flex-column p-3">
        <button
          onClick={(e) => { e.preventDefault(); onNavigate(navItems[0].id); }}
          className={`sidebar-link d-flex align-items-center rounded mb-2 ${
            activePage === navItems[0].id ? 'active' : ''
          }`}
          title={navItems[0].label}
        >
          {navItems[0].icon}
          {!isCollapsed && <span className="ms-2">{navItems[0].label}</span>}
        </button>

        {!isCollapsed && (
          <div className="pt-2 pb-2">
            <p className="px-3 text-uppercase small text-secondary mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              Tracking Views
            </p>
          </div>
        )}

        {navItems.slice(1, 3).map((item) => (
          <button
            key={item.id}
            onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
            className={`sidebar-link d-flex align-items-center rounded mb-2 ${
              activePage === item.id ? 'active' : ''
            }`}
            title={item.label}
          >
            {item.icon}
            {!isCollapsed && <span className="ms-2">{item.label}</span>}
          </button>
        ))}

        {!isCollapsed && (
          <div className="pt-2 pb-2">
            <p className="px-3 text-uppercase small text-secondary mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              Settings
            </p>
          </div>
        )}

        <button
          onClick={(e) => { e.preventDefault(); onNavigate('reports'); }}
          className={`sidebar-link d-flex align-items-center rounded mb-2 ${
            activePage === 'reports' ? 'active' : ''
          }`}
          title={navItems[3].label}
        >
          {navItems[3].icon}
          {!isCollapsed && <span className="ms-2">{navItems[3].label}</span>}
        </button>
      </Nav>
    </aside>
  );
};

export default Sidebar;
