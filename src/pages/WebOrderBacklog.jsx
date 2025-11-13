import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Form, Button, Table, Modal } from 'react-bootstrap';
import { formatDate, exportToCSV, getStatusBadgeClass } from '../utils/utils';
import ActionDropdown from '../components/ActionDropdown';
import OrderDetailsModal from '../components/OrderDetailsModal';

const WebOrderBacklog = ({ webOrders, setWebOrders, onShowToast, onOpenModal, highlightedWebOrder, setHighlightedWebOrder, initialFilters = {}, clearFilters, setHighlightedTOPO, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartModalData] = useState({ title: '', content: null });
  const [showFilters, setShowFilters] = useState(false);
  const [naInternallyFilter, setNaInternallyFilter] = useState(false);
  const [retriedOrdersFilter, setRetriedOrdersFilter] = useState(false);
  
  // Product-level view states
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [productsToShow, setProductsToShow] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [productStatusFilter, setProductStatusFilter] = useState('All');
  
  const highlightedRowRef = useRef(null);
  const tableRef = useRef(null);

  // Apply initial filters when component mounts or filters change
  useEffect(() => {
    if (initialFilters.statusFilter || initialFilters.sourceFilter) {
      if (initialFilters.statusFilter) setStatusFilter(initialFilters.statusFilter);
      if (initialFilters.sourceFilter) setSourceFilter(initialFilters.sourceFilter);
      
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

  // Effect to handle highlighted web order
  useEffect(() => {
    if (highlightedWebOrder) {
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

    // Major filtration logic
    let matchesMajorFilters = true;
    
    // NA Internally filter - products with "NA internally" status
    if (naInternallyFilter) {
      matchesMajorFilters = matchesMajorFilters && 
        order.items?.some(item => item.status === 'NA internally');
    }
    
    // Retried Orders filter - orders with retry count > 0
    if (retriedOrdersFilter) {
      matchesMajorFilters = matchesMajorFilters && 
        order.items?.some(item => (item.retries || 0) > 0);
    }
    
    // Product Status filter - filter by specific product status
    if (productStatusFilter !== 'All') {
      matchesMajorFilters = matchesMajorFilters && 
        order.items?.some(item => item.status === productStatusFilter);
    }
    
    return matchesSearch && matchesStatus && matchesSource && matchesDateRange && matchesMajorFilters;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setSourceFilter('All');
    setStartDateFilter('');
    setEndDateFilter('');
    setNaInternallyFilter(false);
    setRetriedOrdersFilter(false);
    setProductStatusFilter('All');
    setSelectedRows([]);
  };

  // Product-level view functions
  const buildProductsToShow = () => {
    const selectedOrders = filteredOrders.filter(order => selectedRows.includes(order.id));
    const productMap = new Map();
    
    selectedOrders.forEach(order => {
      (order.items || []).forEach(item => {
        // Apply product status filter
        if (productStatusFilter !== 'All' && item.status !== productStatusFilter) {
          return; // Skip items that don't match the product status filter
        }
        
        const qtyReq = item.qty || item.qtyReq || 0;
        const qtyFulfilled = item.qtyFulfilled || 0;
        const qtyPending = item.qtyPending || (qtyReq - qtyFulfilled);
        
        if (qtyPending > 0) {
          const sku = item.sku;
          if (productMap.has(sku)) {
            const existing = productMap.get(sku);
            existing.qtyReq += qtyReq;
            existing.qtyFulfilled += qtyFulfilled;
            existing.qtyPending += qtyPending;
            existing.orderIds.push(order.id);
            existing.orders.push(order);
            existing.statuses.push(item.status);
            existing.statusByOrder[order.id] = item.status;
          } else {
            productMap.set(sku, {
              ...item,
              qtyReq,
              qtyFulfilled,
              qtyPending,
              orderIds: [order.id],
              orders: [order],
              statuses: [item.status],
              statusByOrder: { [order.id]: item.status }
            });
          }
        }
      });
    });
    
    setProductsToShow(Array.from(productMap.values()));
  };

  const handleShowProducts = () => {
    if (selectedRows.length === 0) {
      onShowToast('Please select at least one order', true);
      return;
    }
    buildProductsToShow();
    setShowProductsModal(true);
  };

  const handleSelectAllOrders = () => {
    if (selectedRows.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredOrders.map(order => order.id));
    }
  };

  const handleRowSelect = (orderId) => {
    setSelectedRows(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleDownload = () => {
    // Flatten orders to include product line items
    const exportData = [];
    
    console.log('Export starting - Total orders:', filteredOrders.length);
    
    filteredOrders.forEach(order => {
      if (order.items && order.items.length > 0) {
        // Export each product as a separate row
        console.log(`Processing ${order.id} with ${order.items.length} items`);
        order.items.forEach(item => {
          exportData.push({
            id: order.id,
            customer: order.customer,
            status: order.status,
            created: order.created,
            lastUpdated: order.lastUpdated,
            age: order.age,
            totalItems: order.totalItems || '',
            orderRemarks: order.remarks || '',
            product: item.product,
            sku: item.sku,
            qty: item.qty,
            qtyFulfilled: item.qtyFulfilled,
            qtyPending: item.qtyPending,
            itemStatus: item.status,
            sourceType: item.sourceType || '',
            source: item.source || '',
            linkedDocs: item.linkedDocs?.join(', ') || '',
            retries: item.retries || 0
          });
        });
      } else {
        // If no items, export just the order
        console.log(`Processing ${order.id} with NO items`);
        exportData.push({
          id: order.id,
          customer: order.customer,
          status: order.status,
          created: order.created,
          lastUpdated: order.lastUpdated,
          age: order.age,
          totalItems: order.totalItems || '',
          orderRemarks: order.remarks || '',
          product: '',
          sku: '',
          qty: 0,
          qtyFulfilled: 0,
          qtyPending: 0,
          itemStatus: '',
          sourceType: '',
          source: '',
          linkedDocs: '',
          retries: 0
        });
      }
    });
    
    console.log('Export data rows:', exportData.length);
    console.log('Sample row:', exportData[0]);
    
    const headers = {
      id: 'Web Order ID',
      customer: 'Customer',
      status: 'Order Status',
      created: 'Created',
      lastUpdated: 'Last Updated',
      age: 'Age (Days)',
      totalItems: 'Total Items',
      orderRemarks: 'Order Remarks',
      product: 'Product',
      sku: 'SKU',
      qty: 'Qty Ordered',
      qtyFulfilled: 'Qty Fulfilled',
      qtyPending: 'Qty Pending',
      itemStatus: 'Product Status',
      sourceType: 'Source Type',
      source: 'Source',
      linkedDocs: 'Linked TO/PO',
      retries: 'Retries'
    };
    
    exportToCSV(exportData, headers, 'web_orders_export.csv');
    onShowToast(`Exported ${exportData.length} product line items from ${filteredOrders.length} orders to web_orders_export.csv`);
  };

  const handleProductAction = (productId, actionValue, reason = null) => {
    
    // Find the product and its parent order
    let product = null;
    let parentOrder = null;
    
    for (const order of webOrders) {
      if (order.items) {
        product = order.items.find(item => (item.lineId || item.id) === productId);
        if (product) {
          parentOrder = order;
          break;
        }
      }
    }

    if (!product) {
      onShowToast('Product not found', true);
      return;
    }

    switch (actionValue) {
      case 'view_details': {
        // Show product details in a modal
        const detailsHTML = `
          <div class="product-details">
            <h6 class="mb-3">Product Details</h6>
            <table class="table table-sm table-bordered">
              <tbody>
                <tr><th width="40%">Product Name</th><td>${product.product || '-'}</td></tr>
                <tr><th>SKU</th><td>${product.sku || '-'}</td></tr>
                <tr><th>Status</th><td><span class="badge ${getStatusBadgeClass(product.status)}">${product.status || '-'}</span></td></tr>
                <tr><th>Quantity Ordered</th><td>${product.qty || product.qtyOrdered || 0}</td></tr>
                <tr><th>Quantity Fulfilled</th><td>${product.qtyFulfilled || 0}</td></tr>
                <tr><th>Quantity Pending</th><td>${product.qtyPending || 0}</td></tr>
                <tr><th>Source</th><td>${product.source || '-'}</td></tr>
                <tr><th>Retry Count</th><td>${product.retries || 0}/4</td></tr>
                <tr><th>Linked Documents</th><td>${product.linkedDocs?.join(', ') || '-'}</td></tr>
              </tbody>
            </table>
            ${product.remarks ? `<div class="mt-3"><strong>History:</strong><pre class="bg-light p-2 mt-1" style="font-size: 0.85em; white-space: pre-wrap;">${product.remarks}</pre></div>` : ''}
          </div>
        `;
        onOpenModal(`Product Details: ${product.product}`, detailsHTML, 'modal-lg');
        break;
      }
      case 'view_linked_to_po':
      case 'view_docs': {
        const linked = product.linkedDocs || (product.linkedDoc ? [product.linkedDoc] : []);
        if (!linked || linked.length === 0) {
          onShowToast('No linked documents found for this product', true);
          break;
        }

        const docsHTML = linked.map(doc => {
          const docType = doc && doc.startsWith && doc.startsWith('TO') ? 'Transfer Order' : 'Purchase Order';
          return `
            <tr>
              <td><strong>${doc}</strong></td>
              <td><span class="badge ${doc && doc.startsWith && doc.startsWith('TO') ? 'bg-primary' : 'bg-success'}">${docType}</span></td>
              <td><span class="badge bg-warning">Pending</span></td>
              <td>
                <button class="btn btn-sm btn-primary" onclick="(function(){ if(window.viewDocument) { window.viewDocument('${doc}', '${docType}', '${product.product}', '${product.sku}', ${product.qty || 0}); } })()">
                  <i class="bi bi-eye me-1"></i>View Document
                </button>
              </td>
            </tr>
          `;
        }).join('');

        const docsContent = `
          <div class="mb-3">
            <p class="text-muted">Linked TO/PO documents for product <strong>${product.product}</strong></p>
          </div>
          <table class="table table-sm table-bordered table-hover">
            <thead class="table-light">
              <tr>
                <th>Document ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>${docsHTML}</tbody>
          </table>
        `;

        onOpenModal(`Linked Documents - ${product.product}`, docsContent, 'modal-md');
      }
      break;
      case 'create_manual_to':
        if (product.qtyPending > 0) {
          const newDoc = `TO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
          
          setWebOrders(prevOrders => {
            return prevOrders.map(order => {
              if (order.id === parentOrder.id) {
                const itemsToUpdate = [];
;
                // Process the items
                order.items.forEach(item => {
                  if ((item.lineId || item.id) === productId) {
                    // Get fulfilled quantity (simulated - in real app this comes from store response)
                    // For demo purposes, randomly fulfill 50-100% of quantity
                    const fulfillmentRate = Math.random() > 0.3 ? 1 : (Math.random() * 0.5 + 0.5);
                    const fulfilledQty = Math.floor(item.qtyPending * fulfillmentRate);
                    const remainingQty = item.qtyPending - fulfilledQty;
                    
                    if (fulfilledQty > 0) {
                      // Update current item with fulfilled quantity
                      itemsToUpdate.push({
                        ...item,
                        qtyFulfilled: (item.qtyFulfilled || 0) + fulfilledQty,
                        qtyPending: 0,
                        linkedDocs: [...(item.linkedDocs || []), newDoc],
                        status: 'TO Created',
                        source: 'Store (TO)',
                        retryCount: (item.retryCount || 0) + 1,
                        remarks: `${item.remarks || ''}\n[${new Date().toLocaleString()}] TO created: ${newDoc} - Fulfilled ${fulfilledQty} units`.trim()
                      });
                      
                      // If partial fulfillment, create new Draft item for remaining quantity
                      if (remainingQty > 0) {
                        const newLineId = `${item.lineId || item.id}-R${(item.retryCount || 0) + 1}`;
                        itemsToUpdate.push({
                          ...item,
                          lineId: newLineId,
                          id: newLineId,
                          qtyOrdered: remainingQty,
                          qtyFulfilled: 0,
                          qtyPending: remainingQty,
                          linkedDocs: [],
                          status: 'Draft',
                          source: 'Pending Retry',
                          retryCount: (item.retryCount || 0) + 1,
                          remarks: `[${new Date().toLocaleString()}] Created from partial fulfillment - Remaining ${remainingQty} units from ${item.lineId || item.id}`
                        });
                      }
                    } else {
                      // No fulfillment, just update retry count and keep as Draft
                      itemsToUpdate.push({
                        ...item,
                        retryCount: (item.retryCount || 0) + 1,
                        status: (item.retryCount || 0) >= 4 ? 'Escalate to PO' : 'Draft',
                        remarks: `${item.remarks || ''}\n[${new Date().toLocaleString()}] TO attempt ${(item.retryCount || 0) + 1} - No stock available`.trim()
                      });
                    }
                  } else {
                    itemsToUpdate.push(item);
                  }
                });
                
                // Determine parent order status based on all items
                let newOrderStatus = order.overallStatus || order.status;
                const allCompleted = itemsToUpdate.every(item => item.qtyPending === 0 && item.status !== 'Draft');
                const allException = itemsToUpdate.every(item => item.status === 'Exception');
                const hasDrafts = itemsToUpdate.some(item => item.status === 'Draft');
                const hasCreatedDocs = itemsToUpdate.some(item => 
                  item.status === 'TO Created' || item.status === 'PO Created'
                );
                
                if (allCompleted) {
                  newOrderStatus = 'Completed';
                } else if (allException) {
                  newOrderStatus = 'Exception';
                } else if (hasCreatedDocs) {
                  newOrderStatus = 'In Progress';
                } else if (hasDrafts) {
                  newOrderStatus = 'Pending Sourcing';
                }
                
                const updatedOrder = {
                  ...order,
                  items: itemsToUpdate,
                  overallStatus: newOrderStatus,
                  status: newOrderStatus,
                  lastUpdated: new Date().toISOString().slice(0, 19).replace('T', ' ')
                };
                
                // Force modal refresh
                setTimeout(() => {
                  handleViewDetails(updatedOrder);
                }, 50);
                
                return updatedOrder;
              }
              return order;
            });
          });
          
          onShowToast(`✅ Manual Transfer Order created: ${newDoc}\n📄 Check items for fulfillment details`);
        } else {
          onShowToast('No pending quantity to fulfill', true);
        }
        break;
        
      case 'mark_distributor_po':
        if (product.qtyPending > 0) {
          const newDoc = `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
          
          setWebOrders(prevOrders => {
            return prevOrders.map(order => {
              if (order.id === parentOrder.id) {
                const itemsToUpdate = [];
                
                // Process the items
                order.items.forEach(item => {
                  if ((item.lineId || item.id) === productId) {
                    // Get fulfilled quantity (simulated - in real app this comes from distributor response)
                    const fulfillmentRate = Math.random() > 0.2 ? 1 : (Math.random() * 0.5 + 0.5);
                    const fulfilledQty = Math.floor(item.qtyPending * fulfillmentRate);
                    const remainingQty = item.qtyPending - fulfilledQty;
                    
                    if (fulfilledQty > 0) {
                      // Update current item with fulfilled quantity
                      itemsToUpdate.push({
                        ...item,
                        qtyFulfilled: (item.qtyFulfilled || 0) + fulfilledQty,
                        qtyPending: 0,
                        linkedDocs: [...(item.linkedDocs || []), newDoc],
                        status: 'PO Created',
                        source: 'Distributor (PO)',
                        retryCount: (item.retryCount || 0) + 1,
                        remarks: `${item.remarks || ''}\n[${new Date().toLocaleString()}] PO created: ${newDoc} - Fulfilled ${fulfilledQty} units (Escalated from Store)`.trim()
                      });
                      
                      // If partial fulfillment, create new Draft item for remaining quantity
                      if (remainingQty > 0) {
                        const newLineId = `${item.lineId || item.id}-R${(item.retryCount || 0) + 1}`;
                        itemsToUpdate.push({
                          ...item,
                          lineId: newLineId,
                          id: newLineId,
                          qtyOrdered: remainingQty,
                          qtyFulfilled: 0,
                          qtyPending: remainingQty,
                          linkedDocs: [],
                          status: 'Draft',
                          source: 'Pending Retry',
                          retryCount: (item.retryCount || 0) + 1,
                          remarks: `[${new Date().toLocaleString()}] Created from partial PO fulfillment - Remaining ${remainingQty} units from ${item.lineId || item.id}`
                        });
                      }
                    } else {
                      // No fulfillment, escalate to market purchase if max retries reached
                      const newRetryCount = (item.retryCount || 0) + 1;
                      itemsToUpdate.push({
                        ...item,
                        retryCount: newRetryCount,
                        status: newRetryCount >= 4 ? 'Escalate to Market' : 'Draft',
                        remarks: `${item.remarks || ''}\n[${new Date().toLocaleString()}] PO attempt ${newRetryCount} - No stock from distributor`.trim()
                      });
                    }
                  } else {
                    itemsToUpdate.push(item);
                  }
                });
                
                // Determine parent order status based on all items
                let newOrderStatus = order.overallStatus || order.status;
                const allCompleted = itemsToUpdate.every(item => item.qtyPending === 0 && item.status !== 'Draft');
                const allException = itemsToUpdate.every(item => item.status === 'Exception');
                const hasDrafts = itemsToUpdate.some(item => item.status === 'Draft');
                const hasCreatedDocs = itemsToUpdate.some(item => 
                  item.status === 'TO Created' || item.status === 'PO Created'
                );
                
                if (allCompleted) {
                  newOrderStatus = 'Completed';
                } else if (allException) {
                  newOrderStatus = 'Exception';
                } else if (hasCreatedDocs) {
                  newOrderStatus = 'In Progress';
                } else if (hasDrafts) {
                  newOrderStatus = 'Pending Sourcing';
                }
                
                const updatedOrder = {
                  ...order,
                  items: itemsToUpdate,
                  overallStatus: newOrderStatus,
                  status: newOrderStatus,
                  lastUpdated: new Date().toISOString().slice(0, 19).replace('T', ' ')
                };
                
                // Force modal refresh
                setTimeout(() => {
                  handleViewDetails(updatedOrder);
                }, 50);
                
                return updatedOrder;
              }
              return order;
            });
          });
          
          onShowToast(`✅ Distributor PO created: ${newDoc}\n📄 Check items for fulfillment details`);
        } else {
          onShowToast('No pending quantity to fulfill', true);
        }
        break;
        
      case 'mark_unavailable':
        if (product.qtyPending > 0) {
          setWebOrders(prevOrders => {
            return prevOrders.map(order => {
              if (order.id === parentOrder.id) {
                const updatedItems = order.items.map(item => {
                  if ((item.lineId || item.id) === productId) {
                    return {
                      ...item,
                      status: 'Not Available',
                      qtyPending: 0,
                      source: 'Exhausted All Sources',
                      retryCount: (item.retryCount || 0) + 1,
                      remarks: `${item.remarks || ''}\n[${new Date().toLocaleString()}] Product marked as Not Available - All sourcing attempts exhausted (TO → PO → Market)`.trim()
                    };
                  }
                  return item;
                });
                
                
                // Determine parent order status based on all items
                let newOrderStatus = order.overallStatus || order.status;
                const allNotAvailable = updatedItems.every(item => item.status === 'Not Available');
                const someNotAvailable = updatedItems.some(item => item.status === 'Not Available');
                const allCompleted = updatedItems.every(item => 
                  item.qtyPending === 0 && (item.status === 'TO Created' || item.status === 'PO Created' || item.status === 'Completed')
                );
                const hasDrafts = updatedItems.some(item => item.status === 'Draft');
                
                if (allNotAvailable) {
                  newOrderStatus = 'Exception';
                } else if (allCompleted) {
                  newOrderStatus = 'Completed';
                } else if (someNotAvailable) {
                  newOrderStatus = 'Partially Fulfilled';
                } else if (hasDrafts) {
                  newOrderStatus = 'Pending Sourcing';
                }
                
                // Update the order with new items and status
                const updatedOrder = {
                  ...order,
                  items: updatedItems,
                  overallStatus: newOrderStatus,
                  status: newOrderStatus,
                  lastUpdated: new Date().toISOString().slice(0, 19).replace('T', ' ')
                };
                
                // Force modal refresh by closing and reopening with updated data
                setTimeout(() => {
                  handleViewDetails(updatedOrder);
                }, 50);
                
                return updatedOrder;
              }
              return order;
            });
          });
          
          onShowToast(`⚠️ ${product.product} marked as Not Available\n📝 All sourcing channels exhausted`);
        } else {
          onShowToast('No pending quantity to mark as unavailable', true);
        }
        break;
        
      case 'mark_market_purchase':
        if (product.qtyPending > 0) {
          setWebOrders(prevOrders => {
            return prevOrders.map(order => {
              if (order.id === parentOrder.id) {
                const updatedItems = order.items.map(item => {
                  if ((item.lineId || item.id) === productId) {
                    return {
                      ...item,
                      status: 'Market Purchase',
                      source: 'Market/External',
                      retryCount: (item.retryCount || 0) + 1,
                      remarks: `${item.remarks || ''}\n[${new Date().toLocaleString()}] Escalated to Market Purchase - ${item.qtyPending} units to be sourced externally`.trim()
                    };
                  }
                  return item;
                });
                
                // Determine parent order status
                let newOrderStatus = order.overallStatus || order.status;
                const allCompleted = updatedItems.every(item => item.qtyPending === 0);
                const hasMarketPurchase = updatedItems.some(item => item.status === 'Market Purchase');
                const hasDrafts = updatedItems.some(item => item.status === 'Draft');
                
                if (allCompleted) {
                  newOrderStatus = 'Completed';
                } else if (hasMarketPurchase) {
                  newOrderStatus = 'In Progress';
                } else if (hasDrafts) {
                  newOrderStatus = 'Pending Sourcing';
                }
                
                const updatedOrder = {
                  ...order,
                  items: updatedItems,
                  overallStatus: newOrderStatus,
                  status: newOrderStatus,
                  lastUpdated: new Date().toISOString().slice(0, 19).replace('T', ' ')
                };
                
                setTimeout(() => {
                  handleViewDetails(updatedOrder);
                }, 50);
                
                return updatedOrder;
              }
              return order;
            });
          });
          
          onShowToast(`📦 ${product.product} escalated to Market Purchase\n💰 Will be sourced from external market`);
        } else {
          onShowToast('No pending quantity for market purchase', true);
        }
        break;

      case 'manual_closure': {
        // Update product status to "NA in Market" and mark as closed
        setWebOrders(prevOrders => {
          return prevOrders.map(order => {
            if (order.id === parentOrder.id) {
              const updatedItems = order.items.map(item => {
                if ((item.lineId || item.id) === productId) {
                  return {
                    ...item,
                    status: 'NA in Market',
                    qtyFulfilled: 0,
                    qtyPending: 0,
                    remarks: `${item.remarks || ''}\n[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] Manual Closure: ${reason}`.trim()
                  };
                }
                return item;
              });

              // Determine parent order status
              const allClosed = updatedItems.every(item => 
                item.status === 'NA in Market' || 
                item.status === 'Completely Fulfilled' || 
                item.qtyPending === 0
              );
              const hasNAInMarket = updatedItems.some(item => item.status === 'NA in Market');
              
              let newOrderStatus = order.overallStatus || order.status;
              if (allClosed) {
                newOrderStatus = hasNAInMarket ? 'Rejected' : 'Fulfilled';
              } else {
                newOrderStatus = 'Partially Fulfilled';
              }

              const updatedOrder = {
                ...order,
                items: updatedItems,
                overallStatus: newOrderStatus,
                status: newOrderStatus,
                lastUpdated: new Date().toISOString().slice(0, 19).replace('T', ' ')
              };

              // Refresh the modal view
              setTimeout(() => {
                handleViewDetails(updatedOrder);
              }, 50);

              return updatedOrder;
            }
            return order;
          });
        });

        onShowToast(`❌ ${product.product} manually closed\n📝 Reason: ${reason}`);
        break;
      }

      case 'raise_market_purchase': {
        // Raise Market Purchase for NA internally products
        setWebOrders(prevOrders => {
          return prevOrders.map(order => {
            if (order.id === parentOrder.id) {
              const updatedItems = order.items.map(item => {
                if ((item.lineId || item.id) === productId) {
                  return {
                    ...item,
                    status: 'Market Purchase Initiated',
                    sourceType: 'Market Purchase',
                    source: 'Market',
                    remarks: `${item.remarks || ''}\n[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] Market Purchase initiated - Product NA internally`.trim()
                  };
                }
                return item;
              });

              // Determine parent order status
              const allCompleted = updatedItems.every(item => item.qtyPending === 0);
              const hasMarketPurchase = updatedItems.some(item => item.status === 'Market Purchase Initiated');
              
              let newOrderStatus = order.overallStatus || order.status;
              if (allCompleted) {
                newOrderStatus = 'Fulfilled';
              } else if (hasMarketPurchase) {
                newOrderStatus = 'Partially Fulfilled';
              }

              const updatedOrder = {
                ...order,
                items: updatedItems,
                overallStatus: newOrderStatus,
                status: newOrderStatus,
                lastUpdated: new Date().toISOString().slice(0, 19).replace('T', ' ')
              };

              // Refresh the modal view
              setTimeout(() => {
                handleViewDetails(updatedOrder);
              }, 50);

              return updatedOrder;
            }
            return order;
          });
        });

        onShowToast(`🛒 ${product.product} raised for Market Purchase\n💰 Will be sourced from external market`);
        break;
      }
        
      default:
        break;
    }
  };

  const handleViewDetails = (order) => {
    const content = (
      <OrderDetailsModal 
        order={order} 
        onProductAction={handleProductAction}
      />
    );
    
    onOpenModal(`Web Order Details: ${order.id}`, content, 'modal-xl');
  };

  // Get available actions based on order status - Web Order Level
  const getOrderActions = (order) => {
    const actions = [];

    // Always show View Details first
    actions.push({ label: 'View Details', value: 'view' });

    // Show linked documents if available
    const hasLinkedDocs = order.items ? 
      order.items.some(item => item.linkedDocs && item.linkedDocs.length > 0) : 
      (order.linkedDoc && order.linkedDoc.length > 0);
    
    if (hasLinkedDocs) {
      actions.push({ label: 'View Linked TO/PO', value: 'view_docs' });
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
        // View linked TO/PO documents - collect all docs from all items
        const linkedDocs = order.items ? order.items.flatMap(item => item.linkedDocs || []) : (order.linkedDoc ? [order.linkedDoc] : []);
        
        if (linkedDocs.length === 0) {
          onShowToast('No linked documents found for this order', true);
          break;
        }
        
        // Create a mapping of documents to their products
        const docProductMap = {};
        if (order.items) {
          order.items.forEach(item => {
            if (item.linkedDocs) {
              item.linkedDocs.forEach(doc => {
                if (!docProductMap[doc]) {
                  docProductMap[doc] = [];
                }
                docProductMap[doc].push({
                  product: item.product,
                  sku: item.sku,
                  qty: item.qty
                });
              });
            }
          });
        }
        
        const docsHTML = linkedDocs.map(doc => {
          const docType = doc.startsWith('TO') ? 'Transfer Order' : 'Purchase Order';
          const products = docProductMap[doc] || [{product: order.product || 'N/A', sku: order.sku || 'N/A', qty: order.qty || 0}];
          const productInfo = products[0]; // Use first product for the view button
          
          return `
          <tr>
            <td><strong>${doc}</strong></td>
            <td><span class="badge ${doc.startsWith('TO') ? 'bg-primary' : 'bg-success'}">${docType}</span></td>
            <td><span class="badge bg-warning">Pending</span></td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="window.viewDocument('${doc}', '${docType}', '${productInfo.product}', '${productInfo.sku}', ${productInfo.qty})">
                <i class="bi bi-eye me-1"></i>View Document
              </button>
            </td>
          </tr>
        `;
        }).join('');
        
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>${docsHTML}</tbody>
          </table>
        `;
        
        // Ensure the viewDocument function is available
        if (!window.viewDocument) {
          window.viewDocument = (docId, docType, productName, sku, qty) => {
            const currentDate = new Date().toLocaleDateString();
            const currentDateTime = new Date().toLocaleString();
            const expectedDateTO = new Date(Date.now() + 2*24*60*60*1000).toLocaleDateString();
            const expectedDatePO = new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString();
            
            const toSpecific = `
                <div class="mb-4">
                  <h5 class="fw-bold mb-3">Transfer Information</h5>
                  <div class="row">
                    <div class="col-6">
                      <p><strong>From Store:</strong> Central Warehouse</p>
                      <p><strong>To Store:</strong> Store Location TBD</p>
                    </div>
                    <div class="col-6">
                      <p><strong>Priority:</strong> High</p>
                      <p><strong>Expected Date:</strong> ${expectedDateTO}</p>
                    </div>
                  </div>
                </div>
            `;
            
            const poSpecific = `
                <div class="mb-4">
                  <h5 class="fw-bold mb-3">Purchase Order Information</h5>
                  <div class="row">
                    <div class="col-6">
                      <p><strong>Vendor:</strong> Distributor Name TBD</p>
                      <p><strong>Payment Terms:</strong> Net 30</p>
                    </div>
                    <div class="col-6">
                      <p><strong>Delivery Date:</strong> ${expectedDatePO}</p>
                      <p><strong>PO Type:</strong> Standard</p>
                    </div>
                  </div>
                </div>
            `;
            
            const documentContent = `
              <div class="document-view" style="background: white; padding: 40px; font-family: 'Courier New', monospace;">
                <style>
                  @media print {
                    .no-print { display: none !important; }
                    .document-view { padding: 20px !important; }
                  }
                </style>
                
                <div class="text-center mb-4 pb-3" style="border-bottom: 2px solid #000;">
                  <h3 class="fw-bold mb-0">MedPlus Pharmacy</h3>
                  <p class="mb-0 small">Back Order Fulfillment System</p>
                </div>
                
                <div class="mb-4">
                  <h4 class="fw-bold">${docType}</h4>
                  <div class="row">
                    <div class="col-6">
                      <strong>Document ID:</strong> ${docId}
                    </div>
                    <div class="col-6 text-end">
                      <strong>Date:</strong> ${currentDate}
                    </div>
                  </div>
                </div>
                
                <div class="mb-4">
                  <h5 class="fw-bold mb-3">Order Details</h5>
                  <table class="table table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>${productName}</td>
                        <td>${sku}</td>
                        <td>${qty}</td>
                        <td><span class="badge bg-warning">Pending</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                ${docType === 'Transfer Order' ? toSpecific : poSpecific}
                
                <div class="mt-5 pt-3" style="border-top: 1px solid #ccc;">
                  <div class="row">
                    <div class="col-6">
                      <p class="small mb-0"><strong>Prepared By:</strong> System Auto-Generated</p>
                      <p class="small mb-0"><strong>Date:</strong> ${currentDateTime}</p>
                    </div>
                    <div class="col-6 text-end">
                      <p class="small mb-0"><strong>Document Status:</strong> Draft</p>
                    </div>
                  </div>
                </div>
                
                <div class="text-center mt-4 no-print">
                  <button class="btn btn-primary btn-lg" onclick="window.print()">
                    <i class="bi bi-printer me-2"></i>Print Document
                  </button>
                  <button class="btn btn-secondary btn-lg ms-2" onclick="window.location.reload()">
                    <i class="bi bi-x-circle me-2"></i>Close
                  </button>
                </div>
              </div>
            `;
            
            onOpenModal(docType + ': ' + docId, documentContent, 'modal-xl');
          };
        }
        
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
                <div class="col-6"><strong>Total Items:</strong> ${order.totalItems || order.items?.length || 1}</div>
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
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Priority Level</label>
              <select class="form-select" id="priorityLevel">
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Processing Notes</label>
              <textarea class="form-control" id="processingNotes" rows="2" placeholder="Optional notes for processing team..."></textarea>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" onclick="document.querySelector('.modal .btn-close').click()">Cancel</button>
            <button class="btn btn-success" onclick="window.processOrderRequest('${order.id}')">Process Request</button>
          </div>
        `;
        
        // Create global function
        window.processOrderRequest = (orderId) => {
          const processOption = document.querySelector('input[name="processOption"]:checked')?.value || 'create_to';
          
          setWebOrders(prevOrders => {
            return prevOrders.map(o => {
              if (o.id === orderId) {
                // Update all items in the order
                const updatedItems = o.items.map(item => {
                  if (item.qtyPending > 0) {
                    const newDoc = processOption === 'create_po' ? 
                      `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}` :
                      `TO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
                    
                    return {
                      ...item,
                      linkedDocs: [...(item.linkedDocs || []), newDoc],
                      status: 'Partially Fulfilled',
                      source: processOption === 'create_po' ? 'Distributor (PO)' : 'Store (TO)'
                    };
                  }
                  return item;
                });
                
                return {
                  ...o,
                  items: updatedItems,
                  overallStatus: 'Partially Fulfilled',
                  status: 'Partially Fulfilled'
                };
              }
              return o;
            });
          });
          
          onShowToast(`✅ Request processed successfully for ${orderId}\n📄 ${processOption === 'create_po' ? 'Purchase Orders' : 'Transfer Orders'} created`);
          document.querySelector('.modal .btn-close').click();
        };
        
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
              <select class="form-select" id="preferredSource">
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
              <textarea class="form-control" id="rejectReason" rows="3" placeholder="Please provide detailed reason..." required></textarea>
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
            <button class="btn btn-warning" onclick="window.rejectReassignOrder('${order.id}')">Confirm Action</button>
          </div>
        `;
        
        window.rejectReassignOrder = (orderId) => {
          const actionType = document.getElementById('rejectActionType')?.value;
          const reason = document.getElementById('rejectReason')?.value;
          
          if (!reason) {
            alert('Please provide a reason');
            return;
          }
          
          setWebOrders(prevOrders => {
            return prevOrders.map(o => {
              if (o.id === orderId) {
                let newStatus = o.overallStatus || o.status;
                let remarks = reason;
                
                if (actionType?.includes('reassign')) {
                  newStatus = 'Pending Sourcing';
                  remarks = `Reassigned: ${reason}`;
                } else if (actionType?.includes('reject')) {
                  newStatus = 'Exception';
                  remarks = `Rejected: ${reason}`;
                }
                
                return {
                  ...o,
                  overallStatus: newStatus,
                  status: newStatus,
                  remarks: remarks
                };
              }
              return o;
            });
          });
          
          onShowToast(`✅ Order ${orderId} ${actionType?.includes('reassign') ? 'reassigned' : 'rejected'} successfully`);
          document.querySelector('.modal .btn-close').click();
        };
        
        onOpenModal('Reject / Reassign Order', rejectContent, 'modal-lg');
        break;
        
      case 'market_purchase':
        // Mark for Market Purchase - For products unavailable in stores/distributors
        const marketContent = `
          <div class="mb-3">
            <p class="text-muted">Mark order <strong>${order.id}</strong> for market purchase</p>
            <div class="alert alert-info mb-3">
              <strong>ℹ Info:</strong> This will initiate external market purchase for products unavailable through internal sources.
            </div>
            
            <div class="row g-2 mb-3">
              <div class="col-sm-6"><div class="text-muted small">Current Status</div><div><span class="badge ${getStatusBadgeClass(status)}">${status}</span></div></div>
              <div class="col-sm-6"><div class="text-muted small">Qty Pending</div><div class="fw-medium text-warning">${order.items ? order.items.reduce((sum, item) => sum + item.qtyPending, 0) : order.qtyPending || 0}</div></div>
            </div>
            
            <div class="mb-3">
              <label class="form-label fw-medium">Market Purchase Status</label>
              <select class="form-select" id="marketStatus">
                <option value="initiated">Initiated for Market Purchase</option>
                <option value="unavailable">Not Available in Market</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Vendor/Supplier (Optional)</label>
              <input type="text" class="form-control" id="marketVendor" placeholder="Enter vendor name if known">
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Remarks</label>
              <textarea class="form-control" id="marketRemarks" rows="3" placeholder="Provide details about market sourcing attempts..." required></textarea>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" onclick="document.querySelector('.modal .btn-close').click()">Cancel</button>
            <button class="btn btn-primary" onclick="window.markForMarketPurchase('${order.id}')">Confirm</button>
          </div>
        `;
        
        window.markForMarketPurchase = (orderId) => {
          const marketStatus = document.getElementById('marketStatus')?.value;
          const remarks = document.getElementById('marketRemarks')?.value;
          const vendor = document.getElementById('marketVendor')?.value;
          
          if (!remarks) {
            alert('Please provide remarks');
            return;
          }
          
          setWebOrders(prevOrders => {
            return prevOrders.map(o => {
              if (o.id === orderId) {
                const updatedItems = o.items?.map(item => ({
                  ...item,
                  source: 'Market Purchase' + (vendor ? ` - ${vendor}` : ''),
                  remarks: remarks
                })) || [];
                
                return {
                  ...o,
                  items: updatedItems,
                  overallStatus: marketStatus === 'unavailable' ? 'Exception' : 'Pending Sourcing',
                  status: marketStatus === 'unavailable' ? 'Exception' : 'Pending Sourcing',
                  remarks: `Market Purchase: ${remarks}`
                };
              }
              return o;
            });
          });
          
          onShowToast(`✅ Order ${orderId} marked for market purchase`);
          document.querySelector('.modal .btn-close').click();
        };
        
        onOpenModal('Mark for Market Purchase', marketContent, 'modal-lg');
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
              <select class="form-select mb-2" id="closureReason">
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
              <textarea class="form-control mb-2" id="fulfillmentDetails" rows="2" placeholder="How was this order fulfilled? (e.g., which store, direct purchase, etc.)"></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Supporting Document Reference (optional)</label>
              <input type="text" class="form-control" id="supportingDoc" placeholder="Invoice number, manual TO/PO reference, etc.">
            </div>

            <div class="mb-3">
              <label class="form-label fw-medium">Additional Notes</label>
              <textarea class="form-control" id="additionalNotes" rows="2" placeholder="Any additional information..."></textarea>
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
            <button class="btn btn-danger" onclick="window.manualCloseOrder('${order.id}')">Close Order Manually</button>
          </div>
        `;
        
        window.manualCloseOrder = (orderId) => {
          if (!document.getElementById('confirmManualClosure')?.checked) {
            alert('Please confirm by checking the checkbox');
            return;
          }
          
          const reason = document.getElementById('closureReason')?.value;
          const details = document.getElementById('fulfillmentDetails')?.value;
          
          if (!reason || !details) {
            alert('Please fill in all required fields');
            return;
          }
          
          setWebOrders(prevOrders => {
            return prevOrders.map(o => {
              if (o.id === orderId) {
                const updatedItems = o.items?.map(item => ({
                  ...item,
                  status: 'Completed',
                  qtyFulfilled: item.qty,
                  qtyPending: 0,
                  remarks: `Manually closed: ${details}`
                })) || [];
                
                return {
                  ...o,
                  items: updatedItems,
                  overallStatus: 'Completed',
                  status: 'Completed',
                  remarks: `Manual Closure - ${reason}: ${details}`
                };
              }
              return o;
            });
          });
          
          onShowToast(`✅ Order ${orderId} manually closed`);
          document.querySelector('.modal .btn-close').click();
        };
        
        onOpenModal('Manual Closure', closureContent, 'modal-lg');
        break;
        
      default:
        break;
    }
  };

  return (
    <div className="px-2 px-md-3">
      <h2 className="mb-3 mb-md-4 fw-bold fs-4 fs-md-3">Back Order Tracking</h2>
      
      {/* Debug indicator for highlighted order */}
      {highlightedWebOrder && (
        <div className="alert alert-info mb-3" role="alert">
          <strong>🔍 Highlighting Web Order:</strong> {highlightedWebOrder}
        </div>
      )}

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
            <Button variant="success" onClick={handleDownload} size="sm" className="d-flex align-items-center justify-content-center">
              <i className="bi bi-download me-2"></i>Download Excel
            </Button>
          </div>

          {/* Filters - Collapsible */}
          {showFilters && (
            <>
            <Row className="g-2 g-md-3 mb-3 animate__animated animate__fadeInDown" style={{ 
              animation: 'slideDown 0.3s ease-out',
              borderBottom: '1px solid #dee2e6',
              paddingBottom: '1rem'
            }}>
              <Col xs={12}>
                <h6 className="mb-0 fw-medium text-secondary small">Filters</h6>
              </Col>
              <Col xs={12} md={6} lg={4}>
                <Form.Label className="small text-muted mb-1">Search</Form.Label>
                <Form.Control
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Order ID, Customer, Product, or SKU..."
                  size="sm"
                />
              </Col>
              <Col xs={6} sm={6} md={3} lg={2}>
                <Form.Label className="small text-muted mb-1">Order Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  size="sm"
                />
              </Col>
              <Col xs={6} sm={6} md={3} lg={2}>
                <Form.Label className="small text-muted mb-1">Order End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  size="sm"
                />
              </Col>
              <Col xs={12} sm={6} md={4} lg={2}>
                <Form.Label className="small text-muted mb-1">Store / Distributor</Form.Label>
                <Form.Select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  size="sm"
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
                  size="sm"
                >
                  <option value="All">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Partially Fulfilled">Partially Fulfilled</option>
                  <option value="Fulfilled">Fulfilled</option>
                </Form.Select>
              </Col>
              <Col xs={12} sm={4} md={3} lg={2} xl={2}>
                <Button variant="outline-secondary" onClick={handleClearFilters} className="w-100" size="sm">
                  Clear All
                </Button>
              </Col>
            </Row>
            <Row className="g-2 mb-3 mt-2">
              <Col xs={6} sm={4} md={3} lg={2} xl={2}>
                <Button 
                  variant={naInternallyFilter ? "warning" : "outline-warning"}
                  onClick={() => setNaInternallyFilter(!naInternallyFilter)}
                  className="w-100 mt-4"
                  size="sm"
                >
                  {naInternallyFilter ? "✓ " : ""}NA Internally
                </Button>
              </Col>
              <Col xs={6} sm={4} md={3} lg={2} xl={2}>
                <Button 
                  variant={retriedOrdersFilter ? "info" : "outline-info"}
                  onClick={() => setRetriedOrdersFilter(!retriedOrdersFilter)}
                  className="w-100 mt-4"
                  size="sm"
                >
                  {retriedOrdersFilter ? "✓ " : ""}Retried Orders
                </Button>
              </Col>
              <Col xs={12} sm={4} md={3} lg={2} xl={2}>
                <Button 
                  variant="outline-danger"
                  onClick={handleShowProducts}
                  className="w-100 mt-4"
                  size="sm"
                  disabled={selectedRows.length === 0}
                >
                  Unfulfilled Products
                </Button>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4} xl={3}>
              <Form.Label className="small text-muted mb-1">Product Status</Form.Label>
                <Form.Select
                  value={productStatusFilter}
                  onChange={(e) => setProductStatusFilter(e.target.value)}
                  size="sm"
                >
                  <option value="All">All Product Status</option>
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
          <div
            className="table-responsive bo-scroll-x"
            ref={tableRef}
            style={{ overflow: 'auto', width: '85vw', maxWidth: '85vw', WebkitOverflowScrolling: 'touch' }}
          >
            <Table striped hover className="mb-0" size="sm" style={{ minWidth: '900px' }}>
              <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ width: '100px', minWidth: '100px' }}>
                    <Button
                      variant={selectedRows.length === filteredOrders.length && filteredOrders.length > 0 ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={handleSelectAllOrders}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      {selectedRows.length === filteredOrders.length && filteredOrders.length > 0 ? "Deselect" : "Select"}
                    </Button>
                  </th>

                  <th style={{ minWidth: '120px' }}>Web Order ID</th>
                  <th style={{ minWidth: '100px' }}>Status</th>
                  <th style={{ minWidth: '120px' }}>Linked Doc</th>
                  <th style={{ minWidth: '110px' }}>Created</th>
                  <th style={{ minWidth: '110px' }}>Last Updated</th>
                  <th style={{ minWidth: '80px' }}>Age (Days)</th>
                  <th style={{ minWidth: '100px' }}>Actions</th>
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
                  filteredOrders.map((order, idx) => {

                    // Aggregate status for multi-product orders
                    function getAggregateStatus(items) {
                      if (!items || items.length === 0) return order.status || 'Unknown';
                      const statuses = items.map(i => i.status);
                      if (statuses.every(s => s === 'Completed')) return 'Completed';
                      if (statuses.some(s => s === 'Pending Sourcing')) return 'Pending Sourcing';
                      if (statuses.some(s => s === 'Exception')) return 'Exception';
                      if (statuses.some(s => s === 'Partially Fulfilled')) return 'Partially Fulfilled';
                      if (statuses.some(s => s === 'Rejected')) return 'Rejected';
                      return statuses[0] || 'Unknown';
                    }

                    const displayData = order.items ? {
                      product: order.items[0]?.product || '-',
                      sku: order.items[0]?.sku || '-',
                      qty: order.items.reduce((sum, item) => sum + item.qty, 0),
                      qtyFulfilled: order.items.reduce((sum, item) => sum + item.qtyFulfilled, 0),
                      status: order.overallStatus || getAggregateStatus(order.items),
                      source: order.items.map(item => item.source).filter((v, i, a) => a.indexOf(v) === i).join(', '),
                      linkedDoc: order.items.flatMap(item => item.linkedDocs || []).filter(Boolean).join(', ') || '-'
                    } : {
                      product: order.product,
                      sku: order.sku,
                      qty: order.qty,
                      qtyFulfilled: order.qtyFulfilled,
                      status: order.status,
                      source: order.source,
                      linkedDoc: order.linkedDoc || '-'
                    };
                    
                    const isHighlighted = highlightedWebOrder && order.id === highlightedWebOrder;
                    
                    return (
                      <tr 
                        key={order.id}
                        ref={isHighlighted ? highlightedRowRef : null}
                        className={isHighlighted ? 'highlighted-row' : ''}
                      >
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedRows.includes(order.id)}
                            onChange={() => handleRowSelect(order.id)}
                          />
                        </td>
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
                        <td>
                          {displayData.linkedDoc && displayData.linkedDoc !== '-' && displayData.linkedDoc.trim() !== '' ? (
                            displayData.linkedDoc.split(',').map((docId, i) => (
                              <Button
                                key={docId.trim() + i}
                                variant="link"
                                className="p-0 text-decoration-none fw-medium me-2"
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const doc = docId.trim();
                                  // Navigate to TO/PO page and highlight the document
                                  setHighlightedTOPO(doc);
                                  onNavigate('sourcing');
                                }}
                              >
                                {docId.trim()}
                              </Button>
                            ))
                          ) : (
                            <span>{displayData.linkedDoc || '-'}</span>
                          )}
                        </td>
                        <td>{formatDate(order.created)}</td>
                        <td>{formatDate(order.lastUpdated)}</td>
                        <td>{order.age || 0}</td>
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

      {/* Products Modal */}
      <Modal show={showProductsModal} onHide={() => setShowProductsModal(false)} size="xl" fullscreen="lg-down">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fs-md-4">Unfulfilled Products in Selected Orders</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-2 p-md-3">
          {/* Products Table */}
          <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <Table striped bordered hover size="sm" style={{ minWidth: '700px' }}>
              <thead className="table-light sticky-top">
                <tr>
                  <th style={{ minWidth: '100px' }}>SKU</th>
                  <th style={{ minWidth: '150px' }}>Product Name</th>
                  <th style={{ width: '90px', minWidth: '90px' }}>Qty Req</th>
                  <th style={{ width: '100px', minWidth: '100px' }}>Qty Fulfilled</th>
                  <th style={{ width: '100px', minWidth: '100px' }}>Qty Pending</th>
                  <th style={{ minWidth: '150px' }}>Order IDs</th>
                  <th style={{ minWidth: '200px' }}>Status by Order</th>
                </tr>
              </thead>
              <tbody>
                {productsToShow.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No unfulfilled products found in selected orders
                    </td>
                  </tr>
                ) : (
                  productsToShow.map((item, idx) => (
                    <tr key={idx}>
                      <td><small>{item.sku}</small></td>
                      <td>{item.product}</td>
                      <td className="text-end">{item.qtyReq}</td>
                      <td className="text-end">{item.qtyFulfilled}</td>
                      <td className="text-end"><strong>{item.qtyPending}</strong></td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {item.orderIds.map(orderId => (
                            <span key={orderId} className="badge bg-info" style={{ fontSize: '0.75rem' }}>
                              {orderId}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {Object.entries(item.statusByOrder).map(([orderId, status]) => (
                          <div key={orderId} className="mb-1">
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>{orderId}:</span>
                            <span className={`badge ${getStatusBadgeClass(status)} ms-1`} style={{ fontSize: '0.7rem' }}>
                              {status}
                            </span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          <div className="mt-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
            <div className="text-muted">
              <small>
                <strong>Total Products:</strong> {productsToShow.length} | 
                <strong className="ms-2">Total Pending Qty:</strong> {productsToShow.reduce((sum, p) => sum + p.qtyPending, 0)}
              </small>
            </div>
            <Button
              variant="success"
              size="sm"
              className="w-100 w-sm-auto"
              onClick={() => {
                const exportData = productsToShow.map(item => ({
                  sku: item.sku || '',
                  product: item.product || '',
                  qtyReq: item.qtyReq,
                  qtyFulfilled: item.qtyFulfilled,
                  qtyPending: item.qtyPending,
                  orderIds: item.orderIds.join(', '),
                  statusByOrder: Object.entries(item.statusByOrder).map(([id, status]) => `${id}: ${status}`).join(' | ')
                }));
                const headers = {
                  sku: 'SKU',
                  product: 'Product',
                  qtyReq: 'Qty Req',
                  qtyFulfilled: 'Qty Fulfilled',
                  qtyPending: 'Qty Pending',
                  orderIds: 'Order IDs',
                  statusByOrder: 'Status by Order'
                };
                exportToCSV(exportData, headers, 'unfulfilled_products_export.csv');
                onShowToast(`Exported ${exportData.length} products to unfulfilled_products_export.csv`);
              }}
            >
              <i className="bi bi-download me-2"></i>
              Download Excel
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductsModal(false)} className="w-100 w-sm-auto">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WebOrderBacklog;
