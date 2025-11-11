import React from 'react';
import { Badge } from 'react-bootstrap';
import { getStatusBadgeClass } from '../utils/utils';

const OrderDetailsModal = ({ order, onProductAction }) => {
  const handleAction = (productId, action) => {
    if (onProductAction) {
      onProductAction(productId, action);
    }
  };

  const getProductActions = (item) => {
    const actions = [];

    // Always show View Linked TO/PO if available
    if (item.linkedDocs && item.linkedDocs.length > 0) {
      actions.push({ value: 'view_linked_to_po', label: 'View Linked TO/PO', icon: 'bi-link-45deg' });
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
                                handleAction(item.lineId || item.id, action.value);
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
    </div>
  );
};

export default OrderDetailsModal;
