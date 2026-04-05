

const INITIAL_TRANSACTIONS = [
  // ── December 2025 ──
  { id: 1,  date: "2025-12-01", desc: "Monthly Salary",       amount: 85000, category: "Salary",        type: "income"  },
  { id: 2,  date: "2025-12-02", desc: "Grocery Store",        amount: 3200,  category: "Food & Dining",  type: "expense" },
  { id: 3,  date: "2025-12-03", desc: "Uber Ride",            amount: 450,   category: "Transport",      type: "expense" },
  { id: 4,  date: "2025-12-04", desc: "Netflix Subscription", amount: 649,   category: "Entertainment",  type: "expense" },
  { id: 5,  date: "2025-12-05", desc: "Freelance Project",    amount: 25000, category: "Freelance",      type: "income"  },
  { id: 6,  date: "2025-12-06", desc: "Electricity Bill",     amount: 1800,  category: "Utilities",      type: "expense" },
  { id: 7,  date: "2025-12-07", desc: "Amazon Shopping",      amount: 5600,  category: "Shopping",       type: "expense" },
  { id: 8,  date: "2025-12-08", desc: "Gym Membership",       amount: 1200,  category: "Health",         type: "expense" },
  { id: 9,  date: "2025-12-09", desc: "Mutual Fund SIP",      amount: 10000, category: "Investment",     type: "expense" },
  { id: 10, date: "2025-12-10", desc: "House Rent",           amount: 18000, category: "Rent",           type: "expense" },
  { id: 11, date: "2025-12-11", desc: "Restaurant Dinner",    amount: 2400,  category: "Food & Dining",  type: "expense" },
  { id: 12, date: "2025-12-12", desc: "Metro Card Recharge",  amount: 500,   category: "Transport",      type: "expense" },
  { id: 13, date: "2025-12-14", desc: "Clothing Purchase",    amount: 4200,  category: "Shopping",       type: "expense" },
  { id: 14, date: "2025-12-15", desc: "Freelance Invoice",    amount: 15000, category: "Freelance",      type: "income"  },
  { id: 15, date: "2025-12-16", desc: "Doctor Visit",         amount: 800,   category: "Health",         type: "expense" },
  { id: 16, date: "2025-12-18", desc: "Coffee & Snacks",      amount: 650,   category: "Food & Dining",  type: "expense" },
  { id: 17, date: "2025-12-20", desc: "Internet Bill",        amount: 999,   category: "Utilities",      type: "expense" },
  { id: 18, date: "2025-12-22", desc: "Movie Tickets",        amount: 1200,  category: "Entertainment",  type: "expense" },
  { id: 19, date: "2025-12-24", desc: "Dividend Credit",      amount: 3500,  category: "Investment",     type: "income"  },
  { id: 20, date: "2025-12-28", desc: "Taxi to Airport",      amount: 1100,  category: "Transport",      type: "expense" },

  // ── November 2025 ──
  { id: 21, date: "2025-11-01", desc: "Monthly Salary",       amount: 85000, category: "Salary",        type: "income"  },
  { id: 22, date: "2025-11-03", desc: "Grocery Store",        amount: 2800,  category: "Food & Dining", type: "expense" },
  { id: 23, date: "2025-11-05", desc: "Freelance Project",    amount: 18000, category: "Freelance",     type: "income"  },
  { id: 24, date: "2025-11-08", desc: "Shopping Mall",        amount: 7200,  category: "Shopping",      type: "expense" },
  { id: 25, date: "2025-11-10", desc: "House Rent",           amount: 18000, category: "Rent",          type: "expense" },
  { id: 26, date: "2025-11-12", desc: "Electricity Bill",     amount: 2100,  category: "Utilities",     type: "expense" },
  { id: 27, date: "2025-11-15", desc: "Mutual Fund SIP",      amount: 10000, category: "Investment",    type: "expense" },
  { id: 28, date: "2025-11-18", desc: "Restaurant",           amount: 3200,  category: "Food & Dining", type: "expense" },
  { id: 29, date: "2025-11-22", desc: "Petrol",               amount: 2500,  category: "Transport",     type: "expense" },
  { id: 30, date: "2025-11-28", desc: "Health Insurance",     amount: 5000,  category: "Health",        type: "expense" },

  // ── October 2025 ──
  { id: 31, date: "2025-10-01", desc: "Monthly Salary",       amount: 85000, category: "Salary",        type: "income"  },
  { id: 32, date: "2025-10-02", desc: "Grocery Store",        amount: 3500,  category: "Food & Dining", type: "expense" },
  { id: 33, date: "2025-10-05", desc: "Freelance Project",    amount: 30000, category: "Freelance",     type: "income"  },
  { id: 34, date: "2025-10-10", desc: "House Rent",           amount: 18000, category: "Rent",          type: "expense" },
  { id: 35, date: "2025-10-15", desc: "Shopping",             amount: 3800,  category: "Shopping",      type: "expense" },
  { id: 36, date: "2025-10-18", desc: "Electricity Bill",     amount: 1600,  category: "Utilities",     type: "expense" },
  { id: 37, date: "2025-10-20", desc: "Mutual Fund SIP",      amount: 10000, category: "Investment",    type: "expense" },
  { id: 38, date: "2025-10-22", desc: "Diwali Bonus",         amount: 20000, category: "Salary",        type: "income"  },
  { id: 39, date: "2025-10-25", desc: "Gym Membership",       amount: 1200,  category: "Health",        type: "expense" },
  { id: 40, date: "2025-10-28", desc: "Entertainment",        amount: 4500,  category: "Entertainment", type: "expense" },
];

export default INITIAL_TRANSACTIONS;