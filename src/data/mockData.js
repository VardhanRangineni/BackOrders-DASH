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
  },
  {
    id: 'WO-2025-011',
    customer: 'Rajesh Kumar - Mumbai',
    status: 'Partially Fulfilled',
    items: [
      {
        lineId: 'WOL-011-1',
        product: 'Crocin 650mg',
        sku: 'MED-CRO-650',
        qty: 400,
        qtyFulfilled: 200,
        qtyPending: 200,
        status: 'Partially Fulfilled',
        sourceType: 'Store',
        source: 'S-MUM-01',
        linkedDocs: ['TO-2025-020', 'TO-2025-020-R1'],
        retries: 1
      },
      {
        lineId: 'WOL-011-2',
        product: 'Disprin 325mg',
        sku: 'MED-DIS-325',
        qty: 300,
        qtyFulfilled: 300,
        qtyPending: 0,
        status: 'Completely Fulfilled',
        sourceType: 'Store',
        source: 'S-MUM-02',
        linkedDocs: ['TO-2025-021'],
        retries: 0
      },
      {
        lineId: 'WOL-011-3',
        product: 'Combiflam',
        sku: 'MED-COM-TAB',
        qty: 250,
        qtyFulfilled: 0,
        qtyPending: 250,
        status: 'Draft Created',
        sourceType: 'Store',
        source: 'S-MUM-03',
        linkedDocs: ['DRAFT-2025-022'],
        retries: 2
      },
      {
        lineId: 'WOL-011-4',
        product: 'Vicks Action 500',
        sku: 'MED-VCK-500',
        qty: 150,
        qtyFulfilled: 0,
        qtyPending: 150,
        status: 'NA internally',
        sourceType: null,
        source: '',
        linkedDocs: [],
        retries: 3
      }
    ],
    created: '2025-11-01 10:00:00',
    lastUpdated: '2025-11-05 16:30:00',
    age: 6,
    totalItems: 4,
    remarks: 'Large multi-product order with mixed fulfillment status and varying retry counts'
  },
  {
    id: 'WO-2025-012',
    customer: 'Apollo Pharmacy - Bangalore',
    status: 'Approved',
    items: [
      {
        lineId: 'WOL-012-1',
        product: 'Dolo 650mg',
        sku: 'MED-DLO-650',
        qty: 500,
        qtyFulfilled: 150,
        qtyPending: 350,
        status: 'Partially Fulfilled Internally',
        sourceType: 'Store',
        source: 'S-BAN-05, S-BAN-07',
        linkedDocs: ['TO-2025-023', 'TO-2025-024', 'TO-2025-024-R1'],
        retries: 1
      },
      {
        lineId: 'WOL-012-2',
        product: 'Calpol 500mg',
        sku: 'MED-CAL-500',
        qty: 600,
        qtyFulfilled: 200,
        qtyPending: 400,
        status: 'PO Created',
        sourceType: 'Distributor',
        source: 'DIST-03',
        linkedDocs: ['TO-2025-025', 'PO-2025-004'],
        retries: 2
      },
      {
        lineId: 'WOL-012-3',
        product: 'Brufen 400mg',
        sku: 'MED-BRU-400',
        qty: 300,
        qtyFulfilled: 0,
        qtyPending: 300,
        status: 'TO Created',
        sourceType: 'Store',
        source: 'S-BAN-10',
        linkedDocs: ['TO-2025-026'],
        retries: 0
      }
    ],
    created: '2025-11-02 14:30:00',
    lastUpdated: '2025-11-06 11:20:00',
    age: 5,
    totalItems: 3,
    remarks: 'Bulk pharmacy order with multiple sourcing attempts'
  },
  {
    id: 'WO-2025-013',
    customer: 'MedPlus - Kolkata Branch',
    status: 'Approved',
    items: [
      {
        lineId: 'WOL-013-1',
        product: 'Sinarest',
        sku: 'MED-SIN-TAB',
        qty: 200,
        qtyFulfilled: 0,
        qtyPending: 200,
        status: 'Market Purchase Initiated',
        sourceType: null,
        source: 'Market',
        linkedDocs: ['MP-2025-005'],
        retries: 3
      },
      {
        lineId: 'WOL-013-2',
        product: 'D-Cold Total',
        sku: 'MED-DCL-TAB',
        qty: 180,
        qtyFulfilled: 0,
        qtyPending: 180,
        status: 'Draft Created',
        sourceType: 'Distributor',
        source: 'DIST-04',
        linkedDocs: ['DRAFT-2025-027'],
        retries: 2
      }
    ],
    created: '2025-11-03 08:15:00',
    lastUpdated: '2025-11-07 15:45:00',
    age: 4,
    totalItems: 2,
    remarks: 'Cold & flu medicines - high retry counts due to stock shortage'
  }
];

