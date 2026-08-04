export const customer = {
  name: "Arjun",
  email: "arjun@example.com",
  plan: "3 Accounts · 3 Months",
  amount: "₹1,100",
  renewal: "18 September 2026",
  daysLeft: 45,
  status: "Active",
};

export const gameAccounts = [
  { id: "acc-1", name: "Arjun Main", kingdom: "K:1187", status: "Online", sync: "2 min ago" },
  { id: "acc-2", name: "Iron Farm", kingdom: "K:1187", status: "Online", sync: "4 min ago" },
  { id: "acc-3", name: "Stone Farm", kingdom: "K:1187", status: "Setup pending", sync: "Awaiting approval" },
];

export const commands = [
  { command: "tbal", description: "Check your resource balance", group: "Resources", admin: false },
  { command: "tfood 5M", description: "Request 5M food", group: "Resources", admin: false },
  { command: "tstone 5M", description: "Request 5M stone", group: "Resources", admin: false },
  { command: "twood 5M", description: "Request 5M wood", group: "Resources", admin: false },
  { command: "tore 5M", description: "Request 5M ore", group: "Resources", admin: false },
  { command: "tgold 5M", description: "Request 5M gold", group: "Resources", admin: false },
  { command: "trss 5M 5M 5M 5M 0", description: "Request multiple resources together", group: "Resources", admin: false },
  { command: "tpos", description: "Get the bank location", group: "Information", admin: false },
  { command: "tshield", description: "Check remaining shield time", group: "Information", admin: false },
  { command: "tstats", description: "Check your gift statistics", group: "Information", admin: false },
  { command: "tquest", description: "Check Guild Festival status", group: "Information", admin: false },
  { command: "tfindtile food 4", description: "Find a level 4 food tile", group: "Search", admin: false },
  { command: "tfindmonster hardrox 2", description: "Find a level 2 monster", group: "Search", admin: false },
  { command: "tfindnest 3", description: "Find a level 3 Darknest", group: "Search", admin: false },
  { command: "tadminbal Player", description: "Check a player's balance", group: "Bank admin", admin: true },
  { command: "tadminrss Player 5M 5M 5M 5M 0", description: "Send a full resource set administratively", group: "Bank admin", admin: true },
  { command: "trelocator", description: "Manage bank relocator actions", group: "Bank admin", admin: true },
  { command: "tmigrate", description: "Start the configured migration action", group: "Bank admin", admin: true },
  { command: "tabort", description: "Cancel pending resource shipments", group: "Bank admin", admin: true },
  { command: "trecall", description: "Recall troops", group: "Bank admin", admin: true },
];

export const adminCustomers = [
  { id: "LC-1048", name: "Arjun Mehta", accounts: 3, plan: "3 months", renewal: "18 Sep 2026", status: "Active", amount: "₹1,100" },
  { id: "LC-1047", name: "Maya Rao", accounts: 1, plan: "Monthly", renewal: "08 Aug 2026", status: "Due soon", amount: "₹150" },
  { id: "LC-1046", name: "Kiran S", accounts: 5, plan: "Yearly", renewal: "12 Jun 2027", status: "Active", amount: "₹6,000" },
  { id: "LC-1045", name: "Dev Patel", accounts: 2, plan: "3 months", renewal: "03 Aug 2026", status: "Expired", amount: "₹750" },
];

export const settingsRequests = [
  { id: "REQ-029", customer: "Arjun Mehta", account: "Stone Farm", submitted: "Today, 10:24", change: "Enable gathering · Vergeway collection", status: "Pending" },
  { id: "REQ-028", customer: "Maya Rao", account: "Maya Main", submitted: "Yesterday, 18:06", change: "Shield reminder: 4 hours", status: "Pending" },
  { id: "REQ-027", customer: "Kiran S", account: "Kiran Farm 2", submitted: "02 Aug, 13:40", change: "Hunting: level 2 monsters", status: "Approved" },
];

export const planPrices = [
  { accounts: 1, monthly: 150, quarterly: 400, yearly: 1500 },
  { accounts: 2, monthly: 280, quarterly: 750, yearly: 2800 },
  { accounts: 3, monthly: 400, quarterly: 1100, yearly: 4000 },
  { accounts: 4, monthly: 500, quarterly: 1400, yearly: 5000 },
  { accounts: 5, monthly: 600, quarterly: 1700, yearly: 6000 },
];
