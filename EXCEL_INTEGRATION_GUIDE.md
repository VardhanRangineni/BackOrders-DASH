# Back Order Fulfilment Dashboard - Excel Integration Guide

## 📊 Excel File Created

The file **`backorders_data.xlsx`** has been created in the project root with sample data.

## 🚀 How It Works

### Data Persistence
- All changes you make in the application are automatically saved to **localStorage**
- This simulates Excel-based data storage
- Data persists across browser sessions

### Export/Import Workflow

#### 1. **Export Data to Excel**
- Click the **"Export"** button in the top-right header
- Downloads `backorders_data.xlsx` to your Downloads folder
- Contains all current web orders with their product line items

#### 2. **Modify Excel File**
The Excel file has the following columns:
- **Order ID** - Unique order identifier
- **Customer** - Customer name
- **Order Status** - Overall order status (Pending Sourcing, Partially Fulfilled, Completed, Exception)
- **Created** - Order creation timestamp
- **Last Updated** - Last modification timestamp
- **Age (days)** - Days since order creation
- **Order Remarks** - Order-level notes
- **Line ID** - Unique product line identifier
- **Product** - Product name
- **SKU** - Product SKU code
- **Qty Requested** - Quantity requested by customer
- **Qty Fulfilled** - Quantity already fulfilled
- **Qty Pending** - Remaining quantity to fulfill
- **Item Status** - Product-level status
- **Source** - Sourcing method (Store (TO), Distributor (PO), etc.)
- **Linked Docs** - Comma-separated list of linked TO/PO documents
- **Item Remarks** - Product-level notes

#### 3. **Import Modified Data**
- Click the **"Import"** button in the top-right header
- Select your modified Excel file
- Application will reload with the updated data

## ✅ Features Implemented

### 1. **Individual Product Actions**
- ✅ Mark single products as unavailable (not all products in order)
- ✅ Create Manual TO for specific products
- ✅ Mark for Distributor PO for specific products
- ✅ Each action updates only the clicked product using `lineId`

### 2. **Parent Order Status Updates**
When you update product statuses, the parent order status automatically updates:
- **All items Exception** → Order status = Exception
- **All items fulfilled** → Order status = Completed
- **Some items fulfilled** → Order status = Partially Fulfilled

### 3. **Modal Auto-Refresh**
- After performing an action (Create TO/PO, Mark Unavailable)
- Modal automatically closes and reopens with updated data
- No need to manually close and reopen

### 4. **Action Button Logic**
- **Create Manual TO** - Only shows if product has no source assigned
- **Mark for Distributor PO** - Only shows if not already assigned to Store/Distributor
- **Mark Unavailable** - Only shows if status is not already Exception
- Buttons disappear after action is taken (based on new state)

## 🔧 Testing the Application

### Test Scenario 1: Mark Product as Unavailable
1. Go to **Web Orders** tab
2. Click **View** on order **WO-2025-001** (has 2 products)
3. Click the **❌ Mark Unavailable** button on **Ibuprofen 400mg**
4. Only that product should be marked as Exception
5. Paracetamol should remain unchanged
6. Modal refreshes automatically showing updated data

### Test Scenario 2: Create Manual TO
1. Go to **Web Orders** tab
2. View an order with pending items
3. Click **➕ Create Manual TO** on a product
4. New TO document is generated (e.g., TO-2025-XXX)
5. Product status changes to "Partially Fulfilled"
6. Source changes to "Store (TO)"
7. The Create Manual TO button disappears for that product

### Test Scenario 3: Excel Export/Import
1. Make some changes in the UI (mark products unavailable, create TOs)
2. Click **Export** button
3. Open downloaded Excel file
4. Change "Qty Fulfilled" values or statuses
5. Save Excel file
6. Click **Import** button and select the file
7. Application reloads with your Excel changes

## 📁 File Locations

- **Excel File**: `backorders_data.xlsx` (in project root)
- **Data Service**: `src/services/excelDataService.js`
- **Create Excel Script**: `createExcelData.js`
- **Header Component**: `src/components/Header.jsx` (Export/Import buttons)

## 🎯 Current Sample Data

The Excel file contains 5 orders with 7 product lines:
- **WO-2025-001**: 2 products (Paracetamol, Ibuprofen)
- **WO-2025-002**: 1 product (Aspirin)
- **WO-2025-003**: 1 product (Vitamin D3)
- **WO-2025-004**: 1 product (Amoxicillin) - Completed
- **WO-2025-005**: 2 products (Metformin, Atorvastatin)

## 🔄 Regenerate Sample Excel

To recreate the sample Excel file:
```bash
node createExcelData.js
```

This will generate a fresh `backorders_data.xlsx` with default sample data.

## 📝 Notes

- Data is stored in browser localStorage (survives page refresh)
- Excel export/import allows external data management
- All product updates use `lineId` for precise targeting
- Parent order status recalculates based on all item statuses
- Modal refresh happens automatically after actions
