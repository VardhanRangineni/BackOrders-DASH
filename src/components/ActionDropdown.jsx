import React from 'react';
import { Dropdown } from 'react-bootstrap';

const ActionDropdown = ({ orderId, actions, onActionSelect, dropDirection = 'down' }) => {
  // Custom style for dropdown menu to allow scrolling if too tall
  const menuStyle = {
    maxHeight: '220px',
    overflowY: 'auto',
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
            {action.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ActionDropdown;
