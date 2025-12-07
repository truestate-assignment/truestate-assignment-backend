const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const Transaction = require('./src/models/Transaction');
require('dotenv').config();

const BATCH_SIZE = 1000; // Insert 1000 records at a time
const CSV_FILENAME = 'data.csv'; // Make sure your file is named this

// Helper to map CSV columns to Mongoose Schema
const mapRowToTransaction = (row) => {
  // Safe parsing for numbers to avoid NaNs
  const parseNumber = (val) => (val && !isNaN(val) ? Number(val) : 0);
  
  // Safe parsing for date
  const parseDate = (val) => (val ? new Date(val) : new Date());

  return {
    customerId: row['Customer ID'] || row['Customer_ID'],
    customerName: row['Customer Name'] || row['Customer_Name'],
    phoneNumber: row['Phone Number'] || row['Phone_Number'],
    gender: row['Gender'],
    age: parseNumber(row['Age']),
    region: row['Customer Region'] || row['Customer_Region'],
    customerType: row['Customer Type'] || row['Customer_Type'],
    
    productId: row['Product ID'] || row['Product_ID'],
    productName: row['Product Name'] || row['Product_Name'],
    brand: row['Brand'],
    category: row['Product Category'] || row['Product_Category'],
    // Split tags by comma if it's a string, otherwise empty array
    tags: row['Tags'] ? row['Tags'].split(',').map(t => t.trim()) : [],
    
    quantity: parseNumber(row['Quantity']),
    pricePerUnit: parseNumber(row['Price per Unit']),
    discountPercent: parseNumber(row['Discount Percentage']),
    totalAmount: parseNumber(row['Total Amount']),
    finalAmount: parseNumber(row['Final Amount']),
    
    date: parseDate(row['Date']),
    paymentMethod: row['Payment Method'] || row['Payment_Method'],
    orderStatus: row['Order Status'] || row['Order_Status'],
    deliveryType: row['Delivery Type'] || row['Delivery_Type'],
    storeId: row['Store ID'] || row['Store_ID'],
    storeLocation: row['Store Location'] || row['Store_Location'],
    salespersonId: row['Salesperson ID'] || row['Salesperson_ID'],
    employeeName: row['Employee Name'] || row['Employee_Name']
  };
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing old data...');
    await Transaction.deleteMany({});
    
    console.log(`🚀 Starting stream import from ${CSV_FILENAME}...`);

    let batch = [];
    let totalInserted = 0;

    const stream = fs.createReadStream(CSV_FILENAME).pipe(csv());

    for await (const row of stream) {
      const transactionData = mapRowToTransaction(row);
      batch.push(transactionData);

      if (batch.length >= BATCH_SIZE) {
        await Transaction.insertMany(batch);
        totalInserted += batch.length;
        process.stdout.write(`\r⏳ Inserted ${totalInserted} rows...`);
        batch = []; // Clear memory
      }
    }

    // Insert remaining rows
    if (batch.length > 0) {
      await Transaction.insertMany(batch);
      totalInserted += batch.length;
    }

    console.log(`\n✅ Finished! Total Records: ${totalInserted}`);
    process.exit();

  } catch (err) {
    console.error('\n❌ Error during seeding:', err);
    process.exit(1);
  }
};

seedDatabase();