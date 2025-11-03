import React from 'react';
import { Dropdown } from 'react-bootstrap';

const ActionDropdown = ({ orderId, actions, onActionSelect }) => {
  // If only one action, show as button
  if (actions.length === 1) {
    return (
      <button
        className="btn btn-link btn-sm p-0"
        onClick={() => onActionSelect(orderId, actions[0].value)}
      >
        {actions[0].label}
      </button>
    );
  }

  // If multiple actions, show as dropdown
  return (
    <Dropdown>
      <Dropdown.Toggle variant="link" size="sm" className="p-0 text-decoration-none">
        Actions
      </Dropdown.Toggle>

      <Dropdown.Menu>
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
