import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Col, Card, Form, Button, Table, Carousel, Modal, Badge } from 'react-bootstrap';
import { dateDiffInHours, exportToCSV, getStatusBadgeClass } from '../utils/utils';
import ActionDropdown from '../components/ActionDropdown';

const SourcingView = ({ sourcingOrders, setSourcingOrders, onShowToast, onOpenModal, onNavigate, setHighlightedWebOrder, initialFilters = {}, clearFilters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [kpiViewMode, setKpiViewMode] = useState('wrap'); // 'wrap' or 'slider'
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('All');
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartModalData, setChartModalData] = useState({ title: '', content: null });
  const [showRetryOnly, setShowRetryOnly] = useState(false);
  const [showMarketPurchaseOnly, setShowMarketPurchaseOnly] = useState(false);
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
    
    return () => {
      delete window.handleViewWebOrderFromModal;
    };
  }, [handleViewWebOrder]);



  const handleChartClick = (chartType) => {
    let title = '';
    let content = null;

    const filtered = filteredOrders;

    if (chartType === 'source') {
      const toOrders = filtered.filter(o => o.type === 'TO');
      const poOrders = filtered.filter(o => o.type === 'PO');
      
      title = 'Fulfilment Source Distribution - Detailed View';
      content = (
        <div>
          <Row className="mb-3">
            <Col xs={12} sm={6} md={6}>
              <div className="p-3 bg-primary bg-opacity-10 rounded">
                <h6 className="text-primary">Transfer Orders (TO)</h6>
                <h4>{toOrders.length} Orders</h4>
                <small>Fulfilled: {toOrders.filter(o => o.status === 'Fulfilled').length}</small>
              </div>
            </Col>
            <Col xs={12} sm={6} md={6}>
              <div className="p-3 bg-info bg-opacity-10 rounded">
                <h6 className="text-info">Purchase Orders (PO)</h6>
                <h4>{poOrders.length} Orders</h4>
                <small>Fulfilled: {poOrders.filter(o => o.status === 'Fulfilled').length}</small>
              </div>
            </Col>
          </Row>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Type</th>
                <th>Doc ID</th>
                <th>Web Order</th>
                <th>Status</th>
                <th>Source Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 15).map(order => (
                <tr key={order.id}>
                  <td><Badge bg={order.type === 'TO' ? 'primary' : 'info'} text="dark">{order.type}</Badge></td>
                  <td>{order.docId}</td>
                  <td>{order.webOrder}</td>
                  <td><Badge bg={getStatusBadgeClass(order.status)} text="dark">{order.status}</Badge></td>
                  <td>{order.source}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    } else if (chartType === 'status') {
      const fulfilled = filtered.filter(o => o.status === 'Fulfilled');
      const pending = filtered.filter(o => o.status === 'Draft' || o.status === 'Accepted');
      const rejected = filtered.filter(o => o.status === 'Rejected');
      
      title = 'Status Breakdown - Detailed Analysis';
      content = (
        <div>
          <Row className="mb-3">
            <Col xs={12} sm={6} md={4}>
              <div className="p-3 bg-success bg-opacity-10 rounded">
                <h6 className="text-success">Fulfilled</h6>
                <h4>{fulfilled.length}</h4>
              </div>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <div className="p-3 bg-warning bg-opacity-10 rounded">
                <h6 className="text-warning">Pending</h6>
                <h4>{pending.length}</h4>
              </div>
            </Col>
            <Col xs={12} sm={12} md={4}>
              <div className="p-3 bg-danger bg-opacity-10 rounded">
                <h6 className="text-danger">Rejected</h6>
                <h4>{rejected.length}</h4>
              </div>
            </Col>
          </Row>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Doc ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Batch ID</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {[...rejected, ...pending, ...fulfilled].slice(0, 15).map(order => (
                <tr key={order.id}>
                  <td>{order.docId}</td>
                  <td><Badge bg={order.type === 'TO' ? 'primary' : 'info'} text="dark">{order.type}</Badge></td>
                  <td><Badge bg={getStatusBadgeClass(order.status)} text="dark">{order.status}</Badge></td>
                  <td>{order.batchId}</td>
                  <td>{order.created}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    } else if (chartType === 'market') {
      const marketPurchaseOrders = filtered.filter(o => o.marketPurchase);
      const mpFulfilled = marketPurchaseOrders.filter(o => o.status === 'Fulfilled');
      const mpPending = marketPurchaseOrders.filter(o => o.status !== 'Fulfilled' && o.status !== 'Rejected');
      
      title = 'Market Purchase Dependency - Complete Overview';
      content = (
        <div>
          <Row className="mb-3">
            <Col xs={12} sm={6} md={4}>
              <div className="p-3 bg-warning bg-opacity-10 rounded">
                <h6 className="text-warning">Total Market Purchases</h6>
                <h4>{marketPurchaseOrders.length}</h4>
              </div>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <div className="p-3 bg-success bg-opacity-10 rounded">
                <h6 className="text-success">Fulfilled</h6>
                <h4>{mpFulfilled.length}</h4>
              </div>
            </Col>
            <Col xs={12} sm={12} md={4}>
              <div className="p-3 bg-info bg-opacity-10 rounded">
                <h6 className="text-info">Pending</h6>
                <h4>{mpPending.length}</h4>
              </div>
            </Col>
          </Row>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Doc ID</th>
                <th>Web Order</th>
                <th>Status</th>
                <th>Vendor</th>
                <th>Estimated Cost</th>
                <th>Actual Cost</th>
              </tr>
            </thead>
            <tbody>
              {marketPurchaseOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.docId}</td>
                  <td>{order.webOrder}</td>
                  <td><Badge bg={getStatusBadgeClass(order.status)} text="dark">{order.status}</Badge></td>
                  <td>{order.vendor || '-'}</td>
                  <td>{order.estimatedCost || '-'}</td>
                  <td>{order.actualCost || '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    }

    setChartModalData({ title, content });
    setShowChartModal(true);
  };

  const calculateKPIs = () => {
    const fulfilled = sourcingOrders.filter(o => o.status === 'Fulfilled');
    const fulfilledTOs = fulfilled.filter(o => o.type === 'TO');
    const fulfilledPOs = fulfilled.filter(o => o.type === 'PO');
    
    let totalHoursTO = 0;
    fulfilledTOs.forEach(o => { totalHoursTO += dateDiffInHours(o.created, o.lastUpdated); });
    
    let totalHoursPO = 0;
    fulfilledPOs.forEach(o => { totalHoursPO += dateDiffInHours(o.created, o.lastUpdated); });
    
    const retriedOrders = sourcingOrders.filter(o => o.retry > 0);
    const successfulRetries = retriedOrders.filter(o => o.status === 'Fulfilled');
    const retryRate = retriedOrders.length > 0 ? ((successfulRetries.length / retriedOrders.length) * 100).toFixed(0) : 0;

    // Market Purchase Analytics
    const marketPurchaseOrders = sourcingOrders.filter(o => o.marketPurchase === true);
    const marketPurchaseCount = marketPurchaseOrders.length;
    const marketPurchasePercentage = sourcingOrders.length > 0 ? ((marketPurchaseCount / sourcingOrders.length) * 100).toFixed(1) : 0;
    const marketPurchaseFulfilled = marketPurchaseOrders.filter(o => o.status === 'Fulfilled').length;
    const marketPurchasePending = marketPurchaseOrders.filter(o => o.status === 'Approved' || o.status === 'In Progress').length;

    return {
      total: sourcingOrders.length,
      pending: sourcingOrders.filter(o => o.status === 'Draft' || o.status === 'Accepted' || o.status === 'In Dispatch').length,
      fulfilled: fulfilled.length,
      rejected: sourcingOrders.filter(o => o.status === 'Rejected' || o.status === 'Cancelled').length,
      avgTimeTo: fulfilledTOs.length > 0 ? (totalHoursTO / fulfilledTOs.length).toFixed(1) : 0,
      avgTimePo: fulfilledPOs.length > 0 ? (totalHoursPO / fulfilledPOs.length).toFixed(1) : 0,
      retryRate,
      marketPurchaseCount,
      marketPurchasePercentage,
      marketPurchaseFulfilled,
      marketPurchasePending
    };
  };

  const kpis = calculateKPIs();

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
    
    // Build products table HTML
    const productsTableHTML = order.items ? `
      <div class="col-12 mt-4"><h5 class="text-primary fw-bold mb-3">Product Line Items</h5></div>
      <div class="col-12">
        <div class="table-responsive" style="max-height: 400px; overflow-x: auto; overflow-y: auto;">
          <table class="table table-sm table-bordered" style="min-width: 1000px;">
            <thead class="table-light" style="position: sticky; top: 0; z-index: 10;">
              <tr>
                <th>Line ID</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty Req.</th>
                <th>Qty Fulfilled</th>
                <th>Qty Pending</th>
                <th>Status</th>
                <th>Remarks</th>
                <th style="min-width: 180px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => {
                const pending = item.qtyReq - item.qtyFulfilled;
                return `
                  <tr>
                    <td>${item.lineId}</td>
                    <td>${item.product}</td>
                    <td><code>${item.sku}</code></td>
                    <td class="text-end">${item.qtyReq}</td>
                    <td class="text-end text-success fw-medium">${item.qtyFulfilled}</td>
                    <td class="text-end ${pending > 0 ? 'text-warning fw-medium' : 'text-muted'}">${pending}</td>
                    <td><span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span></td>
                    <td class="small">${item.remarks || '-'}</td>
                    <td>
                      <select class="form-select form-select-sm" onchange="
                        if(this.value === 'view') alert('Line: ${item.lineId}\\nProduct: ${item.product}\\nSKU: ${item.sku}\\nQty Req: ${item.qtyReq}\\nQty Fulfilled: ${item.qtyFulfilled}\\nStatus: ${item.status}\\nRemarks: ${item.remarks || 'None'}');
                        else if(this.value === 'view_web_order') alert('Navigate to Web Order linked to this item');
                        else if(this.value === 'manual_recheck') alert('Manual recheck for ${item.product}');
                        else if(this.value === 'add_remarks') alert('Add remarks for ${item.product}');
                        this.value = 'view';
                      ">
                        <option value="view">View Details</option>
                        <option value="view_web_order">View Web Order</option>
                        ${pending > 0 && (item.status === 'Draft' || item.status === 'Accepted') ? 
                          '<option value="manual_recheck">Manual Recheck</option>' : ''}
                        <option value="add_remarks">Add Remarks</option>
                      </select>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : '';
    
    const content = `
      <div class="row g-3">
        <div class="col-12"><h5 class="text-primary fw-bold mb-3">Document Information</h5></div>
        <div class="col-sm-6"><div class="fw-medium text-secondary">Draft ID</div><div class="fs-6">${order.id}</div></div>
        <div class="col-sm-6"><div class="fw-medium text-secondary">Order Type</div><div class="fs-6"><span class="badge ${
          order.type === 'TO' ? 'bg-primary' : 
          order.type === 'PO' ? 'bg-purple' : 
          'bg-warning text-dark'
        }">${order.type}</span>${order.marketPurchase ? ' <span class="badge bg-danger ms-1">Market Purchase</span>' : ''}</div></div>
        <div class="col-sm-6"><div class="fw-medium text-secondary">${order.type} ID</div><div class="fs-6">${order.docId || '-'}</div></div>
        <div class="col-sm-6">
          <div class="fw-medium text-secondary">Linked Web Order</div>
          <div class="fs-6">
            <a href="#" class="text-decoration-none" onclick="event.preventDefault(); window.handleViewWebOrderFromModal('${order.webOrder}');">
              ${order.webOrder}
            </a>
          </div>
        </div>
        <div class="col-sm-6"><div class="fw-medium text-secondary">Batch ID</div><div class="fs-6"><a href="#" class="text-decoration-none">${order.batchId}</a></div></div>
        <div class="col-sm-6"><div class="fw-medium text-secondary">Status</div><div class="fs-6"><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></div></div>
        
        ${order.marketPurchase ? `
          <div class="col-12 mt-4">
            <div class="alert alert-warning border-warning">
              <h6 class="alert-heading fw-bold mb-2">
                <i class="bi bi-cart-fill me-2"></i>Market Purchase Information
              </h6>
              <div class="row g-2">
                <div class="col-sm-6"><strong>Vendor:</strong> ${order.vendor || 'Not assigned'}</div>
                <div class="col-sm-6"><strong>Estimated Cost:</strong> ₹${order.estimatedCost ? order.estimatedCost.toLocaleString() : 'N/A'}</div>
                ${order.actualCost ? `<div class="col-sm-6"><strong>Actual Cost:</strong> ₹${order.actualCost.toLocaleString()}</div>` : ''}
                <div class="col-12 mt-2"><small class="text-muted"><em>This order was escalated to market purchase after regular sourcing channels (warehouse, stores, distributors) were unable to fulfill.</em></small></div>
              </div>
            </div>
          </div>
        ` : ''}
        
        <div class="col-12 mt-4"><h5 class="text-primary fw-bold mb-3">Location Details</h5></div>
        <div class="col-sm-6"><div class="fw-medium text-secondary">Source Location</div><div class="fs-6">${order.source}</div></div>
        <div class="col-sm-6"><div class="fw-medium text-secondary">Destination Location</div><div class="fs-6">${order.destination}</div></div>
        
        <div class="col-12 mt-4"><h5 class="text-primary fw-bold mb-3">Quantity Summary</h5></div>
        <div class="col-sm-4"><div class="fw-medium text-secondary">Total Qty Requested</div><div class="fs-5 fw-bold text-primary">${order.qtyReq}</div></div>
        <div class="col-sm-4"><div class="fw-medium text-secondary">Total Qty Fulfilled</div><div class="fs-5 fw-bold text-success">${order.qtyFulfilled}</div></div>
        <div class="col-sm-4"><div class="fw-medium text-secondary">Total Qty Pending</div><div class="fs-5 fw-bold ${qtyPending > 0 ? 'text-warning' : 'text-muted'}">${qtyPending}</div></div>
        
        ${productsTableHTML}
        
        <div class="col-12 mt-4"><h5 class="text-primary fw-bold mb-3">Tracking & Audit Information</h5></div>
        <div class="col-sm-6"><div class="fw-medium text-secondary">Retry Count</div><div class="fs-6">${order.retry > 0 ? `<span class="badge bg-warning text-dark">${order.retry}</span> <span class="text-warning">(Retry Triggered)</span>` : '<span class="text-muted">0</span>'}</div></div>
        <div class="col-sm-6"><div class="fw-medium text-secondary">Created Date/Time</div><div class="fs-6">${order.created}</div></div>
        <div class="col-sm-6"><div class="fw-medium text-secondary">Created By</div><div class="fs-6">${order.createdBy}</div></div>
        <div class="col-sm-6"><div class="fw-medium text-secondary">Last Actioned By</div><div class="fs-6">${order.lastActionedBy}</div></div>
        
        ${order.remarks ? `<div class="col-12 mt-4"><h5 class="text-primary fw-bold mb-3">Remarks / Reason</h5></div><div class="col-12"><div class="alert alert-info mb-0">${order.remarks}</div></div>` : ''}
      </div>
    `;
    
    onOpenModal(`${order.type} Details: ${order.id}`, content, 'modal-xl');
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

  const getOrderActions = (order) => {
    const status = order.status;
    const actions = [];

    // Always show View Details first
    actions.push({ label: 'View Details', value: 'view' });
    
    // View linked web order
    actions.push({ label: 'View Web Order', value: 'view_web_order' });
    
    // View batch log for traceability
    actions.push({ label: 'View Batch Log', value: 'view_batch_log' });
    
    // Status-specific actions
    if (status === 'Draft' || status === 'Rejected') {
      // Draft or rejected TO/PO can be rechecked
      actions.push({ label: 'Manual Recheck', value: 'manual_recheck' });
    }
    
    // Add remarks is available for all statuses for audit trail
    actions.push({ label: 'Add Remarks', value: 'add_remarks' });
    
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
      
      {/* KPI View Toggle */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-bold text-secondary">Key Performance Indicators</h5>
        <div className="btn-group btn-group-sm" role="group">
          <button
            type="button"
            className={`btn ${kpiViewMode === 'wrap' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setKpiViewMode('wrap')}
          >
            <i className="bi bi-grid-3x3-gap me-1"></i>
            Wrap
          </button>
          <button
            type="button"
            className={`btn ${kpiViewMode === 'slider' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setKpiViewMode('slider')}
          >
            <i className="bi bi-arrow-left-right me-1"></i>
            Slider
          </button>
        </div>
      </div>

      {/* KPIs - Wrap Mode */}
      {kpiViewMode === 'wrap' && (
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Total Sourcing</div>
                <div className="kpi-value">{kpis.total}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Pending (Draft/Accepted)</div>
                <div className="kpi-value">{kpis.pending}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Fulfilled</div>
                <div className="kpi-value">{kpis.fulfilled}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Rejected / Cancelled</div>
                <div className="kpi-value">{kpis.rejected}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Avg. Fulfil Time (Store)</div>
                <div className="kpi-value">{kpis.avgTimeTo} H</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Avg. Fulfil Time (Dist.)</div>
                <div className="kpi-value">{kpis.avgTimePo} H</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Retry Success Rate</div>
                <div className="kpi-value">{kpis.retryRate}%</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Market Purchase Orders</div>
                <div className="kpi-value">{kpis.marketPurchaseCount}</div>
                <div className="small text-muted mt-1">{kpis.marketPurchasePercentage}% of total</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Market Purchase Fulfilled</div>
                <div className="kpi-value">{kpis.marketPurchaseFulfilled}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Market Purchase Pending</div>
                <div className="kpi-value">{kpis.marketPurchasePending}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* KPIs - Slider Mode */}
      {kpiViewMode === 'slider' && (
        <div className="mb-4 kpi-slider-container">
          <Carousel 
            interval={3000}
            indicators={true}
            controls={false}
            pause="hover"
            activeIndex={carouselIndex}
            onSelect={(selectedIndex) => setCarouselIndex(selectedIndex)}
            touch={false}
            slide={true}
          >
            <Carousel.Item>
              <Row className="g-3 px-2 pb-4 pt-2">
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Total Sourcing</div>
                      <div className="kpi-value">{kpis.total}</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Pending (Draft/Accepted)</div>
                      <div className="kpi-value">{kpis.pending}</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Fulfilled</div>
                      <div className="kpi-value">{kpis.fulfilled}</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Carousel.Item>
            <Carousel.Item>
              <Row className="g-3 px-2 pb-4 pt-2">
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Rejected / Cancelled</div>
                      <div className="kpi-value">{kpis.rejected}</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Avg. Fulfil Time (Store)</div>
                      <div className="kpi-value">{kpis.avgTimeTo} H</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Avg. Fulfil Time (Dist.)</div>
                      <div className="kpi-value">{kpis.avgTimePo} H</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Carousel.Item>
            <Carousel.Item>
              <Row className="g-3 px-2 pb-4 pt-2">
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Retry Success Rate</div>
                      <div className="kpi-value">{kpis.retryRate}%</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Market Purchase Orders</div>
                      <div className="kpi-value">{kpis.marketPurchaseCount}</div>
                      <div className="small text-muted mt-1">{kpis.marketPurchasePercentage}% of total</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Market Purchase Fulfilled</div>
                      <div className="kpi-value">{kpis.marketPurchaseFulfilled}</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Carousel.Item>
            <Carousel.Item>
              <Row className="g-3 px-2 pb-4 pt-2">
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Market Purchase Pending</div>
                      <div className="kpi-value">{kpis.marketPurchasePending}</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Carousel.Item>
          </Carousel>
        </div>
      )}

      {/* Table */}
      <Card>
        <Card.Body>
          {/* Filters */}
          <Row className="g-3 mb-3">
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

          {/* Table Actions */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
            <div className="text-muted small">
              Showing {filteredOrders.length} of {sourcingOrders.length} records
            </div>
            <Button variant="success" onClick={handleDownload} size="sm">
              <i className="bi bi-download me-2"></i>
              Download Excel
            </Button>
          </div>

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

export default SourcingView;
