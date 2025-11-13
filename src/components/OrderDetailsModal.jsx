import React, { useState } from 'react';
import { Badge, Modal, Button, Form } from 'react-bootstrap';
import { getStatusBadgeClass } from '../utils/utils';

const OrderDetailsModal = ({ order, onProductAction }) => {
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [closureReason, setClosureReason] = useState('Product not available in market');
  const [otherReason, setOtherReason] = useState('');

  const handleAction = (productId, action, product) => {
    if (action === 'manual_closure') {
      setCurrentProduct(product);
      setShowClosureModal(true);
    } else if (onProductAction) {
      onProductAction(productId, action);
    }
  };

  const handleConfirmClosure = () => {
    if (closureReason === 'Other' && !otherReason.trim()) {
      alert('Please provide a reason for closure');
      return;
    }

    const finalReason = closureReason === 'Other' ? otherReason : closureReason;
    
    if (onProductAction && currentProduct) {
      onProductAction(currentProduct.lineId || currentProduct.id, 'manual_closure', finalReason);
    }

    // Reset modal state
    setShowClosureModal(false);
    setCurrentProduct(null);
    setClosureReason('Product not available in market');
    setOtherReason('');
  };

  const getProductActions = (item) => {
    const actions = [];

    // Always show View Linked TO/PO if available
    if (item.linkedDocs && item.linkedDocs.length > 0) {
      actions.push({ value: 'view_linked_to_po', label: 'View Linked TO/PO', icon: 'bi-link-45deg' });
    }

    // Only show Raise Market Purchase for specific partially fulfilled states
    const partiallyFulfilledStatuses = [
      'partially fulfilled',
      'partially fulfilled internally',
      'partially fulfilled from GRN',
      'partially fulfilled from market',
      'partially filfilled',
      'partially filfilled internally',
      'partially filfilled from GRN',
      'partially filfilled from market'
    ];
    if (item.status && partiallyFulfilledStatuses.map(s => s.toLowerCase()).includes(item.status.toLowerCase())) {
      actions.push({ value: 'raise_market_purchase', label: 'Raise Market Purchase', icon: 'bi-cart-plus' });
    }

    // Manual Closure option only for Market Purchase products
    if (item.status === 'Market Purchase Initiated' || item.status === 'NA in Market') {
      actions.push({ value: 'manual_closure', label: 'Manual Closure', icon: 'bi-x-circle' });
    }

    return actions;
  };

  return (
    <div>
      {/* Order Header Info */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6">
          <div className="text-muted small">Customer</div>
          <div className="fw-medium">{order.customer || '-'}</div>
        </div>
        <div className="col-sm-6">
          <div className="text-muted small">Order Status</div>
          <div>
            <Badge bg="" className={getStatusBadgeClass(order.status)}>
              {order.status || 'Unknown'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Remarks if present */}
      {order.remarks && (
        <div className="mb-3">
          <div className="fw-medium text-secondary mb-1">Remarks / Reason</div>
          <div className="alert alert-info mb-0">{order.remarks}</div>
        </div>
      )}

      {/* Products Table */}
      {order.items && order.items.length > 0 ? (
        <div className="mb-3">
          <div className="fw-medium text-secondary mb-2">
            Products ({order.items.length} item{order.items.length > 1 ? 's' : ''})
          </div>
          <div className="table-responsive" style={{ maxHeight: '400px', overflowX: 'auto', overflowY: 'auto' }}>
            <table className="table table-sm table-bordered mb-0" style={{ minWidth: '1000px' }}>
              <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th>Product Id</th>
                  <th>Product Name</th>
                  <th>Required Quantity</th>
                  <th>Fulfilled Quantity</th>
                  <th>Pending Quantity</th>
                  <th>Current Status</th>
                  <th>Source Type</th>
                  <th>Retries</th>
                  <th style={{ minWidth: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <React.Fragment key={item.lineId || item.id || idx}>
                    <tr>
                      <td>{item.sku || '-'}</td>
                      <td>{item.product || '-'}</td>
                      <td>{item.qty || 0}</td>
                      <td>{item.qtyFulfilled || 0}</td>
                      <td>{item.qtyPending || 0}</td>
                      <td>
                        <Badge bg="" className={getStatusBadgeClass(item.status)}>
                          {item.status || 'Unknown'}
                        </Badge>
                      </td>
                      <td>
                        {item.sourceType ? (
                          <span>
                            <Badge bg={item.sourceType === 'Store' ? 'primary' : item.sourceType === 'Distributor' ? 'success' : 'secondary'}>
                              {item.sourceType}
                            </Badge>
                            {item.source && <span className="ms-1 small text-muted">{item.source}</span>}
                          </span>
                        ) : (
                          <span className="text-muted">{item.source || '-'}</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={(item.retries || 0) >= 4 ? 'danger' : (item.retries || 0) >= 2 ? 'warning' : 'secondary'}>
                          {item.retries || 0}/4
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {getProductActions(item).map((action) => (
                            <button
                              key={`${item.lineId || item.id}-${action.value}`}
                              className="btn btn-sm btn-outline-secondary p-1"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAction(item.lineId || item.id, action.value, item);
                              }}
                              style={{ width: '30px', height: '30px' }}
                              type="button"
                              title={action.label}
                            >
                              <i className={`bi ${action.icon}`}></i>
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                    {item.remarks && (
                      <tr>
                        <td colSpan="9" className="bg-light">
                          <small className="text-muted">
                            <strong>History:</strong>
                            <pre className="mb-0 mt-1" style={{ fontSize: '0.85em', whiteSpace: 'pre-wrap' }}>{item.remarks}</pre>
                          </small>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (

        <div className="mb-3">
          <div className="fw-medium text-secondary mb-2">Product Details</div>
          <div className="row g-2">
            <div className="col-sm-6">
              <div className="text-muted small">Product</div>
              <div>{order.product || '-'}</div>
            </div>
            <div className="col-sm-6">
              <div className="text-muted small">SKU</div>
              <div>{order.sku || '-'}</div>
            </div>
            <div className="col-sm-4">
              <div className="text-muted small">Qty Requested</div>
              <div>{order.qty || 0}</div>
            </div>
            <div className="col-sm-4">
              <div className="text-muted small">Qty Fulfilled</div>
              <div>{order.qtyFulfilled || 0}</div>
            </div>
            <div className="col-sm-4">
              <div className="text-muted small">Qty Pending</div>
              <div>{order.qtyPending || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Order Metadata */}
      <div className="mb-3">
        <div className="fw-medium text-secondary mb-2">Order Information</div>
        <div className="row g-2">
          <div className="col-sm-4">
            <div className="text-muted small">Created</div>
            <div>{order.created || '-'}</div>
          </div>
          <div className="col-sm-4">
            <div className="text-muted small">Last Updated</div>
            <div>{order.lastUpdated || '-'}</div>
          </div>
          <div className="col-sm-4">
            <div className="text-muted small">Age (Days)</div>
            <div>{order.age || 0}</div>
          </div>
          <div className="col-sm-4">
            <div className="text-muted small">Source</div>
            <div>{order.source || '-'}</div>
          </div>
          <div className="col-sm-4">
            <div className="text-muted small">Linked Doc</div>
            <div>{order.linkedDoc || '-'}</div>
          </div>
          <div className="col-sm-4">
            <div className="text-muted small">Retry Count</div>
            <div>
              <Badge bg={order.retry > 0 ? 'warning' : 'secondary'}>
                {order.retry || 0}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Closure Modal */}
      <Modal show={showClosureModal} onHide={() => setShowClosureModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Manual Closure</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Close product: <strong>{currentProduct?.product || currentProduct?.sku}</strong>
          </p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Reason for Closure</Form.Label>
              <Form.Select 
                value={closureReason}
                onChange={(e) => {
                  setClosureReason(e.target.value);
                  if (e.target.value !== 'Other') {
                    setOtherReason('');
                  }
                }}
              >
                <option value="Product not available in market">Product not available in market</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            {closureReason === 'Other' && (
              <Form.Group className="mb-3">
                <Form.Label>Please specify reason</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Enter reason for manual closure..."
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClosureModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmClosure}>
            Close Order
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderDetailsModal;