// Sourcing Orders (TO/PO Level Tracking Dashboard Data)
export const sourcingOrders = [
  {
    id: 'RECORD-2025-025',
    type: 'TO',
    docId: 'TO-2025-025',
    webOrder: 'WO-2025-015',
    batchId: 'BATCH-2025-F',
    source: 'S-DEL-03',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Partially Fulfilled',
    status: 'Received',
    created: '2025-11-10 10:00:00',
    lastUpdated: '2025-11-11 15:30:00',
    createdBy: 'System',
    remarks: 'Partially fulfilled - awaiting retry draft creation',
    retry: 0,
    qtyReq: 300,
    qtyFulfilled: 120,
    items: [
      {
        lineId: 'L-025',
        product: 'Vitamin C 500mg',
        sku: 'MED-VTC-500',
        qtyReq: 300,
        qtyFulfilled: 120,
        status: 'Partially Fulfilled'
      }
    ]
  },
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
    lastUpdated: '2025-10-29 14:00:00',
    createdBy: 'System',
    remarks: '',
    retry: 0,
    qtyReq: 200,
    qtyFulfilled: 150,
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
    destination: 'WH-LOCAL-HYD',
    recordStatus: 'Fulfilled',
    status: 'Received',
    created: '2025-10-28 11:00:00',
    lastUpdated: '2025-10-29 18:00:00',
    createdBy: 'System',
    remarks: '',
    retry: 0,
    qtyReq: 100,
    qtyFulfilled: 100,
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
    id: 'RECORD-2025-010-RETRY',
    type: 'TO',
    docId: 'TO-2025-001-RETRY',
    webOrder: 'WO-2025-001',
    batchId: 'BATCH-2025-A-R1',
    source: 'S-HYD-06',
    destination: 'WH-LOCAL-HYD',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-10-30 10:00:00',
    lastUpdated: '2025-10-30 10:00:00',
    createdBy: 'System',
    remarks: 'Retry draft for remaining 50 units from TO-2025-001',
    retry: 1,
    qtyReq: 50,
    qtyFulfilled: 0,
    items: [
      {
        lineId: 'L-001-R1',
        product: 'Paracetamol 500mg',
        sku: 'MED-PAR-500',
        qtyReq: 50,
        qtyFulfilled: 0,
        status: 'Draft Created'
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
    destination: 'WH-LOCAL-BAN',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-10-28 10:15:00',
    lastUpdated: '2025-10-28 10:15:00',
    createdBy: 'System',
    remarks: 'Awaiting store confirmation',
    retry: 0,
    qtyReq: 200,
    qtyFulfilled: 0,
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
    destination: 'WH-LOCAL-HYD',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-10-27 14:30:00',
    lastUpdated: '2025-10-27 14:30:00',
    createdBy: 'System',
    remarks: '',
    retry: 0,
    qtyReq: 500,
    qtyFulfilled: 0,
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
    destination: 'WH-LOCAL-BAN',
    recordStatus: 'Fulfilled',
    status: 'Received',
    created: '2025-10-26 11:30:00',
    lastUpdated: '2025-10-26 18:00:00',
    createdBy: 'System',
    remarks: '',
    retry: 0,
    qtyReq: 100,
    qtyFulfilled: 100,
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
    id: 'RECORD-2025-005-CRO',
    type: 'TO',
    docId: 'DRAFT-2025-005-CRO',
    webOrder: 'WO-2025-005',
    batchId: 'BATCH-2025-A-R3',
    source: 'S-BAN-06',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-10-29 15:00:00',
    lastUpdated: '2025-10-29 15:00:00',
    createdBy: 'System',
    remarks: 'Crocin Advance - marked NA internally after 3 retries',
    retry: 3,
    qtyReq: 300,
    qtyFulfilled: 0,
    items: [
      {
        lineId: 'L-005-CRO',
        product: 'Crocin Advance',
        sku: 'MED-CRO-ADV',
        qtyReq: 300,
        qtyFulfilled: 0,
        status: 'NA internally'
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
    lastUpdated: '2025-10-29 16:00:00',
    createdBy: 'System',
    remarks: 'NA internally after 3 retries',
    retry: 3,
    qtyReq: 150,
    qtyFulfilled: 0,
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
    lastUpdated: '2025-10-30 14:30:00',
    createdBy: 'System',
    remarks: 'Partial fulfillment - 50/200 units fulfilled',
    retry: 0,
    qtyReq: 200,
    qtyFulfilled: 50,
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
    id: 'RECORD-2025-014-RETRY',
    type: 'TO',
    docId: 'TO-2025-014-RETRY',
    webOrder: 'WO-2025-006',
    batchId: 'BATCH-2025-C-R1',
    source: 'S-MUM-03',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-10-31 09:00:00',
    lastUpdated: '2025-10-31 09:00:00',
    createdBy: 'System',
    remarks: 'Retry draft for remaining 150 units from TO-2025-014',
    retry: 1,
    qtyReq: 150,
    qtyFulfilled: 0,
    items: [
      {
        lineId: 'L-014-R1',
        product: 'Dolo 650mg',
        sku: 'MED-DLO-650',
        qtyReq: 150,
        qtyFulfilled: 0,
        status: 'Draft Created'
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
    lastUpdated: '2025-10-28 10:00:00',
    createdBy: 'System',
    remarks: '',
    retry: 0,
    qtyReq: 200,
    qtyFulfilled: 200,
    items: [
      {
        lineId: 'L-015',
        product: 'Cetirizine 10mg',
        sku: 'MED-CET-10',
        qtyReq: 200,
        qtyFulfilled: 200,
        status: 'Fully Fulfilled Internally'
      }
    ]
  },
  {
    id: 'RECORD-2025-016',
    type: 'TO',
    docId: 'TO-2025-016',
    webOrder: 'WO-2025-007',
    batchId: 'BATCH-2025-C',
    source: 'S-HYD-05',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Fulfilled',
    status: 'Received',
    created: '2025-10-24 17:30:00',
    lastUpdated: '2025-10-28 10:00:00',
    createdBy: 'System',
    remarks: '',
    retry: 0,
    qtyReq: 200,
    qtyFulfilled: 200,
    items: [
      {
        lineId: 'L-016',
        product: 'Cetirizine 10mg',
        sku: 'MED-CET-10',
        qtyReq: 200,
        qtyFulfilled: 200,
        status: 'Fully Fulfilled Internally'
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
    lastUpdated: '2025-10-21 19:30:00',
    createdBy: 'System',
    remarks: 'Fulfilled via distributor',
    retry: 0,
    qtyReq: 100,
    qtyFulfilled: 100,
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
    lastUpdated: '2025-11-01 14:00:00',
    createdBy: 'System',
    remarks: 'After 2 retries at stores',
    retry: 2,
    qtyReq: 200,
    qtyFulfilled: 0,
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
    recordStatus: 'Rejected',
    status: 'Rejected',
    created: '2025-10-30 16:00:00',
    lastUpdated: '2025-10-31 10:30:00',
    createdBy: 'System',
    remarks: 'Product not available in market',
    retry: 2,
    qtyReq: 150,
    qtyFulfilled: 0,
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
  },
  {
    id: 'RECORD-2025-021',
    type: 'TO',
    docId: 'TO-2025-020',
    webOrder: 'WO-2025-011',
    batchId: 'BATCH-2025-E',
    source: 'S-MUM-01',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Partially Fulfilled',
    status: 'Received',
    created: '2025-11-01 11:00:00',
    lastUpdated: '2025-11-03 14:00:00',
    createdBy: 'System',
    remarks: 'Crocin partially fulfilled - 200/400 units',
    retry: 0,
    qtyReq: 400,
    qtyFulfilled: 200,
    items: [
      {
        lineId: 'L-020',
        product: 'Crocin 650mg',
        sku: 'MED-CRO-650',
        qtyReq: 400,
        qtyFulfilled: 200,
        status: 'Partially Fulfilled'
      }
    ]
  },
  {
    id: 'RECORD-2025-021-R1',
    type: 'TO',
    docId: 'TO-2025-020-R1',
    webOrder: 'WO-2025-011',
    batchId: 'BATCH-2025-E-R1',
    source: 'S-MUM-04',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-11-04 09:30:00',
    lastUpdated: '2025-11-04 09:30:00',
    createdBy: 'System',
    remarks: 'Retry for remaining 200 units of Crocin',
    retry: 1,
    qtyReq: 200,
    qtyFulfilled: 0,
    items: [
      {
        lineId: 'L-020-R1',
        product: 'Crocin 650mg',
        sku: 'MED-CRO-650',
        qtyReq: 200,
        qtyFulfilled: 0,
        status: 'Draft Created'
      }
    ]
  },
  {
    id: 'RECORD-2025-022',
    type: 'TO',
    docId: 'TO-2025-021',
    webOrder: 'WO-2025-011',
    batchId: 'BATCH-2025-E',
    source: 'S-MUM-02',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Fulfilled',
    status: 'Received',
    created: '2025-11-01 11:15:00',
    lastUpdated: '2025-11-02 16:30:00',
    createdBy: 'System',
    remarks: 'Disprin fully fulfilled',
    retry: 0,
    qtyReq: 300,
    qtyFulfilled: 300,
    items: [
      {
        lineId: 'L-021',
        product: 'Disprin 325mg',
        sku: 'MED-DIS-325',
        qtyReq: 300,
        qtyFulfilled: 300,
        status: 'Completely Fulfilled'
      }
    ]
  },
  {
    id: 'RECORD-2025-023',
    type: 'TO',
    docId: 'DRAFT-2025-022',
    webOrder: 'WO-2025-011',
    batchId: 'BATCH-2025-E-R2',
    source: 'S-MUM-03',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-11-05 10:00:00',
    lastUpdated: '2025-11-05 10:00:00',
    createdBy: 'System',
    remarks: 'Third attempt (retry=2) for Combiflam',
    retry: 2,
    qtyReq: 250,
    qtyFulfilled: 0,
    items: [
      {
        lineId: 'L-022',
        product: 'Combiflam',
        sku: 'MED-COM-TAB',
        qtyReq: 250,
        qtyFulfilled: 0,
        status: 'Draft Created'
      }
    ]
  },
  {
    id: 'RECORD-2025-023-VCK',
    type: 'TO',
    docId: 'DRAFT-2025-023',
    webOrder: 'WO-2025-011',
    batchId: 'BATCH-2025-E-R3',
    source: 'S-MUM-05',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-11-05 11:00:00',
    lastUpdated: '2025-11-05 11:00:00',
    createdBy: 'System',
    remarks: 'Vicks Action 500 - attempted from S-MUM-05, marked NA internally',
    retry: 2,
    qtyReq: 150,
    qtyFulfilled: 0,
    items: [
      {
        lineId: 'L-023-VCK',
        product: 'Vicks Action 500',
        sku: 'MED-VCK-500',
        qtyReq: 150,
        qtyFulfilled: 0,
        status: 'NA internally'
      }
    ]
  },
  {
    id: 'RECORD-2025-024',
    type: 'TO',
    docId: 'TO-2025-023',
    webOrder: 'WO-2025-012',
    batchId: 'BATCH-2025-F',
    source: 'S-BAN-05',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Fulfilled',
    status: 'Received',
    created: '2025-11-02 15:00:00',
    lastUpdated: '2025-11-03 10:00:00',
    createdBy: 'System',
    remarks: 'First Dolo batch - 100 units',
    retry: 0,
    qtyReq: 250,
    qtyFulfilled: 100,
    items: [
      {
        lineId: 'L-023-1',
        product: 'Dolo 650mg',
        sku: 'MED-DLO-650',
        qtyReq: 250,
        qtyFulfilled: 100,
        status: 'Partially Fulfilled Internally'
      }
    ]
  },
  {
    id: 'RECORD-2025-026',
    type: 'TO',
    docId: 'TO-2025-024',
    webOrder: 'WO-2025-012',
    batchId: 'BATCH-2025-F',
    source: 'S-BAN-07',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Partially Fulfilled',
    status: 'Received',
    created: '2025-11-02 15:30:00',
    lastUpdated: '2025-11-04 09:00:00',
    createdBy: 'System',
    remarks: 'Second Dolo batch - 50/250 units fulfilled',
    retry: 0,
    qtyReq: 250,
    qtyFulfilled: 50,
    items: [
      {
        lineId: 'L-024-1',
        product: 'Dolo 650mg',
        sku: 'MED-DLO-650',
        qtyReq: 250,
        qtyFulfilled: 50,
        status: 'Partially Fulfilled Internally'
      }
    ]
  },
  {
    id: 'RECORD-2025-024-R1',
    type: 'TO',
    docId: 'TO-2025-024-R1',
    webOrder: 'WO-2025-012',
    batchId: 'BATCH-2025-F-R1',
    source: 'S-BAN-09',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-11-05 08:00:00',
    lastUpdated: '2025-11-05 08:00:00',
    createdBy: 'System',
    remarks: 'Retry for remaining 200 Dolo units',
    retry: 1,
    qtyReq: 200,
    qtyFulfilled: 0,
    items: [
      {
        lineId: 'L-024-R1',
        product: 'Dolo 650mg',
        sku: 'MED-DLO-650',
        qtyReq: 200,
        qtyFulfilled: 0,
        status: 'Draft Created'
      }
    ]
  },
  {
    id: 'RECORD-2025-027',
    type: 'TO',
    docId: 'TO-2025-025',
    webOrder: 'WO-2025-012',
    batchId: 'BATCH-2025-F',
    source: 'S-BAN-08',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Partially Fulfilled',
    status: 'Received',
    created: '2025-11-02 16:00:00',
    lastUpdated: '2025-11-04 11:00:00',
    createdBy: 'System',
    remarks: 'Calpol partially fulfilled from store - 200/400 units',
    retry: 1,
    qtyReq: 400,
    qtyFulfilled: 200,
    items: [
      {
        lineId: 'L-025',
        product: 'Calpol 500mg',
        sku: 'MED-CAL-500',
        qtyReq: 400,
        qtyFulfilled: 200,
        status: 'Partially Fulfilled Internally'
      }
    ]
  },
  {
    id: 'RECORD-2025-PO-004',
    type: 'PO',
    docId: 'PO-2025-004',
    webOrder: 'WO-2025-012',
    batchId: 'BATCH-2025-F-R2',
    source: 'DIST-03',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-11-05 14:00:00',
    lastUpdated: '2025-11-05 14:00:00',
    createdBy: 'System',
    remarks: 'Escalated to distributor after 2 retries - remaining 200 Calpol units',
    retry: 2,
    qtyReq: 200,
    qtyFulfilled: 0,
    items: [
      {
        lineId: 'L-PO-004',
        product: 'Calpol 500mg',
        sku: 'MED-CAL-500',
        qtyReq: 200,
        qtyFulfilled: 0,
        status: 'PO Created'
      }
    ]
  },
  {
    id: 'RECORD-2025-028',
    type: 'TO',
    docId: 'TO-2025-026',
    webOrder: 'WO-2025-012',
    batchId: 'BATCH-2025-F',
    source: 'S-BAN-10',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-11-02 16:30:00',
    lastUpdated: '2025-11-02 16:30:00',
    createdBy: 'System',
    remarks: 'Brufen - first attempt',
    retry: 0,
    qtyReq: 300,
    qtyFulfilled: 0,
    items: [
      {
        lineId: 'L-026',
        product: 'Brufen 400mg',
        sku: 'MED-BRU-400',
        qtyReq: 300,
        qtyFulfilled: 0,
        status: 'TO Created'
      }
    ]
  },
  {
    id: 'RECORD-2025-MULTI-027',
    type: 'TO',
    docId: 'TO-2025-027-MULTI',
    webOrder: 'WO-2025-012',
    batchId: 'BATCH-2025-F',
    source: 'S-BAN-11',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Partially Fulfilled',
    status: 'In transit',
    created: '2025-11-06 10:00:00',
    lastUpdated: '2025-11-07 14:00:00',
    createdBy: 'System',
    remarks: 'Multi-product TO with mixed fulfillment',
    retry: 0,
    qtyReq: 800,
    qtyFulfilled: 250,
    items: [
      {
        lineId: 'L-027-1',
        product: 'Dolo 650mg',
        sku: 'MED-DLO-650',
        qtyReq: 150,
        qtyFulfilled: 50,
        status: 'Partially Fulfilled Internally'
      },
      {
        lineId: 'L-027-2',
        product: 'Calpol 500mg',
        sku: 'MED-CAL-500',
        qtyReq: 200,
        qtyFulfilled: 200,
        status: 'Completely Fulfilled'
      },
      {
        lineId: 'L-027-3',
        product: 'Brufen 400mg',
        sku: 'MED-BRU-400',
        qtyReq: 450,
        qtyFulfilled: 0,
        status: 'Pending'
      }
    ]
  },
  {
    id: 'RECORD-2025-MP-005',
    type: 'Market Purchase',
    docId: 'MP-2025-005',
    webOrder: 'WO-2025-013',
    batchId: 'BATCH-2025-G',
    source: 'Market',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-11-07 09:00:00',
    lastUpdated: '2025-11-07 09:00:00',
    createdBy: 'System',
    remarks: 'Sinarest - escalated to market after 3 retries',
    retry: 3,
    qtyReq: 200,
    qtyFulfilled: 0,
    items: [
      {
        lineId: 'L-MP-005',
        product: 'Sinarest',
        sku: 'MED-SIN-TAB',
        qtyReq: 200,
        qtyFulfilled: 0,
        status: 'Market Purchase Initiated'
      }
    ]
  },
  {
    id: 'RECORD-2025-029',
    type: 'TO',
    docId: 'DRAFT-2025-027',
    webOrder: 'WO-2025-013',
    batchId: 'BATCH-2025-G-R2',
    source: 'DIST-04',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-11-07 10:00:00',
    lastUpdated: '2025-11-07 10:00:00',
    createdBy: 'System',
    remarks: 'D-Cold - third attempt from distributor',
    retry: 2,
    qtyReq: 180,
    qtyFulfilled: 0,
    items: [
      {
        lineId: 'L-027',
        product: 'D-Cold Total',
        sku: 'MED-DCL-TAB',
        qtyReq: 180,
        qtyFulfilled: 0,
        status: 'Draft Created'
      }
    ]
  },
  {
    id: 'RECORD-2025-MULTI-028',
    type: 'TO',
    docId: 'TO-2025-028-MULTI',
    webOrder: 'WO-2025-011',
    batchId: 'BATCH-2025-H',
    source: 'S-HYD-15',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Fulfilled',
    status: 'Received',
    created: '2025-11-05 11:00:00',
    lastUpdated: '2025-11-08 16:00:00',
    createdBy: 'System',
    remarks: 'Multi-product TO - all items fulfilled',
    retry: 0,
    qtyReq: 700,
    qtyFulfilled: 700,
    items: [
      {
        lineId: 'L-028-1',
        product: 'Paracetamol 500mg',
        sku: 'MED-PAR-500',
        qtyReq: 250,
        qtyFulfilled: 250,
        status: 'Completely Fulfilled'
      },
      {
        lineId: 'L-028-2',
        product: 'Aspirin 75mg',
        sku: 'MED-ASP-75',
        qtyReq: 200,
        qtyFulfilled: 200,
        status: 'Completely Fulfilled'
      },
      {
        lineId: 'L-028-3',
        product: 'Ibuprofen 400mg',
        sku: 'MED-IBU-400',
        qtyReq: 150,
        qtyFulfilled: 150,
        status: 'Completely Fulfilled'
      },
      {
        lineId: 'L-028-4',
        product: 'Cetirizine 10mg',
        sku: 'MED-CET-10',
        qtyReq: 100,
        qtyFulfilled: 100,
        status: 'Completely Fulfilled'
      }
    ]
  },
  {
    id: 'RECORD-2025-MULTI-029',
    type: 'PO',
    docId: 'PO-2025-029-MULTI',
    webOrder: 'WO-2025-011',
    batchId: 'BATCH-2025-H-R1',
    source: 'DIST-07',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Partially Fulfilled',
    status: 'Dispatched',
    created: '2025-11-06 14:00:00',
    lastUpdated: '2025-11-09 10:00:00',
    createdBy: 'System',
    remarks: 'Multi-product PO - partial fulfillment, 3 out of 5 products received',
    retry: 1,
    qtyReq: 850,
    qtyFulfilled: 480,
    items: [
      {
        lineId: 'L-029-1',
        product: 'Paracetamol 500mg',
        sku: 'MED-PAR-500',
        qtyReq: 150,
        qtyFulfilled: 150,
        status: 'Completely Fulfilled'
      },
      {
        lineId: 'L-029-2',
        product: 'Aspirin 75mg',
        sku: 'MED-ASP-75',
        qtyReq: 200,
        qtyFulfilled: 200,
        status: 'Completely Fulfilled'
      },
      {
        lineId: 'L-029-3',
        product: 'Ibuprofen 400mg',
        sku: 'MED-IBU-400',
        qtyReq: 180,
        qtyFulfilled: 130,
        status: 'Partially Fulfilled'
      },
      {
        lineId: 'L-029-4',
        product: 'Cetirizine 10mg',
        sku: 'MED-CET-10',
        qtyReq: 170,
        qtyFulfilled: 0,
        status: 'Pending'
      },
      {
        lineId: 'L-029-5',
        product: 'Dolo 650mg',
        sku: 'MED-DLO-650',
        qtyReq: 150,
        qtyFulfilled: 0,
        status: 'Pending'
      }
    ]
  },
  {
    id: 'RECORD-2025-MULTI-030',
    type: 'TO',
    docId: 'TO-2025-030-MULTI',
    webOrder: 'WO-2025-012',
    batchId: 'BATCH-2025-I',
    source: 'S-BAN-20',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Draft Created',
    status: 'Generated',
    created: '2025-11-08 09:00:00',
    lastUpdated: '2025-11-08 09:00:00',
    createdBy: 'System',
    remarks: 'Multi-product TO - newly created draft',
    retry: 0,
    qtyReq: 500,
    qtyFulfilled: 0,
    items: [
      {
        lineId: 'L-030-1',
        product: 'Dolo 650mg',
        sku: 'MED-DLO-650',
        qtyReq: 200,
        qtyFulfilled: 0,
        status: 'Draft Created'
      },
      {
        lineId: 'L-030-2',
        product: 'Calpol 500mg',
        sku: 'MED-CAL-500',
        qtyReq: 150,
        qtyFulfilled: 0,
        status: 'Draft Created'
      },
      {
        lineId: 'L-030-3',
        product: 'Brufen 400mg',
        sku: 'MED-BRU-400',
        qtyReq: 150,
        qtyFulfilled: 0,
        status: 'Draft Created'
      }
    ]
  },
  {
    id: 'RECORD-2025-MULTI-031',
    type: 'TO',
    docId: 'TO-2025-031-MULTI',
    webOrder: 'WO-2025-001',
    batchId: 'BATCH-2025-J',
    source: 'S-HYD-08',
    destination: 'WH-CENTRAL-01',
    recordStatus: 'Partially Fulfilled',
    status: 'In transit',
    created: '2025-11-01 13:00:00',
    lastUpdated: '2025-11-05 11:00:00',
    createdBy: 'System',
    remarks: 'Multi-product TO with retry - mixed results',
    retry: 2,
    qtyReq: 450,
    qtyFulfilled: 180,
    items: [
      {
        lineId: 'L-031-1',
        product: 'Paracetamol 500mg',
        sku: 'MED-PAR-500',
        qtyReq: 300,
        qtyFulfilled: 180,
        status: 'Partially Fulfilled'
      },
      {
        lineId: 'L-031-2',
        product: 'Ibuprofen 400mg',
        sku: 'MED-IBU-400',
        qtyReq: 150,
        qtyFulfilled: 0,
        status: 'Pending'
      }
    ]
  }
];
