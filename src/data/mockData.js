// Mock Data for MedPlus Back Order Fulfilment System
// Supports multi-line items per web order with partial fulfillment tracking

export const webOrders = [
  {
    id: 'WO-2025-001',
    customer: 'MedPlus Customer - Hyderabad',
  trackingStatus: 'TO Generated',
    items: [
      {
        lineId: 'WOL-001-1',
        product: 'Paracetamol 500mg',
        sku: 'MED-PAR-500',
        qty: 500,
        qtyFulfilled: 300,
        qtyPending: 200,
        status: 'Partially Fulfilled',
        source: 'Store (TO) - S-HYD-01, S-HYD-03',
        linkedDocs: ['TO-2025-001', 'TO-2025-002']
      },
      {
        lineId: 'WOL-001-2',
        product: 'Ibuprofen 400mg',
        sku: 'MED-IBU-400',
        qty: 300,
        qtyFulfilled: 0,
        qtyPending: 300,
        status: 'Pending Sourcing',
        source: 'Pending',
        linkedDocs: []
      }
    ],
    created: '2025-10-28 09:30:00',
    lastUpdated: '2025-10-29 14:20:00',
    age: 3,
    overallStatus: 'Partially Fulfilled',
    totalItems: 2,
    remarks: 'Multi-product order sourced from multiple stores'
  },
  {
    id: 'WO-2025-002',
    customer: 'Sandeep G.',
  trackingStatus: 'TO In Transit',
    items: [
      {
        lineId: 'WOL-002-1',
        product: 'Aspirin 75mg',
        sku: 'MED-ASP-75',
        qty: 200,
        qtyFulfilled: 0,
        qtyPending: 200,
        status: 'TO Created',
        source: 'Store (TO) - S-BAN-02',
        linkedDocs: ['TO-2025-005']
      }
    ],
    created: '2025-10-28 10:15:00',
    lastUpdated: '2025-10-28 11:00:00',
    age: 3,
    overallStatus: 'TO Created',
    totalItems: 1,
    remarks: ''
  },
  {
    id: 'WO-2025-003',
    customer: 'Dr. Bhaskar R.',
  trackingStatus: 'PO Generated',
    items: [
      {
        lineId: 'WOL-003-1',
        product: 'Vitamin D3 1000IU',
        sku: 'MED-VD3-1000',
        qty: 500,
        qtyFulfilled: 0,
        qtyPending: 500,
        status: 'PO Created',
        source: 'Distributor (PO)',
        linkedDocs: ['PO-2025-001']
      }
    ],
    created: '2025-10-27 14:00:00',
    lastUpdated: '2025-10-28 09:00:00',
    age: 4,
    overallStatus: 'PO Created',
    totalItems: 1,
    remarks: 'After 1 retry'
  },
  {
    id: 'WO-2025-004',
    customer: 'Ravi K.',
  trackingStatus: 'TO Received at Warehouse',
    items: [
      {
        lineId: 'WOL-004-1',
        product: 'Amoxicillin 500mg',
        sku: 'MED-AMX-500',
        qty: 100,
        qtyFulfilled: 100,
        qtyPending: 0,
        status: 'Completed',
        source: 'Store (TO) - S-BAN-02',
        linkedDocs: ['TO-2025-010']
      }
    ],
    created: '2025-10-26 11:00:00',
    lastUpdated: '2025-10-26 18:00:00',
    age: 5,
    overallStatus: 'Completed',
    totalItems: 1,
    remarks: 'Fulfilled by S-BAN-02'
  },
  {
    id: 'WO-2025-005',
    customer: 'Priya S.',
  trackingStatus: 'Market Purchase In Progress',
    items: [
      {
        lineId: 'WOL-005-1',
        product: 'Crocin Advance',
        sku: 'MED-CRO-ADV',
        qty: 300,
        qtyFulfilled: 0,
        qtyPending: 300,
        status: 'Market Purchase',
        source: 'Market Purchase',
        linkedDocs: ['MP-2025-001']
      },
      {
        lineId: 'WOL-005-2',
        product: 'Vicks Vaporub',
        sku: 'MED-VCK-VAP',
        qty: 150,
        qtyFulfilled: 0,
        qtyPending: 150,
        status: 'Market Purchase',
        source: 'Market Purchase',
        linkedDocs: ['MP-2025-002']
      }
    ],
    created: '2025-10-25 08:00:00',
    lastUpdated: '2025-10-29 16:00:00',
    age: 6,
    overallStatus: 'Market Purchase',
    totalItems: 2,
    remarks: 'Unavailable at warehouse, all stores, and distributors after 3 retries. Escalated to market purchase.'
  },
  {
    id: 'WO-2025-006',
    customer: 'Sunita M.',
  trackingStatus: 'Draft Created',
    items: [
      {
        lineId: 'WOL-006-1',
        product: 'Dolo 650mg',
        sku: 'MED-DLO-650',
        qty: 200,
        qtyFulfilled: 0,
        qtyPending: 200,
        status: 'Pending Sourcing',
        source: 'Pending',
        linkedDocs: []
      }
    ],
    created: '2025-10-30 12:00:00',
    lastUpdated: '2025-10-30 12:00:00',
    age: 1,
    overallStatus: 'Pending Sourcing',
    totalItems: 1,
    remarks: ''
  },
  {
    id: 'WO-2025-007',
    customer: 'Vijay P.',
  trackingStatus: 'TO In Transit',
    items: [
      {
        lineId: 'WOL-007-1',
        product: 'Cetirizine 10mg',
        sku: 'MED-CET-10',
        qty: 400,
        qtyFulfilled: 200,
        qtyPending: 200,
        status: 'Partially Fulfilled',
        source: 'Store (TO) - S-HYD-01, S-MUM-05',
        linkedDocs: ['TO-2025-015', 'TO-2025-016']
      }
    ],
    created: '2025-10-24 16:00:00',
    lastUpdated: '2025-10-28 10:00:00',
    age: 7,
    overallStatus: 'Partially Fulfilled',
    totalItems: 1,
    remarks: 'Partial fulfilment from S-HYD-01 (100) and S-MUM-05 (100). Pending 200'
  },
  {
    id: 'WO-2025-008',
    customer: 'Kiran D.',
  trackingStatus: 'PO Received at Warehouse',
    items: [
      {
        lineId: 'WOL-008-1',
        product: 'Metformin 500mg',
        sku: 'MED-MET-500',
        qty: 100,
        qtyFulfilled: 100,
        qtyPending: 0,
        status: 'Completed',
        source: 'Distributor (PO)',
        linkedDocs: ['PO-2025-002']
      }
    ],
    created: '2025-10-20 09:00:00',
    lastUpdated: '2025-10-21 19:30:00',
    age: 11,
    overallStatus: 'Completed',
    totalItems: 1,
    remarks: ''
  },
  {
    id: 'WO-2025-009',
    customer: 'Nikhil R.',
  trackingStatus: 'PO Rejected - Escalated',
    items: [
      {
        lineId: 'WOL-009-1',
        product: 'Azithromycin 500mg',
        sku: 'MED-AZI-500',
        qty: 200,
        qtyFulfilled: 0,
        qtyPending: 200,
        status: 'Market Purchase',
        source: 'Market Purchase',
        linkedDocs: ['PO-2025-003', 'MP-2025-004']
      }
    ],
    created: '2025-10-31 08:00:00',
    lastUpdated: '2025-11-01 14:00:00',
    age: 3,
    overallStatus: 'Market Purchase',
    totalItems: 1,
    remarks: 'PO rejected by distributor. Escalated to market purchase.'
  },
  {
    id: 'WO-2025-010',
    customer: 'Arpit J.',
  trackingStatus: 'Draft Approved - Fulfilled',
    items: [
      {
        lineId: 'WOL-010-1',
        product: 'Omeprazole 20mg',
        sku: 'MED-OMP-20',
        qty: 150,
        qtyFulfilled: 150,
        qtyPending: 0,
        status: 'Completed',
        source: 'Market Purchase',
        linkedDocs: ['MP-2025-003']
      }
    ],
    created: '2025-10-28 13:00:00',
    lastUpdated: '2025-10-30 16:00:00',
    age: 6,
    overallStatus: 'Completed',
    totalItems: 1,
    remarks: 'Store rejected after 2 retries. Successfully fulfilled via market purchase.'
  }
];

