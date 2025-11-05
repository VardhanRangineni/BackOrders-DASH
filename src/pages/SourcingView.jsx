import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Col, Card, Form, Button, Table, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { exportToCSV, getStatusBadgeClass } from '../utils/utils';
import ActionDropdown from '../components/ActionDropdown';

const SourcingView = ({ sourcingOrders, setSourcingOrders, onShowToast, onOpenModal, onNavigate, setHighlightedWebOrder, initialFilters = {}, clearFilters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('All');
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartModalData] = useState({ title: '', content: null });
  const [showRetryOnly, setShowRetryOnly] = useState(false);
  const [showMarketPurchaseOnly, setShowMarketPurchaseOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const tableRef = useRef(null);

  // Apply initial filters when component mounts or filters change
  useEffect(() => {
    if (initialFilters.showRetryOnly || initialFilters.typeFilter || initialFilters.statusFilter || initialFilters.marketPurchaseOnly) {
      if (initialFilters.showRetryOnly) setShowRetryOnly(true);
      if (initialFilters.typeFilter) setTypeFilter(initialFilters.typeFilter);
      if (initialFilters.statusFilter) setStatusFilter(initialFilters.statusFilter);
      if (initialFilters.marketPurchaseOnly) setShowMarketPurchaseOnly(true);
      
      // Clear the filter after applying
      if (clearFilters) clearFilters();
      
      // Scroll to table after a brief delay to allow render
      setTimeout(() => {
        if (tableRef.current) {
          tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [initialFilters, clearFilters]);

  // Define handleViewWebOrder with useCallback so it's stable for useEffect
  const handleViewWebOrder = useCallback((webOrderId) => {
    setHighlightedWebOrder(webOrderId);
    onNavigate('web-order');
    onShowToast(`Navigating to Web Order: ${webOrderId}`);
  }, [setHighlightedWebOrder, onNavigate, onShowToast]);

  // Set up global handler for modal links
  useEffect(() => {
    window.handleViewWebOrderFromModal = handleViewWebOrder;
    window.openModalFromLine = (title, content, width) => {
      onOpenModal(title, content, width);
    };
    
    return () => {
      delete window.handleViewWebOrderFromModal;
      delete window.openModalFromLine;
    };
  }, [handleViewWebOrder, onOpenModal]);

  // Filter orders
  const filteredOrders = sourcingOrders.filter(order => {
    const orderDate = new Date(order.created);
    
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      order.id.toLowerCase().includes(searchLower) || 
      order.docId.toLowerCase().includes(searchLower) || 
      order.webOrder.toLowerCase().includes(searchLower) ||
      order.source?.toLowerCase().includes(searchLower) ||
      order.destination?.toLowerCase().includes(searchLower) ||
      (order.items && order.items.some(item => 
        item.product?.toLowerCase().includes(searchLower) ||
        item.sku?.toLowerCase().includes(searchLower)
      ));
    
    const matchesType = (typeFilter === 'All' || order.type === typeFilter);
    const matchesStatus = (statusFilter === 'All' || order.status === statusFilter);
    const matchesBatch = (batchFilter === '' || order.batchId.toLowerCase().includes(batchFilter.toLowerCase()));
    
    // SKU filter - check items array
    const matchesSku = (skuFilter === '' || (order.items && order.items.some(item => 
      item.sku?.toLowerCase().includes(skuFilter.toLowerCase())
    )));
    
    // Source type filter (Store vs Distributor)
    const matchesSourceType = (sourceTypeFilter === 'All' || 
      (sourceTypeFilter === 'Store' && order.type === 'TO') ||
      (sourceTypeFilter === 'Distributor' && order.type === 'PO'));
    
    // Date range filter
    let matchesDateRange = true;
    if (startDateFilter) {
      const startDate = new Date(startDateFilter);
      matchesDateRange = matchesDateRange && orderDate >= startDate;
    }
    if (endDateFilter) {
      const endDate = new Date(endDateFilter);
      endDate.setHours(23, 59, 59, 999);
      matchesDateRange = matchesDateRange && orderDate <= endDate;
    }
    
    // Retry filter
    const matchesRetry = !showRetryOnly || order.retry > 0;
    
    // Market Purchase filter
    const matchesMarketPurchase = !showMarketPurchaseOnly || order.marketPurchase === true;
    
    return matchesSearch && matchesType && matchesStatus && matchesDateRange && matchesBatch && matchesSku && matchesSourceType && matchesRetry && matchesMarketPurchase;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setStatusFilter('All');
    setStartDateFilter('');
    setEndDateFilter('');
    setBatchFilter('');
    setSkuFilter('');
    setSourceTypeFilter('All');
    setShowRetryOnly(false);
    setShowMarketPurchaseOnly(false);
  };

  const handleDownload = () => {
    // Flatten orders to include product line items
    const exportData = [];
    
    filteredOrders.forEach(order => {
      if (order.items && order.items.length > 0) {
        // Export each product line item as a separate row
        order.items.forEach(item => {
          exportData.push({
            id: order.id,
            type: order.type,
            docId: order.docId,
            webOrder: order.webOrder,
            batchId: order.batchId,
            source: order.source,
            destination: order.destination,
            status: order.status,
            lineId: item.lineId,
            product: item.product,
            sku: item.sku,
            qtyReq: item.qtyReq,
            qtyFulfilled: item.qtyFulfilled,
            qtyPending: item.qtyReq - item.qtyFulfilled,
            itemStatus: item.status,
            itemRemarks: item.remarks || '',
            retry: order.retry,
            created: order.created,
            createdBy: order.createdBy,
            lastActionedBy: order.lastActionedBy,
            remarks: order.remarks
          });
        });
      } else {
        // Export order without line items
        exportData.push({
          id: order.id,
          type: order.type,
          docId: order.docId,
          webOrder: order.webOrder,
          batchId: order.batchId,
          source: order.source,
          destination: order.destination,
          status: order.status,
          lineId: '',
          product: '',
          sku: '',
          qtyReq: order.qtyReq,
          qtyFulfilled: order.qtyFulfilled,
          qtyPending: order.qtyReq - order.qtyFulfilled,
          itemStatus: '',
          itemRemarks: '',
          retry: order.retry,
          created: order.created,
          createdBy: order.createdBy,
          lastActionedBy: order.lastActionedBy,
          remarks: order.remarks
        });
      }
    });
    
    const headers = {
      id: 'Draft ID', type: 'Type', docId: 'TO/PO ID', webOrder: 'Web Order', 
      batchId: 'Batch ID', source: 'Source', destination: 'Destination', 
      status: 'Order Status', lineId: 'Line ID', product: 'Product', sku: 'SKU',
      qtyReq: 'Qty Req.', qtyFulfilled: 'Qty Fulfilled', qtyPending: 'Qty Pending',
      itemStatus: 'Item Status', itemRemarks: 'Item Remarks',
      retry: 'Retry', created: 'Created', createdBy: 'Created By', 
      lastActionedBy: 'Last Actioned', remarks: 'Order Remarks'
    };
    
    exportToCSV(exportData, headers, 'sourcing_export.csv');
    onShowToast(`Exported ${exportData.length} product line items from ${filteredOrders.length} orders to sourcing_export.csv`);
  };

  const handleViewDetails = (order) => {
    const qtyPending = order.qtyReq - order.qtyFulfilled;
    
    let content;
    if (order.items && order.items.length > 0) {
      content = <ProductLineItemsTable items={order.items} />;
    } else {
      content = (
        <div className="mb-3">
          <div className="fw-medium text-secondary mb-2">Product Details</div>
          <div className="row g-2">
            <div className="col-sm-6"><div className="text-muted small">Product</div><div>{order.product || '-'}</div></div>
            <div className="col-sm-6"><div className="text-muted small">SKU</div><div>{order.sku || '-'}</div></div>
            <div className="col-sm-4"><div className="text-muted small">Qty Requested</div><div>{order.qtyReq || 0}</div></div>
            <div className="col-sm-4"><div className="text-muted small">Qty Fulfilled</div><div>{order.qtyFulfilled || 0}</div></div>
            <div className="col-sm-4"><div className="text-muted small">Qty Pending</div><div>{qtyPending}</div></div>
          </div>
        </div>
      );
    }
    onOpenModal(`Sourcing Details: ${order.id}`, content, 'modal-xl');
  };

  const handleViewBatchLog = (batchId) => {
    onOpenModal('Scheduler Batch Log', `
      <div class="alert alert-info">
        <strong>Batch ID:</strong> ${batchId}
        <br><br>
        <strong>Batch Details:</strong>
        <ul class="mb-0 mt-2">
          <li>Scheduler Run Time: 2024-01-15 08:00:00</li>
          <li>Total Orders in Batch: 12</li>
          <li>TOs Created: 8</li>
          <li>POs Created: 4</li>
          <li>Status: Completed</li>
        </ul>
      </div>
    `, 'modal-lg');
    onShowToast(`Viewing Batch Log: ${batchId}`);
  };

  const handleManualRecheck = (orderId) => {
    onOpenModal('Manual Recheck', `
      <div class="alert alert-warning">
        <strong>Trigger Manual Recheck for ${orderId}?</strong>
        <br><br>
        This will re-evaluate stock availability and attempt to create a new TO/PO.
        <br><br>
        <em>Admin-only action. Backend integration required.</em>
      </div>
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-primary" onclick="alert('Recheck triggered')">Confirm Recheck</button>
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      </div>
    `, 'modal-md');
  };

  const handleAddRemarks = (order) => {
    onOpenModal('Add Remarks', `
      <div class="mb-3">
        <label class="form-label fw-medium">Add Remarks for ${order.id}</label>
        <textarea class="form-control" rows="4" placeholder="Enter remarks or reason for exception..."></textarea>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary" onclick="alert('Remarks saved')">Save Remarks</button>
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      </div>
    `, 'modal-md');
  };

  // Get available actions based on TO/PO status - Sourcing Level
  const getOrderActions = (order) => {
    const status = order.status;
    const actions = [];

    // Always show View Details first
    actions.push({ label: 'View Details', value: 'view' });
    
    // View linked web order summary
    actions.push({ label: 'View Linked Web Order', value: 'view_web_order' });
    
    // View scheduler batch log for retry audit and traceability
    actions.push({ label: 'View Batch Log', value: 'view_batch_log' });
    
    // Status-specific actions based on TO/PO-Level Tracking Dashboard requirements
    if (status === 'Draft' || status === 'Rejected') {
      // Draft or Rejected TO/PO can be manually rechecked (admin users)
      actions.push({ label: 'Trigger Manual Recheck', value: 'manual_recheck' });
    }
    
    if (status === 'Accepted' || status === 'Partial') {
      // Accepted/Partial orders in progress - no additional actions needed
      // Only view-related options available (already added above)
    }
    
    // Add remarks for exception records - available for all statuses for audit trail
    actions.push({ label: 'Add Remarks / Notes', value: 'add_remarks' });
    
    return actions;
  };

  const handleActionSelect = (orderId, action) => {
    const order = sourcingOrders.find(o => o.id === orderId);
    
    switch (action) {
      case 'view':
        handleViewDetails(order);
        break;
      case 'view_web_order':
        handleViewWebOrder(order.webOrder);
        break;
      case 'view_batch_log':
        handleViewBatchLog(order.batchId);
        break;
      case 'manual_recheck':
        handleManualRecheck(order.id);
        break;
      case 'add_remarks':
        handleAddRemarks(order);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <h2 className="mb-4 fw-bold">TO/PO-Level Tracking Dashboard</h2>
      <p className="text-secondary mb-4">
        Real-time view of all Transfer Orders (TO), Purchase Orders (PO), and Market Purchase orders with complete traceability, fulfilment progress, and retry audit. 
        Products not available in warehouse, stores, or distributors are automatically escalated to market purchase.
      </p>

      {/* Table */}
      <Card>
        <Card.Body>
          {/* Filter Toggle Button */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="d-flex align-items-center gap-2"
            >
              <i className={`bi bi-funnel${showFilters ? '-fill' : ''}`}></i>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              <i className={`bi bi-chevron-${showFilters ? 'up' : 'down'}`}></i>
            </Button>
            <div className="d-flex align-items-center gap-2">
              <div className="text-muted small">
                Showing {filteredOrders.length} of {sourcingOrders.length} records
              </div>
              <Button variant="success" onClick={handleDownload} size="sm">
                <i className="bi bi-download me-2"></i>
                Download Excel
              </Button>
            </div>
          </div>

          {/* Filters - Collapsible */}
          {showFilters && (
            <Row className="g-3 mb-3" style={{ 
              animation: 'slideDown 0.3s ease-out',
              borderBottom: '1px solid #dee2e6',
              paddingBottom: '1rem'
            }}>
              <Col xs={12}>
                <h6 className="mb-0 fw-medium text-secondary">Filters & Search</h6>
              </Col>
              <Col xs={12} md={6} lg={4} xl={3}>
                <Form.Label className="small text-muted mb-1">Search</Form.Label>
                <Form.Control
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, Web Order, Source..."
                />
              </Col>
              <Col xs={6} sm={6} md={3} lg={2} xl={2}>
                <Form.Label className="small text-muted mb-1">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </Col>
              <Col xs={6} sm={6} md={3} lg={2} xl={2}>
                <Form.Label className="small text-muted mb-1">End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </Col>
              <Col xs={6} sm={6} md={3} lg={2} xl={2}>
                <Form.Label className="small text-muted mb-1">Batch ID</Form.Label>
                <Form.Control
                  type="text"
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  placeholder="Batch ID"
                />
              </Col>
              <Col xs={6} sm={6} md={3} lg={2} xl={1}>
                <Form.Label className="small text-muted mb-1">SKU</Form.Label>
                <Form.Control
                  type="text"
                  value={skuFilter}
                  onChange={(e) => setSkuFilter(e.target.value)}
                  placeholder="SKU"
                />
              </Col>
              <Col xs={6} sm={6} md={3} lg={2} xl={2}>
                <Form.Label className="small text-muted mb-1">Source Type</Form.Label>
                <Form.Select
                  value={sourceTypeFilter}
                  onChange={(e) => setSourceTypeFilter(e.target.value)}
                >
                  <option value="All">All Sources</option>
                  <option value="Store">Store (TO)</option>
                  <option value="Distributor">Distributor (PO)</option>
                </Form.Select>
              </Col>
              <Col xs={6} sm={6} md={3} lg={2} xl={2}>
                <Form.Label className="small text-muted mb-1">Order Type</Form.Label>
                <Form.Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="TO">TO</option>
                  <option value="PO">PO</option>
                  <option value="Market Purchase">Market Purchase</option>
                </Form.Select>
              </Col>
              <Col xs={6} sm={6} md={3} lg={2} xl={2}>
                <Form.Label className="small text-muted mb-1">Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Draft">Draft</option>
                  <option value="Accepted">Accepted</option>
                  <option value="In Dispatch">In Dispatch</option>
                  <option value="Fulfilled">Fulfilled</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Partial">Partial</option>
                  <option value="Approved">Approved</option>
                  <option value="Expired">Expired</option>
                </Form.Select>
              </Col>
              <Col xs={6} sm={6} md={3} lg={2} xl={2} className="d-flex align-items-end">
                <Button
                  variant={showRetryOnly ? "primary" : "outline-secondary"}
                  onClick={() => setShowRetryOnly(!showRetryOnly)}
                  className="w-100"
                  size="sm"
                >
                  {showRetryOnly ? "✓ " : ""}Re-try Orders
                </Button>
              </Col>
              <Col xs={6} sm={6} md={3} lg={2} xl={2} className="d-flex align-items-end">
                <Button
                  variant={showMarketPurchaseOnly ? "primary" : "outline-secondary"}
                  onClick={() => setShowMarketPurchaseOnly(!showMarketPurchaseOnly)}
                  className="w-100"
                  size="sm"
                >
                  {showMarketPurchaseOnly ? "✓ " : ""}Market Purchase
                </Button>
              </Col>
              <Col xs={6} sm={6} md={3} lg={2} xl={1} className="d-flex align-items-end">
                <Button variant="outline-secondary" onClick={handleClearFilters} className="w-100" size="sm">
                  Clear
                </Button>
              </Col>
            </Row>
          )}

          {/* Add animation styles */}
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          {/* Table */}
          <div className="table-responsive" style={{ overflowX: 'auto', minWidth: '1000px' }} ref={tableRef}>
            <Table striped hover className="mb-0" style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead className="table-light">
                <tr>
                  <th>Draft ID</th>
                  <th>Type</th>
                  <th>TO/PO ID</th>
                  <th>Web Order</th>
                  <th>Status</th>
                  <th>Qty Req.</th>
                  <th>Qty Fulfilled</th>
                  <th>Qty Pending</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="16" className="text-center text-secondary py-5">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, idx) => {
                    const qtyPending = order.qtyReq - order.qtyFulfilled;
                    return (
                      <tr key={order.id}>
                        <td>
                          <Button 
                            variant="link" 
                            className="p-0 text-decoration-none fw-medium" 
                            onClick={() => handleViewDetails(order)}
                          >
                            {order.id}
                          </Button>
                        </td>
                        <td>
                          <span className={`badge ${
                            order.type === 'TO' ? 'bg-primary' : 
                            order.type === 'PO' ? 'bg-purple' : 
                            'bg-warning text-dark'
                          }`}>
                            {order.type}
                          </span>
                        </td>
                        <td className="fw-medium">{order.docId}</td>
                        <td>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none"
                            onClick={() => handleViewWebOrder(order.webOrder)}
                          >
                            {order.webOrder}
                          </Button>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="text-end">{order.qtyReq}</td>
                        <td className="text-end fw-medium text-success">{order.qtyFulfilled}</td>
                        <td className="text-end">
                          <span className={qtyPending > 0 ? 'text-warning fw-medium' : 'text-muted'}>
                            {qtyPending}
                          </span>
                        </td>
                        <td className="small">{order.created}</td>
                        <td>
                          <ActionDropdown
                            orderId={order.id}
                            actions={getOrderActions(order)}
                            onActionSelect={handleActionSelect}
                            dropDirection={'down'}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Chart Details Modal */}
      <Modal show={showChartModal} onHide={() => setShowChartModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{chartModalData.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {chartModalData.content}
        </Modal.Body>
      </Modal>
    </div>
  );
};

function ProductLineItemsTable({ items }) {
  const handleLineAction = (item, action, pending) => {
    switch(action) {
      case 'view_details':
        const detailsContent = `
          <div class="p-3">
            <h5 class="mb-3 fw-bold">Line Item Details</h5>
            <div class="row g-3">
              <div class="col-md-6">
                <div class="text-muted small">Line ID</div>
                <div class="fw-medium">${item.lineId}</div>
              </div>
              <div class="col-md-6">
                <div class="text-muted small">Product Name</div>
                <div class="fw-medium">${item.product}</div>
              </div>
              <div class="col-md-6">
                <div class="text-muted small">SKU</div>
                <div><code>${item.sku}</code></div>
              </div>
              <div class="col-md-6">
                <div class="text-muted small">Status</div>
                <div><span class="badge bg-secondary">${item.status}</span></div>
              </div>
              <div class="col-md-4">
                <div class="text-muted small">Qty Requested</div>
                <div class="fw-medium">${item.qtyReq}</div>
              </div>
              <div class="col-md-4">
                <div class="text-muted small">Qty Fulfilled</div>
                <div class="fw-medium text-success">${item.qtyFulfilled}</div>
              </div>
              <div class="col-md-4">
                <div class="text-muted small">Qty Pending</div>
                <div class="fw-medium text-warning">${pending}</div>
              </div>
              <div class="col-12">
                <div class="text-muted small">Remarks</div>
                <div class="alert alert-info mb-0">${item.remarks || 'No remarks'}</div>
              </div>
            </div>
          </div>
        `;
        // Use global modal function if available
        if (window.openModalFromLine) {
          window.openModalFromLine(`Line Details: ${item.lineId}`, detailsContent, 'modal-md');
        }
        break;
        
      case 'view_linked_web_order':
        const webOrderContent = `
          <div class="p-3">
            <h5 class="mb-3 fw-bold">Linked Web Order</h5>
            <div class="alert alert-info">
              <i class="bi bi-link-45deg me-2"></i>
              This line item is linked to Web Order: <strong>WO-2025-001</strong>
            </div>
            <p class="text-muted">Click below to navigate to the original customer web order.</p>
            <button class="btn btn-primary" onclick="if(window.handleViewWebOrderFromModal) window.handleViewWebOrderFromModal('WO-2025-001')">
              <i class="bi bi-box-arrow-up-right me-1"></i>View Web Order
            </button>
          </div>
        `;
        if (window.openModalFromLine) {
          window.openModalFromLine(`Linked Web Order - Line ${item.lineId}`, webOrderContent, 'modal-md');
        }
        break;
        
      case 'trigger_recheck':
        const recheckContent = `
          <div class="p-3">
            <h5 class="mb-3 fw-bold">Trigger Manual Recheck</h5>
            <div class="alert alert-warning">
              <i class="bi bi-info-circle me-2"></i>
              <strong>Recheck ${item.product}?</strong>
            </div>
            <p>System will re-evaluate store/distributor availability for this product.</p>
            <div class="d-flex gap-2">
              <button class="btn btn-primary" onclick="alert('✅ Recheck triggered for ${item.product}\\nSystem is re-evaluating availability...')">
                <i class="bi bi-arrow-clockwise me-1"></i>Confirm Recheck
              </button>
              <button class="btn btn-secondary" onclick="window.location.reload()">Cancel</button>
            </div>
          </div>
        `;
        if (window.openModalFromLine) {
          window.openModalFromLine(`Recheck - ${item.product}`, recheckContent, 'modal-md');
        }
        break;
        
      case 'add_remarks':
        const remarksContent = `
          <div class="p-3">
            <h5 class="mb-3 fw-bold">Add Remarks</h5>
            <div class="mb-3">
              <label class="form-label">Remarks for Line ${item.lineId}:</label>
              <textarea class="form-control" rows="4" id="remarksInput" placeholder="Enter your remarks here..."></textarea>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-primary" onclick="alert('✅ Remarks added for Line ${item.lineId}')">
                <i class="bi bi-check-lg me-1"></i>Save Remarks
              </button>
              <button class="btn btn-secondary" onclick="window.location.reload()">Cancel</button>
            </div>
          </div>
        `;
        if (window.openModalFromLine) {
          window.openModalFromLine(`Add Remarks - Line ${item.lineId}`, remarksContent, 'modal-md');
        }
        break;
        
      default:
        break;
    }
  };

  return (
    <div className="col-12 mt-4">
      <h5 className="text-primary fw-bold mb-3">Product Line Items</h5>
      <div className="table-responsive" style={{ maxHeight: '400px', overflowX: 'auto', overflowY: 'auto' }}>
        <Table size="sm" bordered style={{ minWidth: '1000px' }}>
          <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <th>Line ID</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Qty Req.</th>
              <th>Qty Fulfilled</th>
              <th>Qty Pending</th>
              <th>Status</th>
              <th>Remarks</th>
              <th style={{ minWidth: '180px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const pending = item.qtyReq - item.qtyFulfilled;
              return (
                <tr key={item.lineId || idx}>
                  <td>{item.lineId}</td>
                  <td>{item.product}</td>
                  <td><code>{item.sku}</code></td>
                  <td className="text-end">{item.qtyReq}</td>
                  <td className="text-end text-success fw-medium">{item.qtyFulfilled}</td>
                  <td className={`text-end ${pending > 0 ? 'text-warning fw-medium' : 'text-muted'}`}>{pending}</td>
                  <td><span className={`badge ${getStatusBadgeClass(item.status)}`}>{item.status}</span></td>
                  <td className="small">{item.remarks || '-'}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <OverlayTrigger placement="top" overlay={<Tooltip>View Details</Tooltip>}>
                        <button
                          className="btn btn-sm btn-outline-secondary p-1"
                          onClick={() => handleLineAction(item, 'view_details', pending)}
                          style={{ width: '30px', height: '30px' }}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </OverlayTrigger>
                      
                      <OverlayTrigger placement="top" overlay={<Tooltip>View Linked Web Order</Tooltip>}>
                        <button
                          className="btn btn-sm btn-outline-secondary p-1"
                          onClick={() => handleLineAction(item, 'view_linked_web_order', pending)}
                          style={{ width: '30px', height: '30px' }}
                        >
                          <i className="bi bi-link-45deg"></i>
                        </button>
                      </OverlayTrigger>
                      
                      {(pending > 0 && (item.status === 'Draft' || item.status === 'Rejected')) && (
                        <OverlayTrigger placement="top" overlay={<Tooltip>Trigger Recheck</Tooltip>}>
                          <button
                            className="btn btn-sm btn-outline-secondary p-1"
                            onClick={() => handleLineAction(item, 'trigger_recheck', pending)}
                            style={{ width: '30px', height: '30px' }}
                          >
                            <i className="bi bi-info-circle"></i>
                          </button>
                        </OverlayTrigger>
                      )}
                      
                      <OverlayTrigger placement="top" overlay={<Tooltip>Add Remarks</Tooltip>}>
                        <button
                          className="btn btn-sm btn-outline-secondary p-1"
                          onClick={() => handleLineAction(item, 'add_remarks', pending)}
                          style={{ width: '30px', height: '30px' }}
                        >
                          <i className="bi bi-file-text"></i>
                        </button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default SourcingView;
