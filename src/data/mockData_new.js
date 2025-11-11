// Mock Data for MedPlus Back Order Fulfilment System
// Updated with statuses as per requirements document

/* 
 * WEB ORDER LEVEL STATUSES:
 * - Approved
 * - Partially Fulfilled
 * - Fulfilled
 * 
 * PRODUCT LEVEL STATUSES (within web orders):
 * - Pending
 * - Partially Fulfilled Internally
 * - Fully Fulfilled Internally
 * - Draft Created
 * - TO Created / PO Created
 * - Partially Fulfilled
 * - Completely Fulfilled
 * - NA internally
 * - Market Purchase Initiated
 * - NA in Market
 * 
 * TO/PO RECORD STATUSES:
 * - Draft Created
 * - Partially Fulfilled
 * - Fulfilled
 * 
 * TO/PO ORDER STATUSES:
 * - Generated
 * - Dispatched
 * - In transit
 * - Received
 */

export const webOrders = [
  {
    id: 'WO-2025-001',
    customer: 'MedPlus Customer - Hyderabad',
    status: 'Partially Fulfilled',
    items: [
      {
        lineId: 'WOL-001-1',
        product: 'Paracetamol 500mg',
        sku: 'MED-PAR-500',
        qty: 500,
        qtyFulfilled: 300,
        qtyPending: 200,
        status: 'Partially Fulfilled',
        sourceType: 'Store',
        source: 'S-HYD-01, S-HYD-03',
        linkedDocs: ['TO-2025-001', 'TO-2025-002'],
        retries: 0
      },
      {
        lineId: 'WOL-001-2',
        product: 'Ibuprofen 400mg',
        sku: 'MED-IBU-400',
        qty: 300,
        qtyFulfilled: 0,
        qtyPending: 300,
        status: 'Pending',
        sourceType: null,
        source: '',
        linkedDocs: [],
        retries: 0
      }
    ],
    created: '2025-10-28 09:30:00',
    lastUpdated: '2025-10-29 14:20:00',
    age: 3,
    totalItems: 2,
    remarks: 'Multi-product order sourced from multiple stores'
  },
  {
    id: 'WO-2025-002',
    customer: 'Sandeep G.',
    status: 'Approved',
    items: [
      {
        lineId: 'WOL-002-1',
        product: 'Aspirin 75mg',
        sku: 'MED-ASP-75',
        qty: 200,
        qtyFulfilled: 0,
        qtyPending: 200,
        status: 'Draft Created',
        sourceType: 'Store',
        source: 'S-BAN-02',
        linkedDocs: ['DRAFT-2025-005'],
        retries: 0
      }
    ],
    created: '2025-10-28 10:15:00',
    lastUpdated: '2025-10-28 11:00:00',
    age: 3,
    totalItems: 1,
    remarks: ''
  },
  {
    id: 'WO-2025-003',
    customer: 'Dr. Bhaskar R.',
    status: 'Approved',
    items: [
      {
        lineId: 'WOL-003-1',
        product: 'Vitamin D3 1000IU',
        sku: 'MED-VD3-1000',
        qty: 500,
        qtyFulfilled: 0,
        qtyPending: 500,
        status: 'TO Created',
        sourceType: 'Store',
        source: 'S-HYD-05',
        linkedDocs: ['TO-2025-012'],
        retries: 0
      }
    ],
    created: '2025-10-27 14:00:00',
    lastUpdated: '2025-10-28 09:00:00',
    age: 4,
    totalItems: 1,
    remarks: ''
  },
  {
    id: 'WO-2025-004',
    customer: 'Ravi K.',
    status: 'Fulfilled',
    items: [
      {
        lineId: 'WOL-004-1',
        product: 'Amoxicillin 500mg',
        sku: 'MED-AMX-500',
        qty: 100,
        qtyFulfilled: 100,
        qtyPending: 0,
        status: 'Completely Fulfilled',
        sourceType: 'Store',
        source: 'S-BAN-02',
        linkedDocs: ['TO-2025-010'],
        retries: 0
      }
    ],
    created: '2025-10-26 11:00:00',
    lastUpdated: '2025-10-26 18:00:00',
    age: 5,
    totalItems: 1,
    remarks: 'Fulfilled by S-BAN-02'
  },
  {
    id: 'WO-2025-005',
    customer: 'Priya S.',
    status: 'Approved',
    items: [
      {
        lineId: 'WOL-005-1',
        product: 'Crocin Advance',
        sku: 'MED-CRO-ADV',
        qty: 300,
        qtyFulfilled: 0,
        qtyPending: 300,
        status: 'NA internally',
        sourceType: null,
        source: '',
        linkedDocs: [],
        retries: 3
      },
      {
        lineId: 'WOL-005-2',
        product: 'Vicks Vaporub',
        sku: 'MED-VCK-VAP',
        qty: 150,
        qtyFulfilled: 0,
        qtyPending: 150,
        status: 'Market Purchase Initiated',
        sourceType: null,
        source: 'Market',
        linkedDocs: ['MP-2025-002'],
        retries: 3
      }
    ],
    created: '2025-10-25 08:00:00',
    lastUpdated: '2025-10-29 16:00:00',
    age: 6,
    totalItems: 2,
    remarks: 'Unavailable at warehouse, all stores, and distributors after 3 retries.'
  },
  {
    id: 'WO-2025-006',
    customer: 'Sunita M.',
    status: 'Approved',
    items: [
      {
        lineId: 'WOL-006-1',
        product: 'Dolo 650mg',
        sku: 'MED-DLO-650',
        qty: 200,
        qtyFulfilled: 50,
        qtyPending: 150,
        status: 'Partially Fulfilled Internally',
        sourceType: 'Store',
        source: 'S-HYD-02',
        linkedDocs: ['TO-2025-014'],
        retries: 0
      }
    ],
    created: '2025-10-30 12:00:00',
    lastUpdated: '2025-10-30 14:30:00',
    age: 1,
    totalItems: 1,
    remarks: 'Partially fulfilled from internal source'
  },
  {
    id: 'WO-2025-007',
    customer: 'Vijay P.',
    status: 'Approved',
    items: [
      {
        lineId: 'WOL-007-1',
        product: 'Cetirizine 10mg',
        sku: 'MED-CET-10',
        qty: 400,
        qtyFulfilled: 400,
        qtyPending: 0,
        status: 'Fully Fulfilled Internally',
        sourceType: 'Store',
        source: 'S-HYD-01, S-MUM-05',
        linkedDocs: ['TO-2025-015', 'TO-2025-016'],
        retries: 0
      }
    ],
    created: '2025-10-24 16:00:00',
    lastUpdated: '2025-10-28 10:00:00',
    age: 7,
    totalItems: 1,
    remarks: 'Fully fulfilled from stores'
  },
  {
    id: 'WO-2025-008',
    customer: 'Kiran D.',
    status: 'Fulfilled',
    items: [
      {
        lineId: 'WOL-008-1',
        product: 'Metformin 500mg',
        sku: 'MED-MET-500',
        qty: 100,
        qtyFulfilled: 100,
        qtyPending: 0,
        status: 'Completely Fulfilled',
        sourceType: 'Distributor',
        source: 'DIST-01',
        linkedDocs: ['PO-2025-002'],
        retries: 0
      }
    ],
    created: '2025-10-20 09:00:00',
    lastUpdated: '2025-10-21 19:30:00',
    age: 11,
    totalItems: 1,
    remarks: 'Fulfilled via distributor'
  },
  {
    id: 'WO-2025-009',
    customer: 'Nikhil R.',
    status: 'Approved',
    items: [
      {
        lineId: 'WOL-009-1',
        product: 'Azithromycin 500mg',
        sku: 'MED-AZI-500',
        qty: 200,
        qtyFulfilled: 0,
        qtyPending: 200,
        status: 'PO Created',
        sourceType: 'Distributor',
        source: 'DIST-02',
        linkedDocs: ['PO-2025-003'],
        retries: 2
      }
    ],
    created: '2025-10-31 08:00:00',
    lastUpdated: '2025-11-01 14:00:00',
    age: 3,
    totalItems: 1,
    remarks: 'After 2 retries, routed to distributor'
  },
  {
    id: 'WO-2025-010',
    customer: 'Arpit J.',
    status: 'Approved',
    items: [
      {
        lineId: 'WOL-010-1',
        product: 'Omeprazole 20mg',
        sku: 'MED-OMP-20',
        qty: 150,
        qtyFulfilled: 0,
        qtyPending: 150,
        status: 'NA in Market',
        sourceType: null,
        source: '',
        linkedDocs: ['MP-2025-003'],
        retries: 2
      }
    ],
    created: '2025-10-28 13:00:00',
    lastUpdated: '2025-10-30 16:00:00',
    age: 6,
    totalItems: 1,
    remarks: 'Not available in market after escalation'
  }
];

