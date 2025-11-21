/**
 * Domain to Organization Mapping
 * Maps subdomains and domains to their respective organization IDs
 */

export interface DomainMapping {
  domain: string;
  orgId: number;
  orgName: string;
}

export const domainMappings: DomainMapping[] = [
  // Main platform domain - default org
  {
    domain: 'travelquotebot.com',
    orgId: 5,
    orgName: 'Funny Tourism'
  },
  {
    domain: 'www.travelquotebot.com',
    orgId: 5,
    orgName: 'Funny Tourism'
  },

  // White-label subdomains for specific tour operators
  {
    domain: 'funny-tourism.travelquotebot.com',
    orgId: 5,
    orgName: 'Funny Tourism'
  },

  // Add more white-label domains here as needed
  // Example:
  // {
  //   domain: 'another-operator.travelquotebot.com',
  //   orgId: 6,
  //   orgName: 'Another Operator'
  // },
];

/**
 * Get organization ID from domain/hostname
 * @param hostname - The hostname (e.g., 'funny-tourism.travelquotebot.com')
 * @returns Organization ID or default (5)
 */
export function getOrgIdFromDomain(hostname: string): number {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0].toLowerCase();

  // Find matching domain
  const mapping = domainMappings.find(m => m.domain.toLowerCase() === cleanHostname);

  if (mapping) {
    console.log(`🌐 Domain mapping: ${cleanHostname} → Org ${mapping.orgId} (${mapping.orgName})`);
    return mapping.orgId;
  }

  // Default to org 5 (Funny Tourism)
  console.log(`🌐 No mapping found for ${cleanHostname}, using default org 5`);
  return 5;
}

/**
 * Get organization name from domain/hostname
 * @param hostname - The hostname
 * @returns Organization name or 'Unknown'
 */
export function getOrgNameFromDomain(hostname: string): string {
  const cleanHostname = hostname.split(':')[0].toLowerCase();
  const mapping = domainMappings.find(m => m.domain.toLowerCase() === cleanHostname);
  return mapping?.orgName || 'Unknown';
}
