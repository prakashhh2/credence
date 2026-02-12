/**
 * Transaction Tracker Service
 * Tracks and manages blockchain transactions and receipts
 */

const STORAGE_KEY = 'credence_transactions';
const MAX_STORED_TX = 50; // Keep last 50 transactions

/**
 * Transaction interface:
 * {
 *   id: string (unique ID),
 *   certificateHash: string,
 *   type: 'issue' | 'claim' | 'verify' | 'revoke',
 *   transactionHash: string,
 *   blockNumber: number,
 *   gasUsed: string,
 *   status: 'pending' | 'success' | 'failed',
 *   error: string (optional),
 *   createdAt: number (timestamp),
 *   completedAt: number (optional),
 * }
 */

/**
 * Save transaction to local storage
 * @param {Object} transaction - Transaction object
 * @returns {Object} - Saved transaction with ID
 */
export const saveTransaction = (transaction) => {
  try {
    const transactions = getAllTransactions();
    const txWithId = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    transactions.push(txWithId);

    // Keep only last 50
    if (transactions.length > MAX_STORED_TX) {
      transactions.splice(0, transactions.length - MAX_STORED_TX);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return txWithId;
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

/**
 * Update transaction status
 * @param {string} txId - Transaction ID
 * @param {Object} updates - Fields to update
 * @returns {Object} - Updated transaction
 */
export const updateTransaction = (txId, updates) => {
  try {
    const transactions = getAllTransactions();
    const index = transactions.findIndex((tx) => tx.id === txId);

    if (index === -1) {
      throw new Error('Transaction not found');
    }

    transactions[index] = {
      ...transactions[index],
      ...updates,
      completedAt: updates.status !== 'pending' ? Date.now() : undefined,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return transactions[index];
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

/**
 * Get all stored transactions
 * @returns {Array} - All transactions
 */
export const getAllTransactions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    return [];
  }
};

/**
 * Get transactions for a certificate
 * @param {string} certificateHash - Certificate hash
 * @returns {Array} - Transactions for this certificate
 */
export const getTransactionsForCertificate = (certificateHash) => {
  try {
    const transactions = getAllTransactions();
    return transactions.filter((tx) => tx.certificateHash === certificateHash);
  } catch (error) {
    console.error('Error filtering transactions:', error);
    return [];
  }
};

/**
 * Get transaction by ID
 * @param {string} txId - Transaction ID
 * @returns {Object|null} - Transaction or null
 */
export const getTransactionById = (txId) => {
  try {
    const transactions = getAllTransactions();
    return transactions.find((tx) => tx.id === txId) || null;
  } catch (error) {
    console.error('Error finding transaction:', error);
    return null;
  }
};

/**
 * Get transaction by hash
 * @param {string} txHash - Transaction hash
 * @returns {Object|null} - Transaction or null
 */
export const getTransactionByHash = (txHash) => {
  try {
    const transactions = getAllTransactions();
    return transactions.find((tx) => tx.transactionHash === txHash) || null;
  } catch (error) {
    console.error('Error finding transaction:', error);
    return null;
  }
};

/**
 * Get recent transactions
 * @param {number} limit - Number of recent transactions
 * @returns {Array} - Recent transactions
 */
export const getRecentTransactions = (limit = 10) => {
  try {
    const transactions = getAllTransactions();
    return transactions.slice(-limit).reverse();
  } catch (error) {
    console.error('Error retrieving recent transactions:', error);
    return [];
  }
};

/**
 * Clear all transactions
 * @returns {boolean} - Success indicator
 */
export const clearAllTransactions = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing transactions:', error);
    return false;
  }
};

/**
 * Export transactions as JSON
 * @returns {string} - JSON string of all transactions
 */
export const exportTransactions = () => {
  try {
    const transactions = getAllTransactions();
    return JSON.stringify(transactions, null, 2);
  } catch (error) {
    console.error('Error exporting transactions:', error);
    throw error;
  }
};

/**
 * Get transaction statistics
 * @returns {Object} - Statistics
 */
export const getTransactionStats = () => {
  try {
    const transactions = getAllTransactions();

    return {
      total: transactions.length,
      successful: transactions.filter((tx) => tx.status === 'success').length,
      failed: transactions.filter((tx) => tx.status === 'failed').length,
      pending: transactions.filter((tx) => tx.status === 'pending').length,
      byType: {
        issue: transactions.filter((tx) => tx.type === 'issue').length,
        claim: transactions.filter((tx) => tx.type === 'claim').length,
        verify: transactions.filter((tx) => tx.type === 'verify').length,
        revoke: transactions.filter((tx) => tx.type === 'revoke').length,
      },
    };
  } catch (error) {
    console.error('Error calculating statistics:', error);
    return {};
  }
};