export const sourcingOrders = [
  {
    id: 'DRAFT-2025-001',
    type: 'TO',
    docId: 'TO-2025-001',
    webOrder: 'WO-2025-001',
    batchId: 'BATCH-001',
    source: 'Store S-HYD-01 (Hyderabad)',
    destination: 'Central Warehouse',
    status: 'Partially Fulfilled',
    trackingStatus: 'TO Received at Warehouse',
    items: [
      {
        lineId: 'WOL-001-1',
        product: 'Paracetamol 500mg',
        sku: 'MED-PAR-500',
        qtyReq: 500,
        qtyFulfilled: 300,
        qtyPending: 200,
        status: 'Partial'
      },
      {
        lineId: 'WOL-001-2',
        product: 'Aspirin 75mg',
        sku: 'MED-ASP-75',
        qtyReq: 200,
        qtyFulfilled: 200,
        qtyPending: 0,
        status: 'Fulfilled'
      }
    ],
    qtyReq: 700,
    qtyFulfilled: 500,
    retry: 0,
    created: '2025-10-28 08:00:00',
    lastUpdated: '2025-10-28 14:30:00',
    createdBy: 'System Scheduler',
    lastActionedBy: 'User-Store01',
    remarks: 'Partial fulfilment. 200 units of Paracetamol pending',
    popupShown: 5,
    popupSkipped: 1
  },
  {
    id: 'DRAFT-2025-002',
    type: 'TO',
    docId: 'TO-2025-002',
    webOrder: 'WO-2025-001',
    batchId: 'BATCH-001-R1',
    source: 'Store S-BAN-01 (Bangalore)',
    destination: 'Central Warehouse',
    status: 'Draft',
  trackingStatus: 'Draft Created',
    items: [
      {
        lineId: 'WOL-001-1',
        product: 'Paracetamol 500mg',
        sku: 'MED-PAR-500',
        qtyReq: 200,
        qtyFulfilled: 0,
        qtyPending: 200,
        status: 'Pending',
        remarks: 'Remaining qty from TO-2025-001'
      }
    ],
    qtyReq: 200,
    qtyFulfilled: 0,
    retry: 1,
    created: '2025-10-28 15:00:00',
    lastUpdated: '2025-10-28 15:00:00',
    createdBy: 'System Scheduler',
    lastActionedBy: 'System Scheduler',
    remarks: 'Retry 1: Unfulfilled items from TO-2025-001 routed to different store',
    popupShown: 0,
    popupSkipped: 0
  },
  {
    id: 'DRAFT-2025-003',
    type: 'PO',
    docId: 'PO-2025-001',
    webOrder: 'WO-2025-003',
    batchId: 'BATCH-002',
    source: 'MedPlus Distributor DIST-MP-001',
    destination: 'Central Warehouse',
    status: 'Accepted',
    trackingStatus: 'SO Created - Awaiting Dispatch',
    items: [
      {
        lineId: 'WOL-003-1',
        product: 'Ibuprofen 400mg',
        sku: 'MED-IBU-400',
        qtyReq: 150,
        qtyFulfilled: 0,
        qtyPending: 150,
        status: 'Accepted'
      },
      {
        lineId: 'WOL-003-2',
        product: 'Dolo 650mg',
        sku: 'MED-DOL-650',
        qtyReq: 300,
        qtyFulfilled: 0,
        qtyPending: 300,
        status: 'Accepted'
      }
    ],
    qtyReq: 450,
    qtyFulfilled: 0,
    retry: 0,
    created: '2025-10-27 09:30:00',
    lastUpdated: '2025-10-27 10:00:00',
    createdBy: 'System Scheduler',
    lastActionedBy: 'User-MedPlus',
    remarks: 'SO created. Awaiting dispatch',
    popupShown: 0,
    popupSkipped: 0
  },
  {
    id: 'DRAFT-2025-004',
    type: 'TO',
    docId: 'TO-2025-005',
    webOrder: 'WO-2025-002',
    batchId: 'BATCH-001',
    source: 'Store S-CHE-01 (Chennai)',
    destination: 'Central Warehouse',
    status: 'Fulfilled',
    trackingStatus: 'TO Received at Warehouse',
    items: [
      {
        lineId: 'WOL-002-1',
        product: 'Vitamin D3',
        sku: 'MED-VIT-D3',
        qtyReq: 100,
        qtyFulfilled: 100,
        qtyPending: 0,
        status: 'Fulfilled'
      },
      {
        lineId: 'WOL-002-2',
        product: 'Calcium Tablets',
        sku: 'MED-CAL-500',
        qtyReq: 150,
        qtyFulfilled: 150,
        qtyPending: 0,
        status: 'Fulfilled'
      }
    ],
    qtyReq: 250,
    qtyFulfilled: 250,
    retry: 0,
    created: '2025-10-25 10:00:00',
    lastUpdated: '2025-10-25 16:00:00',
    createdBy: 'System Scheduler',
    lastActionedBy: 'User-Store03',
    remarks: 'Completed in 6 hours',
    popupShown: 3,
    popupSkipped: 0
  },
  {
    id: 'DRAFT-2025-005',
    type: 'TO',
    docId: 'TO-2025-010',
    webOrder: 'WO-2025-004',
    batchId: 'BATCH-002',
    source: 'Store S-BAN-02 (Bangalore)',
    destination: 'Central Warehouse',
    status: 'Fulfilled',
    trackingStatus: 'TO Received at Warehouse',
    items: [
      {
        lineId: 'WOL-004-1',
        product: 'Amoxicillin 500mg',
        sku: 'MED-AMX-500',
        qtyReq: 100,
        qtyFulfilled: 100,
        qtyPending: 0,
        status: 'Fulfilled'
      }
    ],
    qtyReq: 100,
    qtyFulfilled: 100,
    retry: 0,
    created: '2025-10-26 11:00:00',
    lastUpdated: '2025-10-26 18:00:00',
    createdBy: 'System Scheduler',
    lastActionedBy: 'User-Store02',
    remarks: 'Completed in 7 hours',
    popupShown: 2,
    popupSkipped: 0
  },
  {
    id: 'DRAFT-2025-006',
    type: 'TO',
    docId: '-',
    webOrder: 'WO-2025-005',
    batchId: 'BATCH-003',
    source: 'Store S-PUN-01 (Pune)',
    destination: 'Central Warehouse',
    status: 'Rejected',
    trackingStatus: 'TO Rejected - Stock Unavailable',
    items: [
      {
        lineId: 'WOL-005-1',
        product: 'Crocin Advance',
        sku: 'MED-CRO-ADV',
        qtyReq: 300,
        qtyFulfilled: 0,
        qtyPending: 300,
        status: 'Rejected',
        remarks: 'Stock unavailable at store'
      }
    ],
    qtyReq: 300,
    qtyFulfilled: 0,
    retry: 3,
    created: '2025-10-26 10:00:00',
    lastUpdated: '2025-10-26 11:30:00',
    createdBy: 'System Scheduler',
    lastActionedBy: 'User-Store04',
    remarks: 'Stock unavailable. Rejected after 1.5 hours',
    popupShown: 3,
    popupSkipped: 0
  },
  {
    id: 'DRAFT-2025-007',
    type: 'PO',
    docId: 'PO-2025-002',
    webOrder: 'WO-2025-008',
    batchId: 'BATCH-004',
    source: 'MedPlus Distributor DIST-MP-002',
    destination: 'Central Warehouse',
  status: 'Fulfilled',
  trackingStatus: 'PO Received at Warehouse',
    items: [
      {
        lineId: 'WOL-008-1',
        product: 'Metformin 500mg',
        sku: 'MED-MET-500',
        qtyReq: 100,
        qtyFulfilled: 100,
        qtyPending: 0,
        status: 'Fulfilled'
      }
    ],
    qtyReq: 100,
    qtyFulfilled: 100,
    retry: 0,
    created: '2025-10-20 09:00:00',
    lastUpdated: '2025-10-20 19:30:00',
    createdBy: 'System Scheduler',
    lastActionedBy: 'User-MedPlus',
    remarks: 'Completed in 10.5 hours via SO conversion',
    popupShown: 0,
    popupSkipped: 0
  },
  {
    id: 'DRAFT-2025-008',
    type: 'TO',
    docId: 'TO-2025-015',
    webOrder: 'WO-2025-007',
    batchId: 'BATCH-003',
    source: 'Store S-HYD-01 (Hyderabad)',
    destination: 'Central Warehouse',
    status: 'Partially Fulfilled',
    trackingStatus: 'TO Partially Received',
    items: [
      {
        lineId: 'WOL-007-1',
        product: 'Cetirizine 10mg',
        sku: 'MED-CET-10',
        qtyReq: 400,
        qtyFulfilled: 200,
        qtyPending: 200,
        status: 'Partial'
      }
    ],
    qtyReq: 400,
    qtyFulfilled: 200,
    retry: 0,
    created: '2025-10-24 16:00:00',
    lastUpdated: '2025-10-25 04:00:00',
    createdBy: 'System Scheduler',
    lastActionedBy: 'User-Store01',
    remarks: 'Partial fulfilment (12 hours). 200 remaining pending',
    popupShown: 3,
    popupSkipped: 1
  },
  {
    id: 'DRAFT-2025-009',
    type: 'TO',
    docId: 'TO-2025-016',
    webOrder: 'WO-2025-007',
    batchId: 'BATCH-003-R1',
    source: 'Store S-MUM-01 (Mumbai)',
    destination: 'Central Warehouse',
    status: 'In Dispatch',
    trackingStatus: 'TO In Transit',
    items: [
      {
        lineId: 'WOL-007-1',
        product: 'Cetirizine 10mg',
        sku: 'MED-CET-10',
        qtyReq: 200,
        qtyFulfilled: 0,
        qtyPending: 200,
        status: 'In Dispatch',
        remarks: 'Remaining qty from TO-2025-015'
      }
    ],
    qtyReq: 200,
    qtyFulfilled: 0,
    retry: 1,
    created: '2025-10-25 05:00:00',
    lastUpdated: '2025-10-25 08:00:00',
    createdBy: 'System Scheduler',
    lastActionedBy: 'User-Store05',
    remarks: 'Retry 1: Unfulfilled items from TO-2025-015 routed to Mumbai store',
    popupShown: 2,
    popupSkipped: 0
  },
  {
    id: 'DRAFT-2025-010',
    type: 'Market Purchase',
    docId: 'MP-2025-001',
    webOrder: 'WO-2025-005',
    batchId: 'BATCH-003',
  source: 'Market Purchase',
    destination: 'Central Warehouse',
    status: 'Approved',
  trackingStatus: 'Market Quote Approved',
    items: [
      {
        lineId: 'WOL-005-1',
        product: 'Crocin Advance',
        sku: 'MED-CRO-ADV',
        qtyReq: 300,
        qtyFulfilled: 0,
        qtyPending: 300,
        status: 'Approved',
        remarks: 'Market purchase approved after store rejection'
      }
    ],
    qtyReq: 300,
    qtyFulfilled: 0,
    retry: 3,
    created: '2025-10-26 12:00:00',
    lastUpdated: '2025-10-26 14:00:00',
    createdBy: 'System (Auto-escalation)',
    lastActionedBy: 'User-Admin-Purchase',
  remarks: 'Escalated to market purchase after 3 failed attempts (Store rejected). Awaiting market confirmation.',
    popupShown: 0,
    popupSkipped: 0,
    marketPurchase: true,
    estimatedCost: 4500,
  vendor: 'Market'
  },
  {
    id: 'DRAFT-2025-011',
    type: 'Market Purchase',
    docId: 'MP-2025-002',
    webOrder: 'WO-2025-005',
    batchId: 'BATCH-003',
  source: 'Market Purchase',
    destination: 'Central Warehouse',
    status: 'In Progress',
  trackingStatus: 'Market Negotiation in Progress',
    items: [
      {
        lineId: 'WOL-005-2',
        product: 'Vicks Vaporub',
        sku: 'MED-VCK-VAP',
        qtyReq: 150,
        qtyFulfilled: 0,
        qtyPending: 150,
        status: 'In Progress',
        remarks: 'Market purchase in progress'
      }
    ],
    qtyReq: 150,
    qtyFulfilled: 0,
    retry: 3,
    created: '2025-10-26 12:00:00',
    lastUpdated: '2025-10-27 10:00:00',
    createdBy: 'System (Auto-escalation)',
    lastActionedBy: 'User-Purchase-Team',
  remarks: 'Market purchase in progress. Market negotiation ongoing. Items unavailable at warehouse, stores, and distributors.',
    popupShown: 0,
    popupSkipped: 0,
    marketPurchase: true,
    estimatedCost: 2250,
  vendor: 'Market'
  },
  {
    id: 'DRAFT-2025-012',
    type: 'Market Purchase',
    docId: 'MP-2025-003',
    webOrder: 'WO-2025-010',
    batchId: 'BATCH-005',
  source: 'Market Purchase',
    destination: 'Central Warehouse',
    status: 'Fulfilled',
    trackingStatus: 'Market Purchase Completed',
    items: [
      {
        lineId: 'WOL-010-1',
        product: 'Omeprazole 20mg',
        sku: 'MED-OMP-20',
        qtyReq: 150,
        qtyFulfilled: 150,
        qtyPending: 0,
        status: 'Fulfilled',
        remarks: 'Market purchase completed successfully'
      }
    ],
    qtyReq: 150,
    qtyFulfilled: 150,
    retry: 2,
    created: '2025-10-29 09:00:00',
    lastUpdated: '2025-10-30 16:00:00',
    createdBy: 'System (Auto-escalation)',
    lastActionedBy: 'User-Purchase-Team',
  remarks: 'Market purchase completed after 2 retries. Product unavailable in all regular channels. Successfully procured from market source.',
    popupShown: 0,
    popupSkipped: 0,
    marketPurchase: true,
    estimatedCost: 3000,
    actualCost: 3150,
  vendor: 'Market'
  },
  {
    id: 'DRAFT-2025-013',
    type: 'PO',
    docId: 'PO-2025-003',
    webOrder: 'WO-2025-009',
    batchId: 'BATCH-006',
    source: 'MedPlus Distributor DIST-MP-003',
    destination: 'Central Warehouse',
    status: 'Rejected',
    trackingStatus: 'PO Rejected - Out of Stock',
    items: [
      {
        lineId: 'WOL-009-1',
        product: 'Azithromycin 500mg',
        sku: 'MED-AZI-500',
        qtyReq: 200,
        qtyFulfilled: 0,
        qtyPending: 200,
        status: 'Rejected',
        remarks: 'Distributor out of stock'
      }
    ],
    qtyReq: 200,
    qtyFulfilled: 0,
    retry: 2,
    created: '2025-10-31 10:00:00',
    lastUpdated: '2025-11-01 09:00:00',
    createdBy: 'System Scheduler',
    lastActionedBy: 'User-Distributor',
    remarks: 'Distributor rejected - Out of stock. Marked for market purchase escalation.',
    popupShown: 2,
    popupSkipped: 0,
    marketPurchase: false
  },
  {
    id: 'DRAFT-2025-014',
    type: 'Market Purchase',
    docId: 'MP-2025-004',
    webOrder: 'WO-2025-009',
    batchId: 'BATCH-006-MP',
  source: 'Market Purchase',
    destination: 'Central Warehouse',
    status: 'Approved',
  trackingStatus: 'Market Quote Received',
    items: [
      {
        lineId: 'WOL-009-1',
        product: 'Azithromycin 500mg',
        sku: 'MED-AZI-500',
        qtyReq: 200,
        qtyFulfilled: 0,
        qtyPending: 200,
        status: 'Approved',
        remarks: 'Escalated to market purchase after distributor rejection'
      }
    ],
    qtyReq: 200,
    qtyFulfilled: 0,
    retry: 2,
    created: '2025-11-01 10:00:00',
    lastUpdated: '2025-11-01 14:00:00',
    createdBy: 'System (Auto-escalation)',
    lastActionedBy: 'User-Admin-Purchase',
  remarks: 'Auto-escalated to market purchase after PO rejection. Market quote received. Awaiting approval.',
    popupShown: 0,
    popupSkipped: 0,
    marketPurchase: true,
    estimatedCost: 5000,
  vendor: 'Market'
  },
  {
    id: 'DRAFT-2025-015',
    type: 'TO',
    docId: 'TO-2025-020',
    webOrder: 'WO-2025-011',
    batchId: 'BATCH-007',
    source: 'Store S-DEL-01 (Delhi)',
    destination: 'Central Warehouse',
    status: 'Draft',
    trackingStatus: 'Draft Created',
    items: [
      {
        lineId: 'WOL-011-1',
        product: 'Ibuprofen 400mg',
        sku: 'MED-IBU-400',
        qtyReq: 100,
        qtyFulfilled: 0,
        qtyPending: 100,
        status: 'Pending',
        remarks: 'New order from Delhi store'
      },
      {
        lineId: 'WOL-011-2',
        product: 'Aspirin 75mg',
        sku: 'MED-ASP-75',
        qtyReq: 150,
        qtyFulfilled: 0,
        qtyPending: 150,
        status: 'Pending',
        remarks: 'New order from Delhi store'
      }
    ],
    qtyReq: 250,
    qtyFulfilled: 0,
    retry: 0,
    created: '2025-11-02 10:00:00',
    lastUpdated: '2025-11-02 10:00:00',
    createdBy: 'System Scheduler',
    lastActionedBy: 'System Scheduler',
    remarks: 'New draft created for Delhi store order',
    popupShown: 0,
    popupSkipped: 0
  },
  {
    id: 'DRAFT-2025-016',
    type: 'PO',
    docId: 'PO-2025-005',
    webOrder: 'WO-2025-012',
    batchId: 'BATCH-008',
    source: 'MedPlus Distributor DIST-MP-004',
    destination: 'Central Warehouse',
    status: 'Accepted',
    trackingStatus: 'SO Created - Awaiting Dispatch',
    items: [
      {
        lineId: 'WOL-012-1',
        product: 'Dolo 650mg',
        sku: 'MED-DOL-650',
        qtyReq: 200,
        qtyFulfilled: 0,
        qtyPending: 200,
        status: 'Accepted',
        remarks: 'Additional order for Dolo 650mg'
      },
      {
        lineId: 'WOL-012-2',
        product: 'Paracetamol 500mg',
        sku: 'MED-PAR-500',
        qtyReq: 250,
        qtyFulfilled: 0,
        qtyPending: 250,
        status: 'Accepted',
        remarks: 'High demand product reorder'
      }
    ],
    qtyReq: 450,
    qtyFulfilled: 0,
    retry: 0,
    created: '2025-11-02 14:00:00',
    lastUpdated: '2025-11-02 15:30:00',
    createdBy: 'System Scheduler',
    lastActionedBy: 'User-MedPlus',
    remarks: 'SO created. Awaiting dispatch for high-demand products',
    popupShown: 0,
    popupSkipped: 0
  }
];