// Sourcing Orders (TO/PO Level Tracking Dashboard Data)
export const sourcingOrders = [
  {
    id: 'RECORD-2025-010',
    type: 'TO',
    docId: 'TO-2025-001',
    webOrder: 'WO-2025-001',
    batchId: 'BATCH-2025-A',
    source: 'S-HYD-01',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Partially Fulfilled',
    status: 'In transit',
    created: '2025-10-28 10:00:00',
    createdBy: 'System',
    remarks: '',
    items: [
      {
        lineId: 'L-001',
        product: 'Paracetamol 500mg',
        sku: 'MED-PAR-500',
        qtyReq: 200,
        qtyFulfilled: 150,
        status: 'Partially Fulfilled'
      }
    ]
  },
  {
    id: 'RECORD-2025-011',
    type: 'TO',
    docId: 'TO-2025-002',
    webOrder: 'WO-2025-001',
    batchId: 'BATCH-2025-A',
    source: 'S-HYD-03',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Fulfilled',
    status: 'Received',
    created: '2025-10-28 11:00:00',
    createdBy: 'System',
    remarks: '',
    items: [
      {
        lineId: 'L-002',
        product: 'Paracetamol 500mg',
        sku: 'MED-PAR-500',
        qtyReq: 100,
        qtyFulfilled: 100,
        status: 'Completely Fulfilled'
      }
    ]
  },
  {
    id: 'RECORD-2025-005',
    type: 'TO',
    docId: 'DRAFT-2025-005',
    webOrder: 'WO-2025-002',
    batchId: 'BATCH-2025-A',
    source: 'S-BAN-02',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-10-28 10:15:00',
    createdBy: 'System',
    remarks: 'Awaiting store confirmation',
    items: [
      {
        lineId: 'L-005',
        product: 'Aspirin 75mg',
        sku: 'MED-ASP-75',
        qtyReq: 200,
        qtyFulfilled: 0,
        status: 'Draft Created'
      }
    ]
  },
  {
    id: 'RECORD-2025-012',
    type: 'TO',
    docId: 'TO-2025-012',
    webOrder: 'WO-2025-003',
    batchId: 'BATCH-2025-B',
    source: 'S-HYD-05',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-10-27 14:30:00',
    createdBy: 'System',
    remarks: '',
    items: [
      {
        lineId: 'L-012',
        product: 'Vitamin D3 1000IU',
        sku: 'MED-VD3-1000',
        qtyReq: 500,
        qtyFulfilled: 0,
        status: 'TO Created'
      }
    ]
  },
  {
    id: 'RECORD-2025-020',
    type: 'TO',
    docId: 'TO-2025-010',
    webOrder: 'WO-2025-004',
    batchId: 'BATCH-2025-B',
    source: 'S-BAN-02',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Fulfilled',
    status: 'Received',
    created: '2025-10-26 11:30:00',
    createdBy: 'System',
    remarks: '',
    items: [
      {
        lineId: 'L-010',
        product: 'Amoxicillin 500mg',
        sku: 'MED-AMX-500',
        qtyReq: 100,
        qtyFulfilled: 100,
        status: 'Completely Fulfilled'
      }
    ]
  },
  {
    id: 'RECORD-2025-MP-002',
    type: 'Market Purchase',
    docId: 'MP-2025-002',
    webOrder: 'WO-2025-005',
    batchId: 'BATCH-2025-A',
    source: 'Market',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-10-29 16:00:00',
    createdBy: 'System',
    remarks: 'NA internally after 3 retries',
    items: [
      {
        lineId: 'L-MP-002',
        product: 'Vicks Vaporub',
        sku: 'MED-VCK-VAP',
        qtyReq: 150,
        qtyFulfilled: 0,
        status: 'Market Purchase Initiated'
      }
    ]
  },
  {
    id: 'RECORD-2025-014',
    type: 'TO',
    docId: 'TO-2025-014',
    webOrder: 'WO-2025-006',
    batchId: 'BATCH-2025-C',
    source: 'S-HYD-02',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Partially Fulfilled',
    status: 'Received',
    created: '2025-10-30 12:30:00',
    createdBy: 'System',
    remarks: 'Partial fulfillment',
    items: [
      {
        lineId: 'L-014',
        product: 'Dolo 650mg',
        sku: 'MED-DLO-650',
        qtyReq: 200,
        qtyFulfilled: 50,
        status: 'Partially Fulfilled Internally'
      }
    ]
  },
  {
    id: 'RECORD-2025-015',
    type: 'TO',
    docId: 'TO-2025-015',
    webOrder: 'WO-2025-007',
    batchId: 'BATCH-2025-C',
    source: 'S-HYD-01',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Fulfilled',
    status: 'Received',
    created: '2025-10-24 17:00:00',
    createdBy: 'System',
    remarks: '',
    items: [
      {
        lineId: 'L-015',
        product: 'Cetirizine 10mg',
        sku: 'MED-CET-10',
        qtyReq: 200,
        qtyFulfilled: 200,
        status: 'Completely Fulfilled'
      }
    ]
  },
  {
    id: 'RECORD-2025-016',
    type: 'TO',
    docId: 'TO-2025-016',
    webOrder: 'WO-2025-007',
    batchId: 'BATCH-2025-C',
    source: 'S-MUM-05',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Fulfilled',
    status: 'Received',
    created: '2025-10-24 17:30:00',
    createdBy: 'System',
    remarks: '',
    items: [
      {
        lineId: 'L-016',
        product: 'Cetirizine 10mg',
        sku: 'MED-CET-10',
        qtyReq: 200,
        qtyFulfilled: 200,
        status: 'Completely Fulfilled'
      }
    ]
  },
  {
    id: 'RECORD-2025-002',
    type: 'PO',
    docId: 'PO-2025-002',
    webOrder: 'WO-2025-008',
    batchId: 'BATCH-2025-B',
    source: 'DIST-01',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Fulfilled',
    status: 'Received',
    created: '2025-10-20 10:00:00',
    createdBy: 'System',
    remarks: 'Fulfilled via distributor',
    items: [
      {
        lineId: 'L-002P',
        product: 'Metformin 500mg',
        sku: 'MED-MET-500',
        qtyReq: 100,
        qtyFulfilled: 100,
        status: 'Completely Fulfilled'
      }
    ]
  },
  {
    id: 'RECORD-2025-003',
    type: 'PO',
    docId: 'PO-2025-003',
    webOrder: 'WO-2025-009',
    batchId: 'BATCH-2025-D',
    source: 'DIST-02',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-11-01 14:00:00',
    createdBy: 'System',
    remarks: 'After 2 retries at stores',
    items: [
      {
        lineId: 'L-003P',
        product: 'Azithromycin 500mg',
        sku: 'MED-AZI-500',
        qtyReq: 200,
        qtyFulfilled: 0,
        status: 'PO Created'
      }
    ]
  },
  {
    id: 'RECORD-2025-MP-003',
    type: 'Market Purchase',
    docId: 'MP-2025-003',
    webOrder: 'WO-2025-010',
    batchId: 'BATCH-2025-D',
    source: 'Market',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-10-30 16:00:00',
    createdBy: 'System',
    remarks: 'Product not available in market',
    items: [
      {
        lineId: 'L-MP-003',
        product: 'Omeprazole 20mg',
        sku: 'MED-OMP-20',
        qtyReq: 150,
        qtyFulfilled: 0,
        status: 'NA in Market'
      }
    ]
  }
];
