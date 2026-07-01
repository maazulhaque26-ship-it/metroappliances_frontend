import { NAV_GROUPS } from '../AdminNavConfig';
import { DOMAINS, DOMAIN_GROUPS } from '../AdminDomainConfig';

// Build group → domain lookup
const groupToDomain = {};
DOMAINS.forEach(d => {
  const groups = DOMAIN_GROUPS[d.id] || [];
  groups.forEach(g => { groupToDomain[g] = d; });
});

function buildKeywords(label, path, group) {
  const words = new Set();
  label.toLowerCase().split(/[\s/&-]+/).forEach(w => w.length > 1 && words.add(w));
  group.toLowerCase().split(/[\s/&-]+/).forEach(w => w.length > 1 && words.add(w));
  path.split('/').forEach(seg => seg.length > 1 && words.add(seg.toLowerCase()));
  return Array.from(words);
}

export const SEARCH_INDEX = NAV_GROUPS.flatMap(group => {
  const domain = groupToDomain[group.label];
  return group.items.map(item => ({
    label: item.label,
    path: item.path,
    icon: item.icon,
    roles: item.roles,
    group: group.label,
    domain: domain?.id || 'enterprise',
    domainLabel: domain?.label || 'Enterprise',
    keywords: buildKeywords(item.label, item.path, group.label),
  }));
});

/**
 * Phase 4: Returns SEARCH_INDEX with in-scope domain items sorted first.
 * Items outside scope are still included so that all pages remain reachable.
 * Fuzzy scoring runs on top of this pre-sorted order.
 *
 * @param {{ domains: string[] }} scope - from SearchScopeRegistry
 */
export function getScopedSearchIndex(scope) {
  if (!scope || scope.domains.length === 0) return SEARCH_INDEX;
  const inScope  = SEARCH_INDEX.filter(i => scope.domains.includes(i.domain));
  const outScope = SEARCH_INDEX.filter(i => !scope.domains.includes(i.domain));
  return [...inScope, ...outScope];
}
