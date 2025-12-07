const Transaction = require('../models/Transaction');

exports.getTransactions = async (query) => {
  const {
    search,
    page = 1,
    perPage = 10,
    sortBy = 'date',
    sortOrder = 'desc', // 'asc' or 'desc'

    // Filters
    gender,
    region,
    category,
    minPrice,
    maxPrice,
    startDate,
    endDate
  } = query;

  const filter = {};

  // 1. Search Logic (Case-insensitive Regex for Name & Phone)
  if (search) {
    filter.$or = [
      { customerName: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
      { 'productName': { $regex: search, $options: 'i' } } // Optional: Search product too
    ];
  }

  // 2. Filter Logic
  if (gender) {
    const genderArray = Array.isArray(gender) ? gender : [gender];
    if (genderArray.length > 0) filter.gender = { $in: genderArray };
  }
  if (region) {
    const regionArray = Array.isArray(region) ? region : [region];
    if (regionArray.length > 0) filter.region = { $in: regionArray };
  }
  if (category) {
    const categoryArray = Array.isArray(category) ? category : [category];
    if (categoryArray.length > 0) filter.category = { $in: categoryArray };
  }
  if (query.paymentMethod) {
    const pmArray = Array.isArray(query.paymentMethod) ? query.paymentMethod : [query.paymentMethod];
    if (pmArray.length > 0) filter.paymentMethod = { $in: pmArray };
  }
  if (query.tags) {
    const tagsArray = Array.isArray(query.tags) ? query.tags : [query.tags];
    if (tagsArray.length > 0) filter.tags = { $in: tagsArray };
  }

  // Price Range Filter
  if (minPrice || maxPrice) {
    filter.totalAmount = {};
    if (minPrice) filter.totalAmount.$gte = Number(minPrice);
    if (maxPrice) filter.totalAmount.$lte = Number(maxPrice);
  }

  // Date Range Filter
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // 3. Pagination Setup
  const limit = parseInt(perPage);
  const skip = (parseInt(page) - 1) * limit;

  // 4. Sorting Setup
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // 5. Execute Query
  const transactions = await Transaction.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean(); // Use lean() for performance

  // Get total count for pagination UI
  // Optimization: Use estimatedDocumentCount if no filters are applied
  let total;
  if (Object.keys(filter).length === 0) {
    total = await Transaction.estimatedDocumentCount();
  } else {
    total = await Transaction.countDocuments(filter);
  }

  return {
    data: transactions,
    meta: {
      total,
      page: parseInt(page),
      perPage: limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

exports.getUniqueValues = async (field) => {
  // Helper to get dropdown options for UI
  return await Transaction.distinct(field);
};

exports.createTransaction = async (data) => {
  const transaction = new Transaction(data);
  return await transaction.save();
};

exports.updateTransaction = async (id, data) => {
  return await Transaction.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteTransaction = async (id) => {
  return await Transaction.findByIdAndDelete(id);
};

exports.getStats = async () => {
  const stats = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        totalUnits: { $sum: "$quantity" },
        totalAmount: { $sum: "$totalAmount" },
        totalDiscount: { $sum: 0 }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : { totalUnits: 0, totalAmount: 0, totalDiscount: 0 };
};