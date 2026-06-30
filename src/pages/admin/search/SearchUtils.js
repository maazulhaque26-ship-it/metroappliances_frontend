export const GROUP_ORDER = [
  'Overview', 'Catalog', 'Sales', 'Customers', 'Content', 'Marketing',
  'Dealers', 'CRM', 'BI & Analytics',
  'Warehouse', 'Inventory', 'Procurement', 'Logistics', 'Barcode & Scanning', 'IoT & Industry 4.0',
  'After Sales Service', 'Installation',
  'Manufacturing', 'Production Planning', 'MRP', 'MES', 'QMS', 'EAM',
  'Finance', 'Accounts Payable', 'Accounts Receivable', 'Tax & Compliance', 'Banking & Treasury', 'CFO & Executive',
  'HRMS',
  'Projects', 'Portfolio (PPM)', 'PMO Governance', 'BPM & Workflow', 'Document Management',
  'BI Executive Analytics', 'AI & Forecasting', 'AI Copilot',
  'Enterprise', 'Settings',
];

export function fuzzyMatch(str, query) {
  let si = 0;
  for (let qi = 0; qi < query.length; qi++) {
    const found = str.indexOf(query[qi], si);
    if (found === -1) return false;
    si = found + 1;
  }
  return true;
}

export function scoreMatch(item, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const label = item.label.toLowerCase();
  const group = item.group.toLowerCase();

  if (label === q) return 100;
  if (label.startsWith(q)) return 90;
  if (label.split(/\s+/).some(w => w.startsWith(q))) return 80;
  if (label.includes(q)) return 70;
  if (item.keywords.some(k => k === q)) return 60;
  if (item.keywords.some(k => k.startsWith(q))) return 50;
  if (item.keywords.some(k => k.includes(q))) return 40;
  if (fuzzyMatch(label, q)) return 30;
  if (group.includes(q)) return 25;
  if (item.keywords.some(k => fuzzyMatch(k, q))) return 20;
  return 0;
}

export function groupResults(scored) {
  const map = new Map();
  scored.forEach(({ item, score }) => {
    if (!map.has(item.group)) {
      map.set(item.group, { label: item.group, domainLabel: item.domainLabel, items: [] });
    }
    map.get(item.group).items.push({ ...item, score });
  });

  const ordered = [];
  GROUP_ORDER.forEach(g => {
    if (map.has(g)) ordered.push(map.get(g));
  });
  map.forEach((v, k) => {
    if (!GROUP_ORDER.includes(k)) ordered.push(v);
  });

  return ordered.filter(g => g.items.length > 0);
}
