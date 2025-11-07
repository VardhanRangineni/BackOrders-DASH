import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Col, Card, Form, Button, Table, Modal } from 'react-bootstrap';
import { exportToCSV, getStatusBadgeClass } from '../utils/utils';

function getTrackingBadgeClass(status) {
  if (!status) return 'bg-secondary';
  
  // TO statuses
  if (status.includes('TO Generated')) return 'bg-primary';
  if (status.includes('TO In Transit')) return 'bg-info';
  if (status.includes('TO Received') || status.includes('TO Partially Received')) return 'bg-success';
  if (status.includes('TO Rejected')) return 'bg-danger';
  
  // PO statuses
  if (status.includes('PO Generated')) return 'bg-purple';
  if (status.includes('SO Created') || status.includes('Awaiting Dispatch')) return 'bg-primary';
  if (status.includes('PO In Transit')) return 'bg-info';
  if (status.includes('PO Received')) return 'bg-success';
  if (status.includes('PO Rejected')) return 'bg-danger';
  
  // Market Purchase statuses
  if (status.includes('Vendor Quote')) return 'bg-warning text-dark';
  if (status.includes('Vendor Negotiation')) return 'bg-warning text-dark';
  if (status.includes('Market Purchase Completed')) return 'bg-success';
  
  // General statuses
  if (status === 'Draft Created') return 'bg-secondary';
  if (status === 'Draft Approved') return 'bg-primary';
  if (status === 'Fulfilled' || status.includes('Completed')) return 'bg-success';
  if (status === 'Partially Fulfilled' || status.includes('Partial')) return 'bg-info';
  if (status === 'Rejected') return 'bg-danger';
  
  return 'bg-secondary';
}

