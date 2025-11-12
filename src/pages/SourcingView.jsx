import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Col, Card, Form, Button, Table, Modal } from 'react-bootstrap';
import { exportToCSV, getStatusBadgeClass } from '../utils/utils';

function getTrackingBadgeClass(status) {
  if (!status) return 'bg-secondary';
  
  // Record Status (Draft Created, Partially Fulfilled, Fulfilled)
  if (status === 'Draft Created') return 'bg-secondary';
  if (status === 'Partially Fulfilled') return 'bg-info';
  if (status === 'Fulfilled') return 'bg-success';
  
  // TO/PO Status (Generated, Dispatched, In transit, Received)
  if (status === 'Generated') return 'bg-secondary';
  if (status === 'Dispatched') return 'bg-primary';
  if (status === 'In transit') return 'bg-info';
  if (status === 'Received') return 'bg-success';
  
  // Legacy TO statuses
  if (status.includes('TO Generated')) return 'bg-primary';
  if (status.includes('TO In Transit')) return 'bg-info';
  if (status.includes('TO Received') || status.includes('TO Partially Received')) return 'bg-success';
  if (status.includes('TO Rejected')) return 'bg-danger';
  
  // Legacy PO statuses
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
  if (status === 'Draft Approved') return 'bg-primary';
  if (status.includes('Completed')) return 'bg-success';
  if (status.includes('Partial')) return 'bg-info';
  if (status === 'Rejected') return 'bg-danger';
  
  return 'bg-secondary';
}

