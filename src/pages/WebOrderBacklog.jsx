import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Form, Button, Table, Carousel, Modal, Badge } from 'react-bootstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import { formatDate, dateDiffInDays, exportToCSV, getStatusBadgeClass } from '../utils/utils';
import ActionDropdown from '../components/ActionDropdown';

const WebOrderBacklog = ({ webOrders, setWebOrders, onShowToast, onOpenModal, highlightedWebOrder, setHighlightedWebOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [kpiViewMode, setKpiViewMode] = useState('wrap'); // 'wrap' or 'slider'
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartModalData, setChartModalData] = useState({ title: '', content: null });
  const highlightedRowRef = useRef(null);

  // Effect to handle highlighted web order
  useEffect(() => {
    if (highlightedWebOrder) {
      console.log('Highlighting web order:', highlightedWebOrder);
      
      // Clear any filters to ensure the row is visible
      setSearchTerm('');
      setStatusFilter('All');
      setSourceFilter('All');
      setStartDateFilter('');
      setEndDateFilter('');
      
      // Wait for filters to clear and table to re-render, then scroll
      setTimeout(() => {
        if (highlightedRowRef.current) {
          highlightedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      // Clear the highlight after 1 second
      const timer = setTimeout(() => {
        setHighlightedWebOrder(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [highlightedWebOrder, setHighlightedWebOrder]);

  // Drag handlers for carousel
  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragStartX(e.type.includes('mouse') ? e.pageX : e.touches[0].pageX);
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    
    const endX = e.type.includes('mouse') ? e.pageX : e.changedTouches[0].pageX;
    const diff = dragStartX - endX;
    
    // Swipe threshold
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped left - next slide
        setCarouselIndex((prev) => (prev + 1) % 3); // 3 slides for Web Orders
      } else {
        // Swiped right - previous slide
        setCarouselIndex((prev) => (prev - 1 + 3) % 3);
      }
    }
    
    setIsDragging(false);
  };

  const handleChartClick = (chartType) => {
    let title = '';
    let content = null;

    if (chartType === 'ageing') {
      const pendingFiltered = filteredOrders.filter(o => {
        const status = o.overallStatus || o.status;
        return status === 'Pending Sourcing' || status === 'Partially Fulfilled';
      });
      
      const age0to3 = pendingFiltered.filter(o => o.age >= 0 && o.age <= 3);
      const age3to7 = pendingFiltered.filter(o => o.age > 3 && o.age <= 7);
      const age7plus = pendingFiltered.filter(o => o.age > 7);

      title = 'Pending Order Ageing - Detailed Breakdown';
      content = (
        <div>
          <Row className="mb-3">
            <Col md={4}>
              <div className="p-3 bg-info bg-opacity-10 rounded">
                <h6 className="text-info">0-3 Days</h6>
                <h4>{age0to3.length} Orders</h4>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 bg-warning bg-opacity-10 rounded">
                <h6 className="text-warning">3-7 Days</h6>
                <h4>{age3to7.length} Orders</h4>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 bg-danger bg-opacity-10 rounded">
                <h6 className="text-danger">&gt;7 Days</h6>
                <h4>{age7plus.length} Orders</h4>
              </div>
            </Col>
          </Row>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Age (Days)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...age7plus, ...age3to7, ...age0to3].slice(0, 15).map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>
                    <Badge bg={order.age > 7 ? 'danger' : order.age > 3 ? 'warning' : 'info'} text="dark">
                      {order.age} days
                    </Badge>
                  </td>
                  <td><Badge bg="warning" text="dark">{order.overallStatus || order.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    } else if (chartType === 'source') {
      const storeOrders = filteredOrders.filter(o => {
        if (o.items) return o.items.some(item => item.source.includes('Store'));
        return o.source && o.source.includes('Store');
      });
      const distOrders = filteredOrders.filter(o => {
        if (o.items) return o.items.some(item => item.source.includes('Distributor'));
        return o.source && o.source.includes('Distributor');
      });
      const pendingOrders = filteredOrders.filter(o => {
        if (o.items) return o.items.some(item => item.source.includes('Pending'));
        return o.source && o.source.includes('Pending');
      });

      title = 'Source Contribution - Detailed Analysis';
      content = (
        <div>
          <Row className="mb-3">
            <Col md={4}>
              <div className="p-3 bg-primary bg-opacity-10 rounded">
                <h6 className="text-primary">Store (TO)</h6>
                <h4>{storeOrders.length} Orders</h4>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 bg-info bg-opacity-10 rounded">
                <h6 className="text-info">Distributor (PO)</h6>
                <h4>{distOrders.length} Orders</h4>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 bg-warning bg-opacity-10 rounded">
                <h6 className="text-warning">Pending</h6>
                <h4>{pendingOrders.length} Orders</h4>
              </div>
            </Col>
          </Row>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 15).map(order => {
                const source = order.items ? order.items[0].source : order.source;
                return (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>
                      <Badge bg={source.includes('Store') ? 'primary' : source.includes('Distributor') ? 'info' : 'warning'} text="dark">
                        {source}
                      </Badge>
                    </td>
                    <td><Badge bg={getStatusBadgeClass(order.overallStatus || order.status)} text="dark">{order.overallStatus || order.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      );
    }

    setChartModalData({ title, content });
    setShowChartModal(true);
  };

  const calculateKPIs = () => {
    const total = webOrders.length;
    const completed = webOrders.filter(o => (o.overallStatus || o.status) === 'Completed');
    const completedCount = completed.length;
    
    let totalDays = 0;
    completed.forEach(o => {
      const createdDate = new Date(o.created);
      const updatedDate = new Date(o.lastUpdated);
      totalDays += dateDiffInDays(createdDate, updatedDate);
    });

    const fulfilledOrders = webOrders.filter(o => {
      const status = o.overallStatus || o.status;
      return status === 'Completed' || status === 'Partially Fulfilled';
    });
    
    return {
      total,
      pending: webOrders.filter(o => (o.overallStatus || o.status) === 'Pending Sourcing').length,
      partial: webOrders.filter(o => (o.overallStatus || o.status) === 'Partially Fulfilled').length,
      completed: completedCount,
      exception: webOrders.filter(o => {
        const status = o.overallStatus || o.status;
        return status === 'Exception' || status === 'Rejected';
      }).length,
      rate: total > 0 ? ((fulfilledOrders.length / total) * 100).toFixed(0) : 0,
      avgTime: completedCount > 0 ? (totalDays / completedCount).toFixed(1) : 0
    };
  };

  const kpis = calculateKPIs();

  // Filter orders
  const filteredOrders = webOrders.filter(order => {
    const status = order.overallStatus || order.status;
    const source = order.items ? order.items.map(i => i.source).join(' ') : order.source;
    const orderDate = new Date(order.created);
    
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      order.id.toLowerCase().includes(searchLower) ||
      order.customer?.toLowerCase().includes(searchLower) ||
      (order.items && order.items.some(item => 
        item.product.toLowerCase().includes(searchLower) ||
        item.sku.toLowerCase().includes(searchLower)
      ));
    
    const matchesStatus = (statusFilter === 'All' || status === statusFilter);
    const matchesSource = (sourceFilter === 'All' || source.includes(sourceFilter));
    
    // Date range filter
    let matchesDateRange = true;
    if (startDateFilter) {
      const startDate = new Date(startDateFilter);
      matchesDateRange = matchesDateRange && orderDate >= startDate;
    }
    if (endDateFilter) {
      const endDate = new Date(endDateFilter);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      matchesDateRange = matchesDateRange && orderDate <= endDate;
    }
    
    return matchesSearch && matchesStatus && matchesSource && matchesDateRange;
  });

  // Chart Data
  const pendingOrders = webOrders.filter(o => {
    const status = o.overallStatus || o.status;
    return status === 'Pending Sourcing' || status === 'Partially Fulfilled';
  });
  const ageingData = {
    labels: ['0-3 Days', '3-7 Days', '>7 Days'],
    datasets: [{
      label: 'Pending Orders',
      data: [
        pendingOrders.filter(o => o.age >= 0 && o.age <= 3).length,
        pendingOrders.filter(o => o.age > 3 && o.age <= 7).length,
        pendingOrders.filter(o => o.age > 7).length
      ],
      backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(220, 38, 38, 0.7)'],
      borderWidth: 1
    }]
  };

  const sourceData = {
    labels: ['Store (TO)', 'Distributor (PO)', 'Pending', 'Other'],
    datasets: [{
      data: [
        webOrders.filter(o => {
          if (o.items) {
            return o.items.some(item => item.source && item.source.includes('Store'));
          }
          return o.source && o.source.includes('Store');
        }).length,
        webOrders.filter(o => {
          if (o.items) {
            return o.items.some(item => item.source && item.source.includes('Distributor'));
          }
          return o.source && o.source.includes('Distributor');
        }).length,
        webOrders.filter(o => {
          if (o.items) {
            return o.items.some(item => item.source && item.source.includes('Pending'));
          }
          return o.source && o.source.includes('Pending');
        }).length,
        webOrders.filter(o => {
          if (o.items) {
            return o.items.every(item => item.source && !item.source.includes('Store') && !item.source.includes('Distributor') && !item.source.includes('Pending'));
          }
          return o.source && !o.source.includes('Store') && !o.source.includes('Distributor') && !o.source.includes('Pending');
        }).length
      ],
      backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(107, 114, 128, 0.7)'],
      hoverOffset: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { padding: 20 } } }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setSourceFilter('All');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const handleDownload = () => {
    const headers = {
      id: 'ID', customer: 'Customer', product: 'Product', qty: 'Qty Req.', 
      qtyFulfilled: 'Qty Fulfilled', status: 'Status', source: 'Source', 
      linkedDoc: 'Linked Doc', created: 'Created', lastUpdated: 'Last Updated', 
      age: 'Age', retry: 'Retry', remarks: 'Remarks'
    };
    exportToCSV(webOrders, headers, 'web_orders_export.csv');
    onShowToast('Web Orders exported as web_orders_export.csv');
  };

  const handleViewDetails = (order) => {
    const remarksHTML = order.remarks ? 
      `<div class="mb-3"><div class="fw-medium text-secondary mb-1">Remarks / Reason</div><div class="alert alert-info mb-0">${order.remarks}</div></div>` : '';
    
    // Build products table for multi-item orders or single product display
    let productsHTML = '';
    if (order.items && order.items.length > 0) {
      productsHTML = `
        <div class="mb-3">
          <div class="fw-medium text-secondary mb-2">Products (${order.items.length} item${order.items.length > 1 ? 's' : ''})</div>
          <div class="table-responsive">
            <table class="table table-sm table-bordered mb-0">
              <thead class="table-light">
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty Req.</th>
                  <th>Fulfilled</th>
                  <th>Pending</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Linked Docs</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.product || '-'}</td>
                    <td>${item.sku || '-'}</td>
                    <td>${item.qty || 0}</td>
                    <td>${item.qtyFulfilled || 0}</td>
                    <td>${item.qtyPending || 0}</td>
                    <td><span class="badge ${getStatusBadgeClass(item.status)}">${item.status || 'Unknown'}</span></td>
                    <td>${item.source || '-'}</td>
                    <td>${item.linkedDocs?.join(', ') || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      // Legacy single product display
      productsHTML = `
        <div class="mb-3">
          <div class="fw-medium text-secondary mb-2">Product Details</div>
          <div class="row g-2">
            <div class="col-sm-6"><div class="text-muted small">Product</div><div>${order.product || '-'}</div></div>
            <div class="col-sm-6"><div class="text-muted small">SKU</div><div>${order.sku || '-'}</div></div>
            <div class="col-sm-4"><div class="text-muted small">Qty Requested</div><div>${order.qty || 0}</div></div>
            <div class="col-sm-4"><div class="text-muted small">Qty Fulfilled</div><div>${order.qtyFulfilled || 0}</div></div>
            <div class="col-sm-4"><div class="text-muted small">Qty Pending</div><div>${order.qtyPending || 0}</div></div>
          </div>
        </div>
      `;
    }
    
    // Calculate totals
    const totalQty = order.items ? order.items.reduce((sum, item) => sum + item.qty, 0) : order.qty;
    const totalFulfilled = order.items ? order.items.reduce((sum, item) => sum + item.qtyFulfilled, 0) : order.qtyFulfilled;
    const totalPending = order.items ? order.items.reduce((sum, item) => sum + item.qtyPending, 0) : order.qtyPending;
    const status = order.overallStatus || order.status;
    const sources = order.items ? order.items.map(item => item.source).filter((v, i, a) => a.indexOf(v) === i).join(', ') : order.source;
    const linkedDocs = order.items ? order.items.flatMap(item => item.linkedDocs).join(', ') || '-' : order.linkedDoc;
    
    const content = `
      <div class="mb-3">
        <div class="row g-2">
          <div class="col-sm-6"><div class="text-muted small">Customer</div><div class="fw-medium">${order.customer || '-'}</div></div>
          <div class="col-sm-6"><div class="text-muted small">Order Status</div><div><span class="badge ${getStatusBadgeClass(status)}">${status || 'Unknown'}</span></div></div>
        </div>
      </div>
      
      ${productsHTML}
      
      <div class="mb-3">
        <div class="fw-medium text-secondary mb-2">Summary</div>
        <div class="row g-2">
          <div class="col-sm-4"><div class="text-muted small">Total Qty Requested</div><div class="fw-medium">${totalQty || 0}</div></div>
          <div class="col-sm-4"><div class="text-muted small">Total Fulfilled</div><div class="fw-medium text-success">${totalFulfilled || 0}</div></div>
          <div class="col-sm-4"><div class="text-muted small">Total Pending</div><div class="fw-medium text-warning">${totalPending || 0}</div></div>
        </div>
      </div>
      
      <div class="mb-3">
        <div class="fw-medium text-secondary mb-2">Order Information</div>
        <div class="row g-2">
          <div class="col-sm-6"><div class="text-muted small">Source(s)</div><div>${sources || '-'}</div></div>
          <div class="col-sm-6"><div class="text-muted small">Linked Document(s)</div><div>${linkedDocs || '-'}</div></div>
          <div class="col-sm-4"><div class="text-muted small">Created</div><div>${formatDate(order.created)}</div></div>
          <div class="col-sm-4"><div class="text-muted small">Last Updated</div><div>${formatDate(order.lastUpdated)}</div></div>
          <div class="col-sm-4"><div class="text-muted small">Age</div><div>${order.age || 0} days</div></div>
          <div class="col-sm-6"><div class="text-muted small">Retries</div><div>${order.retry || 0}</div></div>
          <div class="col-sm-6"><div class="text-muted small">Total Items</div><div>${order.totalItems || 1}</div></div>
        </div>
      </div>
      
      ${remarksHTML}
    `;
    
    onOpenModal(`Web Order Details: ${order.id}`, content, 'modal-xl');
  };

  // Get available actions based on order status
  const getOrderActions = (order) => {
    const status = order.overallStatus || order.status;
    const actions = [];

    // Always show View Details first
    actions.push({ label: 'View Details', value: 'view' });

    // Add status-specific actions based on requirements
    if (status === 'Pending Sourcing' || status === 'Pending') {
      // Pending orders can be processed or rejected/reassigned
      actions.push({ label: 'Process Request', value: 'process_request' });
      actions.push({ label: 'Reject / Reassign', value: 'reject_reassign' });
    } 
    else if (status === 'Partially Fulfilled') {
      // Partially fulfilled can be processed further or manually closed if needed
      actions.push({ label: 'Process Request', value: 'process_request' });
      actions.push({ label: 'Manual Closure', value: 'manual_closure' });
    } 
    else if (status === 'TO Created' || status === 'PO Created') {
      // TO/PO created orders should NOT have manual closure option
      // These are in the fulfilment pipeline and should complete normally
      // Only view details available (already added above)
    } 
    else if (status === 'Completed') {
      // Only View Details for completed orders
    } 
    else if (status === 'Exception' || status === 'Rejected') {
      // Exception/Rejected orders can be retried, reassigned, or manually closed
      actions.push({ label: 'Process Request', value: 'process_request' });
      actions.push({ label: 'Reject / Reassign', value: 'reject_reassign' });
      actions.push({ label: 'Manual Closure', value: 'manual_closure' });
    }

    return actions;
  };

  // Handle action selection
  const handleActionSelect = (orderId, action) => {
    const order = webOrders.find(o => o.id === orderId);
    const status = order.overallStatus || order.status;
    
    switch (action) {
      case 'view':
        handleViewDetails(order);
        break;
        
      case 'view_items':
        // Show line items modal with all product details
        handleViewDetails(order);
        break;

      case 'view_docs':
        // View linked TO/PO documents
        const linkedDocs = order.items ? order.items.flatMap(item => item.linkedDocs || []) : (order.linkedDoc ? [order.linkedDoc] : []);
        const docsHTML = linkedDocs.length > 0 ? linkedDocs.map(doc => `
          <tr>
            <td><a href="#" class="text-decoration-none fw-medium">${doc}</a></td>
            <td><span class="badge ${doc.startsWith('TO') ? 'bg-primary' : 'bg-success'}">${doc.startsWith('TO') ? 'Transfer Order' : 'Purchase Order'}</span></td>
            <td><span class="badge bg-info">In Progress</span></td>
            <td>
              ${doc.startsWith('TO') ? 'Store Transfer' : 'Distributor Purchase'}
            </td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick="alert('Opening ${doc} details...')">View Document</button>
            </td>
          </tr>
        `).join('') : '<tr><td colspan="5" class="text-center text-muted py-3">No linked documents found</td></tr>';
        
        const docsContent = `
          <div class="mb-3">
            <p class="text-muted">Linked TO/PO documents for order <strong>${order.id}</strong></p>
          </div>
          <table class="table table-sm table-bordered table-hover">
            <thead class="table-light">
              <tr>
                <th>Document ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>${docsHTML}</tbody>
          </table>
        `;
        onOpenModal(`Linked Documents - ${order.id}`, docsContent, 'modal-xl');
        break;
        
      case 'process_request':
        // Process Request - Trigger or edit pending stock requests
        const processContent = `
          <div class="mb-3">
            <p class="text-muted">Process stock request for order <strong>${order.id}</strong></p>
            <div class="alert alert-info mb-3">
              <div class="row">
                <div class="col-6"><strong>Customer:</strong> ${order.customer}</div>
                <div class="col-6"><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(status)}">${status}</span></div>
                <div class="col-6"><strong>Total Items:</strong> ${order.totalItems}</div>
                <div class="col-6"><strong>Qty Pending:</strong> ${order.items ? order.items.reduce((sum, item) => sum + item.qtyPending, 0) : order.qtyPending || 0}</div>
              </div>
            </div>
            
            <div class="mb-3">
              <h6 class="fw-bold mb-3">Select Processing Option:</h6>
              <div class="list-group">
                <label class="list-group-item list-group-item-action">
                  <input class="form-check-input me-2" type="radio" name="processOption" value="create_to" checked>
                  <div>
                    <div class="fw-medium">Create Transfer Order (TO)</div>
                    <small class="text-muted">Source from store inventory</small>
                  </div>
                </label>
                <label class="list-group-item list-group-item-action">
                  <input class="form-check-input me-2" type="radio" name="processOption" value="create_po">
                  <div>
                    <div class="fw-medium">Create Purchase Order (PO)</div>
                    <small class="text-muted">Source from distributor/vendor</small>
                  </div>
                </label>
                <label class="list-group-item list-group-item-action">
                  <input class="form-check-input me-2" type="radio" name="processOption" value="auto_source">
                  <div>
                    <div class="fw-medium">Auto-Source (System Recommended)</div>
                    <small class="text-muted">Let system determine best source</small>
                  </div>
                </label>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Priority Level</label>
              <select class="form-select">
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Processing Notes</label>
              <textarea class="form-control" rows="2" placeholder="Optional notes for processing team..."></textarea>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" onclick="document.querySelector('.modal .btn-close').click()">Cancel</button>
            <button class="btn btn-success" onclick="alert('Request processed successfully. TO/PO will be created.'); document.querySelector('.modal .btn-close').click();">Process Request</button>
          </div>
        `;
        onOpenModal('Process Stock Request', processContent, 'modal-lg');
        break;
        
      case 'reject_reassign':
        // Reject / Reassign - Mark orders for distributor/vendor sourcing
        const rejectContent = `
          <div class="mb-3">
            <p class="text-muted">Reject or reassign order <strong>${order.id}</strong></p>
            <div class="alert alert-warning mb-3">
              <strong>⚠ Note:</strong> This action will redirect the order to alternate sourcing channels.
            </div>
            
            <div class="mb-3">
              <label class="form-label fw-medium">Action Type</label>
              <select class="form-select" id="rejectActionType">
                <option value="reassign_distributor">Reassign to Distributor</option>
                <option value="reassign_vendor">Reassign to Vendor</option>
                <option value="reject_unavailable">Reject - Product Unavailable</option>
                <option value="reject_price">Reject - Price Issue</option>
                <option value="reject_quality">Reject - Quality Concern</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Preferred Source (if reassigning)</label>
              <select class="form-select">
                <option value="">Auto-Select</option>
                <option value="DIST-MP-001">DIST-MP-001 - MedPlus Distributor 1</option>
                <option value="DIST-MP-002">DIST-MP-002 - MedPlus Distributor 2</option>
                <option value="DIST-MP-003">DIST-MP-003 - MedPlus Distributor 3</option>
                <option value="VEND-MP-001">VEND-MP-001 - MedPlus Vendor 1</option>
                <option value="VEND-MP-002">VEND-MP-002 - MedPlus Vendor 2</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Reason for Rejection/Reassignment</label>
              <textarea class="form-control" rows="3" placeholder="Please provide detailed reason..." required></textarea>
            </div>

            <div class="mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="notifyCustomer">
                <label class="form-check-label" for="notifyCustomer">
                  Notify customer about sourcing change
                </label>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" onclick="document.querySelector('.modal .btn-close').click()">Cancel</button>
            <button class="btn btn-warning" onclick="alert('Order reassigned successfully'); document.querySelector('.modal .btn-close').click();">Confirm Action</button>
          </div>
        `;
        onOpenModal('Reject / Reassign Order', rejectContent, 'modal-lg');
        break;
        
      case 'manual_closure':
        // Manual Closure - For manually completed cases
        const closureContent = `
          <div class="mb-3">
            <p class="text-muted">Manually close order <strong>${order.id}</strong></p>
            <div class="alert alert-danger mb-3">
              <strong>⚠ Warning:</strong> Manual closure should only be used when order is completed outside the system. This action cannot be undone.
            </div>
            
            <div class="mb-3">
              <h6 class="fw-bold mb-2">Order Summary</h6>
              <div class="row g-2 mb-3">
                <div class="col-sm-6">
                  <div class="text-muted small">Customer</div>
                  <div class="fw-medium">${order.customer}</div>
                </div>
                <div class="col-sm-6">
                  <div class="text-muted small">Current Status</div>
                  <div><span class="badge ${getStatusBadgeClass(status)}">${status}</span></div>
                </div>
                <div class="col-sm-6">
                  <div class="text-muted small">Total Qty Requested</div>
                  <div class="fw-medium">${order.items ? order.items.reduce((sum, item) => sum + item.qty, 0) : order.qty || 0}</div>
                </div>
                <div class="col-sm-6">
                  <div class="text-muted small">Qty Pending</div>
                  <div class="fw-medium text-warning">${order.items ? order.items.reduce((sum, item) => sum + item.qtyPending, 0) : order.qtyPending || 0}</div>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Closure Reason</label>
              <select class="form-select mb-2">
                <option value="">Select reason...</option>
                <option value="manual_fulfilled">Manually Fulfilled Outside System</option>
                <option value="customer_cancel">Customer Cancelled</option>
                <option value="alternative_fulfilled">Fulfilled via Alternative Channel</option>
                <option value="direct_delivery">Direct Store Delivery</option>
                <option value="other">Other (specify below)</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Fulfillment Details</label>
              <textarea class="form-control mb-2" rows="2" placeholder="How was this order fulfilled? (e.g., which store, direct purchase, etc.)"></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Supporting Document Reference (optional)</label>
              <input type="text" class="form-control" placeholder="Invoice number, manual TO/PO reference, etc.">
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Additional Notes</label>
              <textarea class="form-control" rows="2" placeholder="Any additional information..."></textarea>
            </div>

            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" id="confirmManualClosure" required>
              <label class="form-check-label fw-medium" for="confirmManualClosure">
                I confirm this order has been completed manually and should be marked as Closed
              </label>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" onclick="document.querySelector('.modal .btn-close').click()">Cancel</button>
            <button class="btn btn-danger" onclick="if(document.getElementById('confirmManualClosure').checked) { alert('Order marked as manually closed'); document.querySelector('.modal .btn-close').click(); } else { alert('Please confirm by checking the checkbox'); }">Close Order Manually</button>
          </div>
        `;
        onOpenModal('Manual Closure', closureContent, 'modal-lg');
        break;
        
      default:
        break;
    }
  };

  return (
    <div>
      <h2 className="mb-4 fw-bold">Web Order Backlog Tracking</h2>
      
      {/* Debug indicator for highlighted order */}
      {highlightedWebOrder && (
        <div className="alert alert-danger mb-3" role="alert">
          <strong>🔍 Highlighting Web Order:</strong> {highlightedWebOrder}
        </div>
      )}
      
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
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Total Back Orders</div>
                <div className="kpi-value">{kpis.total}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Pending Sourcing</div>
                <div className="kpi-value">{kpis.pending}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Partially Fulfilled</div>
                <div className="kpi-value">{kpis.partial}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Completed</div>
                <div className="kpi-value">{kpis.completed}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Exceptions</div>
                <div className="kpi-value">{kpis.exception}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Fulfilment Rate</div>
                <div className="kpi-value">{kpis.rate}%</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Avg. Fulfilment Time</div>
                <div className="kpi-value">{kpis.avgTime} Days</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* KPIs - Slider Mode */}
      {kpiViewMode === 'slider' && (
        <div 
          className="mb-4"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        >
          <Carousel 
            interval={isDragging ? null : 3000}
            indicators={false} 
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
                      <div className="kpi-title">Total Back Orders</div>
                      <div className="kpi-value">{kpis.total}</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Pending Sourcing</div>
                      <div className="kpi-value">{kpis.pending}</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Partially Fulfilled</div>
                      <div className="kpi-value">{kpis.partial}</div>
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
                      <div className="kpi-title">Completed</div>
                      <div className="kpi-value">{kpis.completed}</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Exceptions</div>
                      <div className="kpi-value">{kpis.exception}</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Card className="kpi-card h-100">
                    <Card.Body>
                      <div className="kpi-title">Fulfilment Rate</div>
                      <div className="kpi-value">{kpis.rate}%</div>
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
                      <div className="kpi-title">Avg. Fulfilment Time</div>
                      <div className="kpi-value">{kpis.avgTime} Days</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Carousel.Item>
          </Carousel>
        </div>
      )}

      {/* Charts */}
      <Row className="g-3 mb-4">
        <Col xs={12} lg={6}>
          <Card className="chart-container clickable-card h-100" onClick={() => handleChartClick('ageing')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">
                Back Order Ageing (Pending)
                <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
              </h5>
              <div style={{ height: '256px' }}>
                <Bar data={ageingData} options={chartOptions} />
              </div>
              <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.75rem' }}>Click for detailed breakdown</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="chart-container clickable-card h-100" onClick={() => handleChartClick('source')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">
                Source Contribution (All Orders)
                <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
              </h5>
              <div style={{ height: '256px' }} className="d-flex justify-content-center">
                <Doughnut data={sourceData} options={doughnutOptions} />
              </div>
              <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.75rem' }}>Click for detailed analysis</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <Card.Body>
          {/* Filters */}
          <Row className="g-3 mb-3">
            <Col xs={12}>
              <h6 className="mb-0 fw-medium text-secondary">Filters</h6>
            </Col>
            <Col xs={12} md={6} lg={4}>
              <Form.Label className="small text-muted mb-1">Search</Form.Label>
              <Form.Control
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Order ID, Customer, Product, or SKU..."
              />
            </Col>
            <Col xs={12} sm={6} md={6} lg={2}>
              <Form.Label className="small text-muted mb-1">Order Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
              />
            </Col>
            <Col xs={12} sm={6} md={6} lg={2}>
              <Form.Label className="small text-muted mb-1">Order End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
              />
            </Col>
            <Col xs={12} sm={6} md={4} lg={2}>
              <Form.Label className="small text-muted mb-1">Store / Distributor</Form.Label>
              <Form.Select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="All">All Sources</option>
                <option value="Store (TO)">Store (TO)</option>
                <option value="Distributor (PO)">Distributor (PO)</option>
                <option value="Pending">Pending</option>
                <option value="Manual Purchase">Manual Purchase</option>
                <option value="Unavailable">Unavailable</option>
              </Form.Select>
            </Col>
            <Col xs={12} sm={6} md={4} lg={2}>
              <Form.Label className="small text-muted mb-1">Status</Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending Sourcing">Pending Sourcing</option>
                <option value="TO Created">TO Created</option>
                <option value="PO Created">PO Created</option>
                <option value="Partially Fulfilled">Partially Fulfilled</option>
                <option value="Completed">Completed</option>
                <option value="Market Purchase">Market Purchase</option>
                <option value="Exception">Exception</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col xs={6} sm={4} md={2} lg={2} xl={1} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={handleClearFilters} className="w-100" size="sm">
                Clear
              </Button>
            </Col>
          </Row>

          {/* Table Actions */}
          <div className="d-flex justify-content-end mb-3">
            <Button variant="success" onClick={handleDownload}>
              Download Excel
            </Button>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Web Order ID</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Linked Doc</th>
                  <th>Created</th>
                  <th>Last Updated</th>
                  <th>Age (Days)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-secondary py-5">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    // Use new data structure if available, fallback to old structure
                    const displayData = order.items ? {
                      product: order.items[0]?.product || '-',
                      sku: order.items[0]?.sku || '-',
                      qty: order.items.reduce((sum, item) => sum + item.qty, 0),
                      qtyFulfilled: order.items.reduce((sum, item) => sum + item.qtyFulfilled, 0),
                      status: order.overallStatus,
                      source: order.items.map(item => item.source).filter((v, i, a) => a.indexOf(v) === i).join(', '),
                      linkedDoc: order.items.flatMap(item => item.linkedDocs).join(', ') || '-'
                    } : {
                      product: order.product,
                      sku: order.sku,
                      qty: order.qty,
                      qtyFulfilled: order.qtyFulfilled,
                      status: order.status,
                      source: order.source,
                      linkedDoc: order.linkedDoc
                    };
                    
                    const isHighlighted = highlightedWebOrder && highlightedWebOrder === order.id;
                    
                    // Debug logging
                    if (highlightedWebOrder) {
                      console.log('Check highlight - Looking for:', highlightedWebOrder, 'Current order:', order.id, 'Match:', isHighlighted);
                    }
                    
                    return (
                      <tr 
                        key={order.id}
                        ref={isHighlighted ? highlightedRowRef : null}
                        className={isHighlighted ? 'highlighted-row' : ''}
                      >
                        <td>
                          <Button 
                            variant="link" 
                            className="p-0 text-decoration-none fw-semibold" 
                            onClick={() => handleViewDetails(order)}
                          >
                            {order.id}
                            {order.totalItems > 1 && <span className="badge bg-info ms-1">{order.totalItems}</span>}
                          </Button>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(displayData.status)}`}>
                            {displayData.status || 'Unknown'}
                          </span>
                        </td>
                        <td>{displayData.source || '-'}</td>
                        <td>{displayData.linkedDoc || '-'}</td>
                        <td>{formatDate(order.created)}</td>
                        <td>{formatDate(order.lastUpdated)}</td>
                        <td>{order.age || 0}</td>
                        <td>
                          <ActionDropdown 
                            orderId={order.id}
                            actions={getOrderActions(order)}
                            onActionSelect={handleActionSelect}
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

export default WebOrderBacklog;