const SourcingView = ({ sourcingOrders, setSourcingOrders, onShowToast, onOpenModal, onNavigate, setHighlightedWebOrder, initialFilters = {}, clearFilters, highlightedTOPO, setHighlightedTOPO }) => {
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [productsToShow, setProductsToShow] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [reassignData, setReassignData] = useState({ source: '', reason: '' });
  const [rejectData, setRejectData] = useState({ reason: '', type: 'unavailable' });
  const highlightedRowRef = useRef(null);

  useEffect(() => {
    if (highlightedTOPO) {
      console.log('SourcingView received highlightedTOPO:', highlightedTOPO);
      setTimeout(() => {
        if (highlightedRowRef.current) {
          console.log('Scrolling to highlighted row');
          highlightedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          console.log('No highlighted row ref found');
        }
      }, 100);
      const timer = setTimeout(() => setHighlightedTOPO(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [highlightedTOPO, setHighlightedTOPO]);

  // Handler to show products of selected drafts
  const handleShowProducts = () => {
    // Find selected orders and collect their items that are not fully fulfilled
    const selectedOrders = filteredOrders.filter(order => selectedRows.includes(order.id));
    
    // Consolidate products by SKU
    const productMap = new Map();
    
    selectedOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const req = item.qtyReq ?? item.qty ?? 0;
        const fulfilled = item.qtyFulfilled ?? 0;
        const pending = req - fulfilled;
        
        if (pending > 0 && item.status !== 'Fulfilled') {
          const sku = item.sku;
          
          if (productMap.has(sku)) {
            // Product already exists, sum quantities and add draft ID
            const existing = productMap.get(sku);
            existing.qtyReq += req;
            existing.qtyFulfilled += fulfilled;
            existing.qtyPending += pending;
            existing.draftIds.push(order.id);
            existing.orders.push(order);
            existing.statuses.push(item.status);
            existing.statusByDraft[order.id] = item.status;
          } else {
            // New product, create entry
            productMap.set(sku, {
              ...item,
              qtyReq: req,
              qtyFulfilled: fulfilled,
              qtyPending: pending,
              draftIds: [order.id],
              orders: [order],
              statuses: [item.status],
              statusByDraft: { [order.id]: item.status }
            });
          }
        }
      });
    });
    
    // Convert map to array
    const consolidatedProducts = Array.from(productMap.values());
    
    setProductsToShow(consolidatedProducts);
    setSelectedProducts([]);
    setShowProductsModal(true);
  };

  // Product selection handlers
  const handleSelectAllProducts = (e) => {
    if (e.target.checked) {
      setSelectedProducts(productsToShow.map((_, idx) => idx));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleProductSelect = (idx) => {
    setSelectedProducts(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

  // Product action handlers
  const handleReassignProducts = () => {
    setCurrentProductIndex('bulk');
    setShowReassignModal(true);
  };

  const handleRejectProducts = () => {
    setCurrentProductIndex('bulk');
    setShowRejectModal(true);
  };

  const handleReassignSingleProduct = (idx) => {
    setCurrentProductIndex(idx);
    setShowReassignModal(true);
  };

  const handleRejectSingleProduct = (idx) => {
    setCurrentProductIndex(idx);
    setShowRejectModal(true);
  };

  const confirmReassign = () => {
    if (!reassignData.reason) {
      onShowToast('Please provide a reason for reassignment');
      return;
    }

    const updatedProducts = [...productsToShow];
    
    if (currentProductIndex === 'bulk') {
      selectedProducts.forEach(idx => {
        updatedProducts[idx] = { 
          ...updatedProducts[idx], 
          status: 'Pending',
          reassignedTo: reassignData.source || 'Auto-Select',
          reassignReason: reassignData.reason
        };
      });
      onShowToast(`Reassigned ${selectedProducts.length} selected products to ${reassignData.source || 'Auto-Select'}`);
      setSelectedProducts([]);
    } else {
      updatedProducts[currentProductIndex] = { 
        ...updatedProducts[currentProductIndex], 
        status: 'Pending',
        reassignedTo: reassignData.source || 'Auto-Select',
        reassignReason: reassignData.reason
      };
      onShowToast(`Reassigned product ${updatedProducts[currentProductIndex].sku} to ${reassignData.source || 'Auto-Select'}`);
    }
    
    setProductsToShow(updatedProducts);
    setShowReassignModal(false);
    setReassignData({ source: '', reason: '' });
  };

  const confirmReject = () => {
    if (!rejectData.reason) {
      onShowToast('Please provide a reason for rejection');
      return;
    }
    const updatedProducts = [...productsToShow];

    const nowStamp = new Date().toLocaleString();
    const year = new Date().getFullYear();

    const handleSingleReject = (idx) => {
      const item = updatedProducts[idx];
      const fulfilled = item.qtyFulfilled ?? 0;

      const baseRemark = `${item.remarks || ''}\n[${nowStamp}] Rejected: ${rejectData.reason}`.trim();

      // If low stock / unavailable -> create TO to store
      if (rejectData.type === 'unavailable' || rejectData.type === 'stock') {
        const newDoc = `TO-${year}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        updatedProducts[idx] = {
          ...item,
          status: 'TO Created',
          linkedDocs: [...(item.linkedDocs || []), newDoc],
          qtyPending: 0,
          qtyFulfilled: fulfilled,
          rejectReason: rejectData.reason,
          rejectType: rejectData.type,
          remarks: `${baseRemark}\nTO created due to low stock: ${newDoc}`
        };
        return { type: 'to', doc: newDoc };
      }

      // If damaged / quality -> create TOI to warehouse for damaged products
      if (rejectData.type === 'quality' || rejectData.type === 'damaged') {
        const newDoc = `TOI-${year}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        updatedProducts[idx] = {
          ...item,
          status: 'TOI Created',
          linkedDocs: [...(item.linkedDocs || []), newDoc],
          qtyPending: 0,
          qtyFulfilled: fulfilled,
          rejectReason: rejectData.reason,
          rejectType: rejectData.type,
          source: 'Warehouse (Damaged)',
          remarks: `${baseRemark}\nTOI created for damaged product: ${newDoc}`
        };
        return { type: 'toi', doc: newDoc };
      }

      // Default: just mark rejected
      updatedProducts[idx] = {
        ...item,
        status: 'Rejected',
        rejectReason: rejectData.reason,
        rejectType: rejectData.type,
        remarks: baseRemark
      };
      return { type: 'rejected' };
    };

    if (currentProductIndex === 'bulk') {
      const created = { to: 0, toi: 0, rejected: 0 };
      selectedProducts.forEach(idx => {
        const res = handleSingleReject(idx);
        if (res.type === 'to') created.to++;
        else if (res.type === 'toi') created.toi++;
        else created.rejected++;
      });
      onShowToast(`Rejected ${selectedProducts.length} selected products (${created.to} TO, ${created.toi} TOI)`);
      setSelectedProducts([]);
    } else {
      const res = handleSingleReject(currentProductIndex);
      const msg = res.type === 'to' ? `Created TO ${res.doc}` : res.type === 'toi' ? `Created TOI ${res.doc}` : `Rejected product ${updatedProducts[currentProductIndex].sku}`;
      onShowToast(msg);
    }

    setProductsToShow(updatedProducts);
    setShowRejectModal(false);
    setRejectData({ reason: '', type: 'unavailable' });
  };

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
  const [selectedRows, setSelectedRows] = useState([]);

  // Select all handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredOrders.map(order => order.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Individual row select handler
  const handleRowSelect = (orderId) => {
    setSelectedRows(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

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
    setSelectedRows([]);
  };

  const handleDownload = () => {
    // Export one row per order. If order has multiple products, merge them into a single cell.
    const exportData = filteredOrders.map(order => {
      const items = order.items && order.items.length > 0 ? order.items : (order.product ? [{ product: order.product, sku: order.sku, qtyReq: order.qtyReq ?? order.qty ?? 0, qtyFulfilled: order.qtyFulfilled ?? 0 }] : []);

      const qtyReq = items.reduce((s, it) => s + (it.qtyReq ?? it.qty ?? 0), 0);
      const qtyFulfilled = items.reduce((s, it) => s + (it.qtyFulfilled ?? 0), 0);
      const qtyPending = Math.max(0, qtyReq - qtyFulfilled);

      const products = items.map(it => `${it.product || it.name || '-'} (${it.sku || ''}) x${it.qtyReq ?? it.qty ?? 0}`).join(' | ');

      return {
        id: order.id,
        type: order.type || '',
        docId: order.docId || '',
        webOrder: order.webOrder || '',
        batchId: order.batchId || '',
        status: order.status || '',
        qtyReq,
        qtyFulfilled,
        products,
        qtyPending,
        remarks: order.remarks || '',
        created: order.created || ''
      };
    });

    const headers = {
      id: 'Draft ID', type: 'Type', docId: 'TO/PO ID', webOrder: 'Web Order', batchId: 'Batch ID',
      status: 'Order Status', qtyReq: 'Qty Req.', qtyFulfilled: 'Qty Fulfilled', products: 'Products', qtyPending: 'Qty Pending',
      remarks: 'Order Remarks', created: 'Created'
    };

    exportToCSV(exportData, headers, 'sourcing_export.csv');
    onShowToast(`Exported ${exportData.length} orders to sourcing_export.csv`);
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
              {/* ...existing filter columns... */}
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
                  style={{ border: '2px solid #007bff', boxShadow: '0 0 2px #007bff' }}
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
                  style={{ border: '2px solid #007bff', boxShadow: '0 0 2px #007bff' }}
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
                  style={{ border: '2px solid #007bff', boxShadow: '0 0 2px #007bff' }}
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
                <Col xs={6} sm={6} md={3} lg={2} xl={2} className="d-flex align-items-end">
                  <Button
                    variant="outline-secondary"
                    
                    onClick={handleShowProducts}
                    size="sm"
                    disabled={selectedRows.length === 0}
                  >
                    Show unfullfilled products
                  </Button>
                </Col>
            </Row>
          )}
                    {/* Actions cell removed */}

          {/* Table */}
          <div className="table-responsive" style={{ overflowX: 'auto', minWidth: '1000px' }} ref={tableRef}>
            <Table striped hover className="mb-0" style={{ width: '100%' }}>
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }}>
                    <div className="d-flex align-items-center">
                      <Form.Check
                        type="checkbox"
                        checked={filteredOrders.length > 0 && selectedRows.length === filteredOrders.length}
                        onChange={handleSelectAll}
                        aria-label="Select all rows"
                        className="me-2"
                      />
                      <span className="small">Select All</span>
                    </div>
                  </th>
                  <th style={{ width: '120px' }}>Draft ID</th>
                  <th style={{ width: '80px' }}>Type</th>
                  <th style={{ width: '120px' }}>TO/PO ID</th>
                  <th style={{ width: '120px' }}>Web Order</th>
                  <th style={{ width: '130px' }}>Status</th>
                  <th style={{ width: '200px' }}>TO/PO Tracking</th>
                  <th style={{ width: '150px' }}>Created</th>
                  {/* Actions column removed */}
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
                    const isHighlighted = highlightedTOPO === order.docId;
                    if (highlightedTOPO) {
                      console.log(`Comparing highlightedTOPO "${highlightedTOPO}" with order.docId "${order.docId}":`, isHighlighted);
                    }
                    return (
                    <tr key={order.id}
                      ref={isHighlighted ? highlightedRowRef : null}
                        style={isHighlighted ? { 
                          /* subtle soft shadow only — keep original row bg */
                          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                          zIndex: 2, 
                          position: 'relative'
                        } : {}}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedRows.includes(order.id)}
                          onChange={() => handleRowSelect(order.id)}
                          aria-label={`Select row ${order.id}`}
                        />
                      </td>
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
                      <td>
                        <span className={`badge ${getTrackingBadgeClass(order.trackingStatus)} text-wrap`} style={{ whiteSpace: 'normal', lineHeight: '1.2' }}>
                          {order.trackingStatus || 'Draft Created'}
                        </span>
                      </td>
                      <td className="small">{order.created}</td>
                      {/* Actions cell removed */}
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
        {/* Products Modal */}
        <Modal show={showProductsModal} onHide={() => setShowProductsModal(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Products in Selected Drafts</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {productsToShow.length === 0 ? (
              <div className="text-secondary text-center py-4">No products found in selected drafts.</div>
            ) : (
              <>
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={selectedProducts.length === 0}
                      onClick={handleReassignProducts}
                    >
                      Reassign Selected ({selectedProducts.length})
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={selectedProducts.length === 0}
                      onClick={handleRejectProducts}
                    >
                      Reject Selected ({selectedProducts.length})
                    </Button>
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      const exportData = productsToShow.map(item => {
                        const req = item.qtyReq ?? item.quantity ?? 0;
                        const fulfilled = item.qtyFulfilled ?? 0;
                        const pending = Math.max(0, req - fulfilled);
                        
                        // Create status string showing draft ID: status
                        const statusByDraft = (item.draftIds || []).map((draftId, idx) => {
                          const status = item.statusByDraft?.[draftId] || item.statuses?.[idx] || 'Unknown';
                          return `${draftId}: ${status}`;
                        }).join(' | ');
                        
                        return {
                          sku: item.sku || '',
                          name: item.product || item.name || '',
                          qtyReq: req,
                          qtyFulfilled: fulfilled,
                          qtyPending: pending,
                          draftIds: (item.draftIds || []).join(', '),
                          statusByDraft: statusByDraft
                        };
                      });
                      const headers = {
                        sku: 'SKU',
                        name: 'Name',
                        qtyReq: 'Qty Req.',
                        qtyFulfilled: 'Qty Fulfilled',
                        qtyPending: 'Qty Pending',
                        draftIds: 'Draft IDs',
                        statusByDraft: 'Status by Draft'
                      };
                      exportToCSV(exportData, headers, 'consolidated_products_export.csv');
                      onShowToast(`Exported ${exportData.length} products to consolidated_products_export.csv`);
                    }}
                  >
                    <i className="bi bi-download me-2"></i>
                    Download Excel
                  </Button>
                </div>
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <Form.Check
                          type="checkbox"
                          checked={productsToShow.length > 0 && selectedProducts.length === productsToShow.length}
                          onChange={handleSelectAllProducts}
                          aria-label="Select all products"
                        />
                      </th>
                      <th>SKU</th>
                      <th>Name</th>
                      <th>Qty Req.</th>
                      <th>Qty Fulfilled</th>
                      <th>Qty Pending</th>
                      <th style={{ width: '180px' }}>Draft IDs</th>
                      <th style={{ width: '180px' }}>Status by Draft</th>
                      <th style={{ width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsToShow.map((item, idx) => {
                      const req = item.qtyReq ?? item.quantity ?? 0;
                      const fulfilled = item.qtyFulfilled ?? 0;
                      const pending = Math.max(0, req - fulfilled);
                      return (
                      <tr key={idx}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedProducts.includes(idx)}
                            onChange={() => handleProductSelect(idx)}
                            aria-label={`Select product ${item.sku}`}
                          />
                        </td>
                        <td>{item.sku}</td>
                        <td>{item.product || item.name || '-'}</td>
                        <td className="text-end">{req}</td>
                        <td className="text-end text-success fw-medium">{fulfilled}</td>
                        <td className={`text-end ${pending > 0 ? 'text-warning fw-medium' : 'text-muted'}`}>{pending}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {(item.draftIds || []).map((draftId, dIdx) => (
                              <Button
                                key={dIdx}
                                variant="link"
                                size="sm"
                                className="p-0 text-decoration-none"
                                onClick={() => handleViewDetails(item.orders[dIdx])}
                                title={`View ${draftId} details`}
                              >
                                <span className="badge bg-info text-white">
                                  {draftId}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {(item.draftIds || []).map((draftId, dIdx) => {
                              const status = item.statusByDraft?.[draftId] || item.statuses?.[dIdx] || 'Unknown';
                              return (
                                <div key={dIdx} className="d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>{draftId.split('-')[2]}:</span>
                                  <span className={`badge ${getStatusBadgeClass(status)}`}>
                                    {status}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1 p-1"
                            onClick={() => handleReassignSingleProduct(idx)}
                            title="Reassign"
                          >
                            <i className="bi bi-arrow-repeat"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="p-1"
                            onClick={() => handleRejectSingleProduct(idx)}
                            title="Reject"
                          >
                            <i className="bi bi-x-circle"></i>
                          </Button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </Table>
              </>
          )}
        </Modal.Body>
      </Modal>

      {/* Reassign Modal */}
      <Modal show={showReassignModal} onHide={() => setShowReassignModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reassign Product{currentProductIndex === 'bulk' ? 's' : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p className="text-muted">
              {currentProductIndex === 'bulk' 
                ? `Reassign ${selectedProducts.length} selected products to alternate source`
                : `Reassign product ${productsToShow[currentProductIndex]?.sku || ''} to alternate source`
              }
            </p>
            <div className="alert alert-info mb-3">
              <strong>ℹ Info:</strong> This will redirect the product(s) to alternate sourcing channels.
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-medium">Reassign To</label>
              <Form.Select 
                value={reassignData.source}
                onChange={(e) => setReassignData({...reassignData, source: e.target.value})}
                style={{ border: '2px solid #007bff', boxShadow: '0 0 2px #007bff' }}
              >
                <option value="">Auto-Select</option>
                <option value="DIST-MP-001">DIST-MP-001 - MedPlus Distributor 1</option>
                <option value="DIST-MP-002">DIST-MP-002 - MedPlus Distributor 2</option>
                <option value="DIST-MP-003">DIST-MP-003 - MedPlus Distributor 3</option>
                <option value="VEND-MP-001">VEND-MP-001 - MedPlus Vendor 1</option>
                <option value="VEND-MP-002">VEND-MP-002 - MedPlus Vendor 2</option>
                <option value="Market">Market Purchase</option>
              </Form.Select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">Reason for Reassignment</label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Please provide detailed reason..."
                value={reassignData.reason}
                onChange={(e) => setReassignData({...reassignData, reason: e.target.value})}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReassignModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmReassign}>
            Confirm Reassignment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Product{currentProductIndex === 'bulk' ? 's' : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p className="text-muted">
              {currentProductIndex === 'bulk' 
                ? `Reject ${selectedProducts.length} selected products`
                : `Reject product ${productsToShow[currentProductIndex]?.sku || ''}`
              }
            </p>
            <div className="alert alert-warning mb-3">
              <strong>⚠ Warning:</strong> This action will mark the product(s) as rejected.
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-medium">Rejection Type</label>
              <Form.Select 
                value={rejectData.type}
                onChange={(e) => setRejectData({...rejectData, type: e.target.value})}
                style={{ border: '2px solid #007bff', boxShadow: '0 0 2px #007bff' }}
              >
                <option value="unavailable">Product Unavailable</option>
                <option value="price">Price Issue</option>
                <option value="quality">Quality Concern</option>
                <option value="stock">Out of Stock</option>
                <option value="other">Other</option>
              </Form.Select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">Reason for Rejection</label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Please provide detailed reason..."
                value={rejectData.reason}
                onChange={(e) => setRejectData({...rejectData, reason: e.target.value})}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmReject}>
            Confirm Rejection
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};function ProductLineItemsTable({ items }) {
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
              {/* Actions column removed */}
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
                  {/* Actions cell removed */}
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
