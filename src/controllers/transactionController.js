const transactionService = require('../services/transactionService');
const cacheService = require('../services/cacheService');

// GET /api/transactions
exports.getAllTransactions = async (req, res) => {
  try {
    // Create a unique cache key based on query parameters
    // We sort keys to ensure consistent cache hits regardless of param order
    const sortedQuery = Object.keys(req.query).sort().reduce((acc, key) => {
      acc[key] = req.query[key];
      return acc;
    }, {});

    const cacheKey = `transactions_${JSON.stringify(sortedQuery)}`;

    // Check cache first
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // If not in cache, fetch from service
    const result = await transactionService.getTransactions(req.query);

    // Store in cache (TTL 3600s - 1 hour)
    cacheService.set(cacheKey, result, 3600);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

// GET /api/transactions/options
// (Helper to populate filter dropdowns in frontend)
exports.getFilterOptions = async (req, res) => {
  try {
    const cacheKey = 'filter_options';

    const cachedOptions = cacheService.get(cacheKey);
    if (cachedOptions) {
      return res.json(cachedOptions);
    }

    const regions = await transactionService.getUniqueValues('region');
    const categories = await transactionService.getUniqueValues('category');
    const result = { regions, categories };

    // Cache options for longer (e.g., 24 hours) as they change less frequently
    cacheService.set(cacheKey, result, 86400);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch options' });
  }
};

// POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const newTransactionData = req.body;
    const savedTransaction = await transactionService.createTransaction(newTransactionData);

    // Invalidate cache so new data appears immediately
    cacheService.flush();

    res.status(201).json(savedTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create transaction', details: err.message });
  }
};

// PUT /api/transactions/:id
exports.updateTransaction = async (req, res) => {
  try {
    const updatedTransaction = await transactionService.updateTransaction(req.params.id, req.body);
    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    // Invalidate cache
    cacheService.flush();
    res.json(updatedTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const deletedTransaction = await transactionService.deleteTransaction(req.params.id);
    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    // Invalidate cache
    cacheService.flush();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

// GET /api/transactions/stats
exports.getStats = async (req, res) => {
  try {
    const cacheKey = 'transaction_stats';
    const cachedStats = cacheService.get(cacheKey);

    if (cachedStats) {
      return res.json(cachedStats);
    }

    const stats = await transactionService.getStats();

    // Cache for 3600 seconds
    cacheService.set(cacheKey, stats, 3600);

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};