const SourcingView = ({ sourcingOrders, setSourcingOrders, onShowToast, onOpenModal, onNavigate, setHighlightedWebOrder, initialFilters = {}, clearFilters, highlightedTOPO, setHighlightedTOPO }) => {
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [productsToShow, setProductsToShow] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productStatusFilter, setProductStatusFilter] = useState('All');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [reassignData, setReassignData] = useState({ source: '', reason: '' });
  const [rejectData, setRejectData] = useState({ reason: '', type: 'unavailable' });
  const highlightedRowRef = useRef(null);

  useEffect(() => {
    if (highlightedTOPO) {
      setTimeout(() => {
        if (highlightedRowRef.current) {
          highlightedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
        }
      }, 100);
      const timer = setTimeout(() => setHighlightedTOPO(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [highlightedTOPO, setHighlightedTOPO]);

  // Handler to show products of selected drafts
  const handleShowProducts = () => {
    buildProductsToShow();
    setSelectedProducts([]);
    setShowProductsModal(true);
  };

  // Helper to build productsToShow from latest sourcingOrders
  const buildProductsToShow = () => {
    // Always recalculate filteredOrders from latest sourcingOrders
    const searchLower = searchTerm.toLowerCase();
    const filteredOrders = sourcingOrders.filter(order => {
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
      const matchesSourceType = (sourceTypeFilter === 'All' || 
        (sourceTypeFilter === 'Store' && order.type === 'TO') ||
        (sourceTypeFilter === 'Distributor' && order.type === 'PO'));
      
      // Market Purchase filter - check if order has products with "NA internally" or "Market Purchase Initiated" status
      const matchesMarketPurchase = !showMarketPurchaseOnly || 
        order.type === 'Market Purchase' ||
        (order.items && order.items.some(item => 
          item.status === 'NA internally' || item.status === 'Market Purchase Initiated'
        ));
      
      return matchesSearch && matchesType && matchesStatus && matchesSourceType && matchesMarketPurchase;
    });
    const selectedOrders = filteredOrders.filter(order => selectedRows.includes(order.id));
    
    // Build a map of webOrder + SKU -> latest retry order
    // This helps us filter out old partially fulfilled drafts when a new retry draft exists
    const retryMap = new Map();
    sourcingOrders.forEach(order => {
      if (order.retry > 0 && order.items) {
        order.items.forEach(item => {
          const key = `${order.webOrder}__${item.sku}`;
          const existing = retryMap.get(key);
          if (!existing || order.retry > existing.retry || 
              (order.retry === existing.retry && new Date(order.created) > new Date(existing.created))) {
            retryMap.set(key, order);
          }
        });
      }
    });
    
    const productMap = new Map();
    selectedOrders.forEach(order => {
      (order.items || []).forEach(item => {
        // Apply product status filter
        if (productStatusFilter !== 'All' && item.status !== productStatusFilter) {
          return; // Skip items that don't match the product status filter
        }
        
        const req = item.qtyReq ?? item.qty ?? 0;
        const fulfilled = item.qtyFulfilled ?? 0;
        const pending = req - fulfilled;
        
        // Skip this order's items if:
        // 1. It has pending quantity (partial fulfillment) AND
        // 2. A newer retry draft exists for the same webOrder + SKU
        const key = `${order.webOrder}__${item.sku}`;
        const newerRetryExists = retryMap.has(key) && retryMap.get(key).id !== order.id;
        
        if (newerRetryExists && pending > 0) {
          // Don't include this item in unfulfilled products since a newer retry draft will handle it
          return;
        }
        
        if (pending > 0 && item.status !== 'Fulfilled') {
          const sku = item.sku;
          if (productMap.has(sku)) {
            const existing = productMap.get(sku);
            existing.qtyReq += req;
            existing.qtyFulfilled += fulfilled;
            existing.qtyPending += pending;
            existing.draftIds.push(order.id);
            existing.orders.push(order);
            existing.statuses.push(item.status);
            existing.statusByDraft[order.id] = item.status;
          } else {
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
    
    setProductsToShow(Array.from(productMap.values()));
  };



  // Product selection handlers
  const handleSelectAllProducts = (e) => {
    if (e.target.checked) {
      // Only select products that have "NA internally" or "Market Purchase Initiated" status
      const naInternallyIndexes = productsToShow
        .map((item, idx) => {
          const hasNAInternally = (item.statuses || []).some(status => 
            status === 'NA internally' || status === 'Market Purchase Initiated'
          );
          return hasNAInternally ? idx : null;
        })
        .filter(idx => idx !== null);
      
      setSelectedProducts(naInternallyIndexes);
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

    // Filter to only process NA internally products
    const validSelectedProducts = currentProductIndex === 'bulk' 
      ? selectedProducts.filter(idx => {
          const item = productsToShow[idx];
          return (item.statuses || []).some(status => 
            status === 'NA internally' || status === 'Market Purchase Initiated'
          );
        })
      : [currentProductIndex];

    // Check if current single product is NA internally
    if (currentProductIndex !== 'bulk') {
      const item = productsToShow[currentProductIndex];
      const hasNAInternally = (item.statuses || []).some(status => 
        status === 'NA internally' || status === 'Market Purchase Initiated'
      );
      if (!hasNAInternally) {
        onShowToast('Reassign action is only available for NA internally products');
        return;
      }
    }

    if (validSelectedProducts.length === 0) {
      onShowToast('No valid NA internally products selected for reassignment');
      return;
    }

    // Update productsToShow immediately for instant UI feedback
    const updatedProductsToShow = [...productsToShow];
    if (currentProductIndex === 'bulk') {
      validSelectedProducts.forEach(idx => {
        updatedProductsToShow[idx] = {
          ...updatedProductsToShow[idx],
          status: 'Pending',
          reassignedTo: reassignData.source || 'Auto-Select',
          reassignReason: reassignData.reason
        };
        // Update statusByDraft for all drafts
        (updatedProductsToShow[idx].draftIds || []).forEach(draftId => {
          updatedProductsToShow[idx].statusByDraft[draftId] = 'Pending';
        });
      });
    } else {
      updatedProductsToShow[currentProductIndex] = {
        ...updatedProductsToShow[currentProductIndex],
        status: 'Pending',
        reassignedTo: reassignData.source || 'Auto-Select',
        reassignReason: reassignData.reason
      };
      // Update statusByDraft for all drafts
      (updatedProductsToShow[currentProductIndex].draftIds || []).forEach(draftId => {
        updatedProductsToShow[currentProductIndex].statusByDraft[draftId] = 'Pending';
      });
    }
    setProductsToShow(updatedProductsToShow);

    setSourcingOrders(prevOrders => prevOrders.map(order => {
      if (!order.items) return order;
      const updatedItems = order.items.map(item => {
        let shouldUpdate = false;
        if (currentProductIndex === 'bulk') {
          validSelectedProducts.forEach(idx => {
            const prod = productsToShow[idx];
            if (
              (item.lineId && prod.lineId && item.lineId === prod.lineId && order.id && prod.draftIds && prod.draftIds.includes(order.id)) ||
              (item.sku === prod.sku && prod.draftIds && prod.draftIds.length === 1 && prod.draftIds[0] === order.id)
            ) {
              shouldUpdate = true;
            }
          });
        } else {
          const prod = productsToShow[currentProductIndex];
          if (
            (item.lineId && prod.lineId && item.lineId === prod.lineId && order.id && prod.draftIds && prod.draftIds.includes(order.id)) ||
            (item.sku === prod.sku && prod.draftIds && prod.draftIds.length === 1 && prod.draftIds[0] === order.id)
          ) {
            shouldUpdate = true;
          }
        }
        if (shouldUpdate) {
          return {
            ...item,
            status: 'Pending',
            reassignedTo: reassignData.source || 'Auto-Select',
            reassignReason: reassignData.reason
          };
        }
        return item;
      });
      return { ...order, items: updatedItems };
    }));
    
    if (currentProductIndex === 'bulk') {
      onShowToast(`Reassigned ${selectedProducts.length} selected products to ${reassignData.source || 'Auto-Select'}`);
      setSelectedProducts([]);
    } else {
      onShowToast(`Reassigned product ${productsToShow[currentProductIndex]?.sku} to ${reassignData.source || 'Auto-Select'}`);
    }
    
    setShowReassignModal(false);
    setReassignData({ source: '', reason: '' });
  };

  const confirmReject = () => {
    if (!rejectData.reason) {
      onShowToast('Please provide a reason for rejection');
      return;
    }
    
    // Update productsToShow immediately for instant UI feedback
    const updatedProductsToShow = [...productsToShow];
    if (currentProductIndex === 'bulk') {
      selectedProducts.forEach(idx => {
        updatedProductsToShow[idx] = {
          ...updatedProductsToShow[idx],
          status: 'Rejected',
          rejectReason: rejectData.reason,
          rejectType: rejectData.type,
          remarks: `${updatedProductsToShow[idx].remarks || ''}\n[${new Date().toLocaleString()}] Rejected: ${rejectData.reason}`
        };
        // Update statusByDraft for all drafts
        (updatedProductsToShow[idx].draftIds || []).forEach(draftId => {
          updatedProductsToShow[idx].statusByDraft[draftId] = 'Rejected';
        });
      });
    } else {
      updatedProductsToShow[currentProductIndex] = {
        ...updatedProductsToShow[currentProductIndex],
        status: 'Rejected',
        rejectReason: rejectData.reason,
        rejectType: rejectData.type,
        remarks: `${updatedProductsToShow[currentProductIndex].remarks || ''}\n[${new Date().toLocaleString()}] Rejected: ${rejectData.reason}`
      };
      // Update statusByDraft for all drafts
      (updatedProductsToShow[currentProductIndex].draftIds || []).forEach(draftId => {
        updatedProductsToShow[currentProductIndex].statusByDraft[draftId] = 'Rejected';
      });
    }
    setProductsToShow(updatedProductsToShow);
    
    setSourcingOrders(prevOrders => prevOrders.map(order => {
      if (!order.items) return order;
      const updatedItems = order.items.map(item => {
        let shouldUpdate = false;
        if (currentProductIndex === 'bulk') {
          selectedProducts.forEach(idx => {
            const prod = productsToShow[idx];
            if (
              (item.lineId && prod.lineId && item.lineId === prod.lineId && order.id && prod.draftIds && prod.draftIds.includes(order.id)) ||
              (item.sku === prod.sku && prod.draftIds && prod.draftIds.length === 1 && prod.draftIds[0] === order.id)
            ) {
              shouldUpdate = true;
            }
          });
        } else {
          const prod = productsToShow[currentProductIndex];
          if (
            (item.lineId && prod.lineId && item.lineId === prod.lineId && order.id && prod.draftIds && prod.draftIds.includes(order.id)) ||
            (item.sku === prod.sku && prod.draftIds && prod.draftIds.length === 1 && prod.draftIds[0] === order.id)
          ) {
            shouldUpdate = true;
          }
        }
        if (shouldUpdate) {
          return {
            ...item,
            status: 'Rejected',
            rejectReason: rejectData.reason,
            rejectType: rejectData.type,
            remarks: `${item.remarks || ''}\n[${new Date().toLocaleString()}] Rejected: ${rejectData.reason}`
          };
        }
        return item;
      });
      return { ...order, items: updatedItems };
    }));
    
    if (currentProductIndex === 'bulk') {
      onShowToast(`Rejected ${selectedProducts.length} selected products`);
      setSelectedProducts([]);
    } else {
      onShowToast(`Rejected product ${productsToShow[currentProductIndex]?.sku}`);
    }
    
    setShowRejectModal(false);
    setRejectData({ reason: '', type: 'unavailable' });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('All');
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartModalData] = useState({ title: '', content: null });
  const [showRetryOnly, setShowRetryOnly] = useState(false);
  const [showMarketPurchaseOnly, setShowMarketPurchaseOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const tableRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);

  // Select all handler
  const handleSelectAll = () => {
    if (selectedRows.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredOrders.map(order => order.id));
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
    
    // Market Purchase filter (also triggered by NA Internally button)
    // Check if order is Market Purchase type OR has products with "NA internally" or "Market Purchase Initiated" status
    const matchesMarketPurchase = !showMarketPurchaseOnly || 
      order.type === 'Market Purchase' ||
      (order.items && order.items.some(item => 
        item.status === 'NA internally' || item.status === 'Market Purchase Initiated'
      ));
    
    // Product Status filter - filter by specific product status
    const matchesProductStatus = productStatusFilter === 'All' || 
      (order.items && order.items.some(item => item.status === productStatusFilter));
    
    return matchesSearch && matchesType && matchesStatus && matchesDateRange && matchesSourceType && matchesRetry && matchesMarketPurchase && matchesProductStatus;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setStatusFilter('All');
    setStartDateFilter('');
    setEndDateFilter('');
    setSourceTypeFilter('All');
    setShowRetryOnly(false);
    setShowMarketPurchaseOnly(false);
    setProductStatusFilter('All');
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
  <div className="px-2 px-md-3">
      <h2 className="mb-3 mb-md-4 fw-bold fs-4 fs-md-3">TO/PO Tracking Dashboard</h2>
     

      {/* Table */}
      <Card>
        <Card.Body className="p-2 p-md-3">
          {/* Filter Toggle Button */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="d-flex align-items-center justify-content-center gap-2"
            >
              <i className={`bi bi-funnel${showFilters ? '-fill' : ''}`}></i>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              <i className={`bi bi-chevron-${showFilters ? 'up' : 'down'}`}></i>
            </Button>
            <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
              <div className="text-muted small text-center text-sm-start">
                Showing {filteredOrders.length} of {sourcingOrders.length} records
              </div>
              <Button variant="success" onClick={handleDownload} size="sm" className="d-flex align-items-center justify-content-center">
                <i className="bi bi-download me-2"></i>
                Download Excel
              </Button>
            </div>
          </div>

          {/* Filters - Collapsible */}
          {showFilters && (
            <>
            <Row className="g-2 g-md-3 mb-3" style={{ 
              animation: 'slideDown 0.3s ease-out',
              borderBottom: '1px solid #dee2e6',
              paddingBottom: '1rem'
            }}>
              <Col xs={12}>
                <h6 className="mb-0 fw-medium text-secondary small">Filters & Search</h6>
              </Col>
              <Col xs={12} md={6} lg={4} xl={3}>
                <Form.Label className="small text-muted mb-1">Search</Form.Label>
                <Form.Control
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, Web Order, Source..."
                  size="sm"
                />
              </Col>
              {/* ...existing filter columns... */}
              <Col xs={6} sm={6} md={3} lg={2} xl={2}>
                <Form.Label className="small text-muted mb-1">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  size="sm"
                />
              </Col>
              <Col xs={6} sm={6} md={3} lg={2} xl={2}>
                <Form.Label className="small text-muted mb-1">End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  size="sm"
                />
              </Col>
              <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                <Form.Label className="small text-muted mb-1">Source Type</Form.Label>
                <Form.Select
                  value={sourceTypeFilter}
                  onChange={(e) => setSourceTypeFilter(e.target.value)}
                  size="sm"
                  style={{ border: '2px solid #007bff', boxShadow: '0 0 2px #007bff' }}
                >
                  <option value="All">All Sources</option>
                  <option value="Store">Store (TO)</option>
                  <option value="Distributor">Distributor (PO)</option>
                </Form.Select>
              </Col>
              <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                <Form.Label className="small text-muted mb-1">Order Type</Form.Label>
                <Form.Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  size="sm"
                  style={{ border: '2px solid #007bff', boxShadow: '0 0 2px #007bff' }}
                >
                  <option value="All">All Types</option>
                  <option value="TO">TO</option>
                  <option value="PO">PO</option>
                  <option value="Market Purchase">Market Purchase</option>
                </Form.Select>
              </Col>
              <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                <Form.Label className="small text-muted mb-1">TO/PO Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="sm"
                  style={{ border: '2px solid #007bff', boxShadow: '0 0 2px #007bff' }}
                >
                  <option value="All">All</option>
                  <option value="Generated">Generated</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="In transit">In transit</option>
                  <option value="Received">Received</option>
                </Form.Select>
              </Col>
              <Col xs={12} sm={6} md={4} lg={3} xl={2} className="d-flex align-items-end">
                <Button variant="outline-secondary" onClick={handleClearFilters} className="w-100" size="sm">
                  Clear All
                </Button>
              </Col>
            </Row>

            <Row className="g-2 mb-3 mt-2">
              <Col xs={6} sm={4} md={3} lg={2} xl={2}>
                <Button 
                  variant={showMarketPurchaseOnly ? "warning" : "outline-warning"} 
                  onClick={() => setShowMarketPurchaseOnly(!showMarketPurchaseOnly)}
                  className="w-100"
                  size="sm"
                >
                  {showMarketPurchaseOnly ? "✓ " : ""}NA Internally
                </Button>
              </Col>
              <Col xs={6} sm={4} md={3} lg={2} xl={2}>
                <Button 
                  variant={showRetryOnly ? "info" : "outline-info"} 
                  onClick={() => setShowRetryOnly(!showRetryOnly)}
                  className="w-100"
                  size="sm"
                >
                  {showRetryOnly ? "✓ " : ""}Retried Orders
                </Button>
              </Col>
              <Col xs={12} sm={4} md={3} lg={2} xl={2}>
                <Button 
                  variant="outline-danger"
                  onClick={handleShowProducts}
                  className="w-100"
                  size="sm"
                  disabled={selectedRows.length === 0}
                >
                  Unfulfilled Products
                </Button>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4} xl={3}>
                <Form.Select
                  value={productStatusFilter}
                  onChange={(e) => setProductStatusFilter(e.target.value)}
                  size="sm"
                >
                  <option value="All">All Product Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Draft Created">Draft Created</option>
                  <option value="TO Created">TO Created</option>
                  <option value="PO Created">PO Created</option>
                  <option value="Partially Fulfilled Internally">Partially Fulfilled Internally</option>
                  <option value="Fully Fulfilled Internally">Fully Fulfilled Internally</option>
                  <option value="Partially Fulfilled">Partially Fulfilled</option>
                  <option value="Completely Fulfilled">Completely Fulfilled</option>
                  <option value="NA internally">NA internally</option>
                  <option value="Market Purchase Initiated">Market Purchase Initiated</option>
                  <option value="NA in Market">NA in Market</option>
                </Form.Select>
              </Col>
            </Row>
            </>
          )}



          {/* Table */}
          <div className="table-responsive" ref={tableRef}>
            <Table striped hover className="mb-0" size="sm" style={{ minWidth: '900px' }}>
              <thead className="table-light">
                <tr>
                  <th style={{ width: '120px', minWidth: '120px' }}>
                    <Button
                      variant={selectedRows.length === filteredOrders.length && filteredOrders.length > 0 ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={handleSelectAll}
                      className="w-100"
                    >
                      {selectedRows.length === filteredOrders.length && filteredOrders.length > 0 ? "Deselect All" : "Select All"}
                    </Button>
                  </th>
                  <th style={{ minWidth: '120px' }}>Record ID</th>
                  <th style={{ minWidth: '80px' }}>Order Type</th>
                  <th style={{ minWidth: '120px' }}>TO/PO ID</th>
                  <th style={{ minWidth: '120px' }}>Linked Web Order No</th>
                  <th style={{ minWidth: '130px' }}>Source Location</th>
                  <th style={{ minWidth: '130px' }}>Destination Location</th>
                  <th style={{ minWidth: '150px' }}>Record Status</th>
                  <th style={{ minWidth: '150px' }}>TO/PO Status</th>
                  <th style={{ minWidth: '150px' }}>Created Date/Time</th>
                  <th style={{ minWidth: '100px' }}>Created By</th>
                  <th style={{ minWidth: '150px' }}>Remarks/Reason</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center text-secondary py-5">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, idx) => {
                    const isHighlighted = highlightedTOPO === order.docId;
                    if (highlightedTOPO) {
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
                      <td className="small">{order.source || '-'}</td>
                      <td className="small">{order.destination || '-'}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.recordStatus || order.status)}`}>
                          {order.recordStatus || order.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getTrackingBadgeClass(order.status || order.trackingStatus)} text-wrap`} style={{ whiteSpace: 'normal', lineHeight: '1.2' }}>
                          {order.status || order.trackingStatus || 'Generated'}
                        </span>
                      </td>
                      <td className="small">{order.created}</td>
                      <td className="small">{order.createdBy || 'System'}</td>
                      <td className="small text-muted">{order.remarks || '-'}</td>
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
                      
                      // Check if any of the product's statuses includes "NA internally" or "Market Purchase Initiated"
                      const hasNAInternally = (item.statuses || []).some(status => 
                        status === 'NA internally' || status === 'Market Purchase Initiated'
                      );
                      
                      return (
                      <tr key={idx}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedProducts.includes(idx)}
                            onChange={() => handleProductSelect(idx)}
                            aria-label={`Select product ${item.sku}`}
                            disabled={!hasNAInternally}
                            title={hasNAInternally ? "" : "Selection only available for NA internally products"}
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
                          {(() => {
                            // Check if any of the product's statuses includes "NA internally"
                            const hasNAInternally = (item.statuses || []).some(status => 
                              status === 'NA internally' || status === 'Market Purchase Initiated'
                            );
                            
                            return (
                              <>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-1 p-1"
                                  onClick={() => handleReassignSingleProduct(idx)}
                                  title={hasNAInternally ? "Reassign" : "Actions only available for NA internally products"}
                                  disabled={!hasNAInternally}
                                >
                                  <i className="bi bi-arrow-repeat"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="p-1"
                                  onClick={() => handleRejectSingleProduct(idx)}
                                  title={hasNAInternally ? "Reject" : "Actions only available for NA internally products"}
                                  disabled={!hasNAInternally}
                                >
                                  <i className="bi bi-x-circle"></i>
                                </Button>
                              </>
                            );
                          })()}
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
