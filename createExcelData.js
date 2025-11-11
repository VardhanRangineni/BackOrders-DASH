const XLSX = require('xlsx');

// Initial Web Orders Data
const webOrdersData = [
  {
    'Order ID': 'WO-2025-001',
    'Customer': 'MedPlus Customer - Hyderabad',
    'Order Status': 'Partially Fulfilled',
    'Created': '2025-10-28 09:30:00',
    'Last Updated': '2025-10-29 14:20:00',
    'Age (days)': 3,
    'Order Remarks': 'Multi-product order sourced from multiple stores',
    'Line ID': 'WOL-001-1',
    'Product': 'Paracetamol 500mg',
    'SKU': 'MED-PAR-500',
    'Qty Requested': 500,
    'Qty Fulfilled': 300,
    'Qty Pending': 200,
    'Item Status': 'Partially Fulfilled',
    'Source': 'Store (TO) - S-HYD-01, S-HYD-03',
    'Linked Docs': 'TO-2025-001, TO-2025-002',
    'Item Remarks': ''
  },
  {
    'Order ID': 'WO-2025-001',
    'Customer': 'MedPlus Customer - Hyderabad',
    'Order Status': 'Partially Fulfilled',
    'Created': '2025-10-28 09:30:00',
    'Last Updated': '2025-10-29 14:20:00',
    'Age (days)': 3,
    'Order Remarks': 'Multi-product order sourced from multiple stores',
    'Line ID': 'WOL-001-2',
    'Product': 'Ibuprofen 400mg',
    'SKU': 'MED-IBU-400',
    'Qty Requested': 300,
    'Qty Fulfilled': 0,
    'Qty Pending': 300,
    'Item Status': 'Pending Sourcing',
    'Source': 'Pending',
    'Linked Docs': '',
    'Item Remarks': ''
  },
  {
    'Order ID': 'WO-2025-002',
    'Customer': 'Sandeep G.',
    'Order Status': 'TO Created',
    'Created': '2025-10-28 10:15:00',
    'Last Updated': '2025-10-28 11:00:00',
    'Age (days)': 3,
    'Order Remarks': '',
    'Line ID': 'WOL-002-1',
    'Product': 'Aspirin 75mg',
    'SKU': 'MED-ASP-75',
    'Qty Requested': 200,
    'Qty Fulfilled': 0,
    'Qty Pending': 200,
    'Item Status': 'TO Created',
    'Source': 'Store (TO) - S-BAN-02',
    'Linked Docs': 'TO-2025-005',
    'Item Remarks': ''
  },
  {
    'Order ID': 'WO-2025-003',
    'Customer': 'Dr. Bhaskar R.',
    'Order Status': 'PO Created',
    'Created': '2025-10-27 14:00:00',
    'Last Updated': '2025-10-28 09:00:00',
    'Age (days)': 4,
    'Order Remarks': 'After 1 retry',
    'Line ID': 'WOL-003-1',
    'Product': 'Vitamin D3 1000IU',
    'SKU': 'MED-VD3-1000',
    'Qty Requested': 500,
    'Qty Fulfilled': 0,
    'Qty Pending': 500,
    'Item Status': 'PO Created',
    'Source': 'Distributor (PO)',
    'Linked Docs': 'PO-2025-001',
    'Item Remarks': ''
  },
  {
    'Order ID': 'WO-2025-004',
    'Customer': 'Ravi K.',
    'Order Status': 'Completed',
    'Created': '2025-10-26 11:45:00',
    'Last Updated': '2025-10-27 16:30:00',
    'Age (days)': 5,
    'Order Remarks': '',
    'Line ID': 'WOL-004-1',
    'Product': 'Amoxicillin 500mg',
    'SKU': 'MED-AMX-500',
    'Qty Requested': 100,
    'Qty Fulfilled': 100,
    'Qty Pending': 0,
    'Item Status': 'Completed',
    'Source': 'Store (TO) - S-BAN-02',
    'Linked Docs': 'TO-2025-010',
    'Item Remarks': ''
  },
  {
    'Order ID': 'WO-2025-005',
    'Customer': 'Priya S.',
    'Order Status': 'Pending Sourcing',
    'Created': '2025-10-30 08:00:00',
    'Last Updated': '2025-10-30 08:00:00',
    'Age (days)': 1,
    'Order Remarks': '',
    'Line ID': 'WOL-005-1',
    'Product': 'Metformin 850mg',
    'SKU': 'MED-MET-850',
    'Qty Requested': 300,
    'Qty Fulfilled': 150,
    'Qty Pending': 150,
    'Item Status': 'Partially Fulfilled',
    'Source': 'Store (TO) - S-HYD-01',
    'Linked Docs': 'TO-2025-015',
    'Item Remarks': ''
  },
  {
    'Order ID': 'WO-2025-005',
    'Customer': 'Priya S.',
    'Order Status': 'Pending Sourcing',
    'Created': '2025-10-30 08:00:00',
    'Last Updated': '2025-10-30 08:00:00',
    'Age (days)': 1,
    'Order Remarks': '',
    'Line ID': 'WOL-005-2',
    'Product': 'Atorvastatin 20mg',
    'SKU': 'MED-ATO-20',
    'Qty Requested': 200,
    'Qty Fulfilled': 0,
    'Qty Pending': 200,
    'Item Status': 'Pending Sourcing',
    'Source': '',
    'Linked Docs': '',
    'Item Remarks': ''
  }
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(webOrdersData);

// Set column widths for better readability
const colWidths = [
  { wch: 15 },  // Order ID
  { wch: 30 },  // Customer
  { wch: 20 },  // Order Status
  { wch: 20 },  // Created
  { wch: 20 },  // Last Updated
  { wch: 12 },  // Age (days)
  { wch: 40 },  // Order Remarks
  { wch: 15 },  // Line ID
  { wch: 25 },  // Product
  { wch: 15 },  // SKU
  { wch: 15 },  // Qty Requested
  { wch: 15 },  // Qty Fulfilled
  { wch: 15 },  // Qty Pending
  { wch: 20 },  // Item Status
  { wch: 35 },  // Source
  { wch: 30 },  // Linked Docs
  { wch: 40 }   // Item Remarks
];
worksheet['!cols'] = colWidths;

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Web Orders');

// Write the file
XLSX.writeFile(workbook, 'backorders_data.xlsx');

