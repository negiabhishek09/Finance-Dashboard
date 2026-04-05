/**
 * fmt — Format a number as Indian Rupees (₹).
 * Uses the en-IN locale for lakh/crore grouping.
 * Math.abs ensures negative balances display without a leading minus.
 *
 * @param {number} n - The value to format.
 * @returns {string}  e.g. "₹1,85,000"
 */
export const fmt = (n) => "₹" + Math.abs(n).toLocaleString("en-IN");