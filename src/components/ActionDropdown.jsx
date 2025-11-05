import React from 'react';
import { Dropdown } from 'react-bootstrap';

const ActionDropdown = ({ orderId, actions, onActionSelect, dropDirection = 'down' }) => {
  // Custom style for dropdown menu to allow scrolling if too tall
  const menuStyle = {
    maxHeight: '220px',
    overflowY: 'auto',
  };

  // Bootstrap icon mapping
  const getIcon = (value) => {
    const iconMap = {
      view: 'bi-eye',
      view_details: 'bi-eye',
      view_linked_to_po: 'bi-link-45deg',
      view_linked_web_order: 'bi-link-45deg',
      process_request: 'bi-pencil-square',
      process_remaining: 'bi-pencil-square',
      reject_reassign: 'bi-x-circle',
      manual_closure: 'bi-check-circle',
      market_purchase: 'bi-cart',
      create_manual_to: 'bi-plus-circle',
      mark_distributor_po: 'bi-truck',
      mark_unavailable: 'bi-x-square',
      trigger_recheck: 'bi-info-circle',
      add_remarks: 'bi-file-text',
      view_docs: 'bi-link-45deg',
      view_batch_log: 'bi-clipboard',
      view_web_order: 'bi-link-45deg',
      manual_recheck: 'bi-info-circle',
    };
    return iconMap[value] || '';
  };

  return (
    <Dropdown drop={dropDirection} container={document.body}>
      <Dropdown.Toggle variant="link" size="sm" className="p-0 text-decoration-none">
        Actions
      </Dropdown.Toggle>

      <Dropdown.Menu style={menuStyle}>
        {actions.map((action, index) => (
          <Dropdown.Item
            key={index}
            onClick={() => onActionSelect(orderId, action.value)}
            disabled={action.disabled}
          >
            <i className={`bi ${getIcon(action.value)} me-2`}></i>
            {action.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ActionDropdown;
