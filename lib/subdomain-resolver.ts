/**
 * Server-Side Subdomain Resolver
 * Resolves subdomains to organization IDs using database queries
 */

import pool from './db';

export interface SubdomainResolution {
  orgId: number;
  orgName: string;
  subdomain: string | null;
}

/**
 * Get organization from subdomain (server-side only)
 * @param hostname - The full hostname (e.g., 'funny-tourism.travelquotebot.com')
 * @returns Organization details or null
 */
export async function getOrgFromSubdomain(hostname: string): Promise<SubdomainResolution | null> {
  try {
    // Clean hostname (remove port if present)
    const cleanHostname = hostname.split(':')[0].toLowerCase();

    // Main domain defaults to org 5
    if (cleanHostname === 'travelquotebot.com' || cleanHostname === 'www.travelquotebot.com') {
      return {
        orgId: 5,
        orgName: 'Funny Tourism',
        subdomain: null
      };
    }

    // Extract subdomain from hostname
    // Example: 'funny-tourism.travelquotebot.com' -> 'funny-tourism'
    const subdomainMatch = cleanHostname.match(/^([^.]+)\.travelquotebot\.com$/);

    if (!subdomainMatch) {
      console.log(`❌ Invalid hostname format: ${cleanHostname}`);
      return null;
    }

    const subdomain = subdomainMatch[1];

    // Query database for organization with this subdomain
    const [rows] = await pool.query(
      'SELECT id, name, subdomain FROM organizations WHERE subdomain = ? AND status = "active"',
      [subdomain]
    );

    const orgs = rows as any[];

    if (orgs.length === 0) {
      console.log(`❌ No active organization found for subdomain: ${subdomain}`);
      return null;
    }

    const org = orgs[0];
    console.log(`✅ Subdomain resolved: ${subdomain} → Org ${org.id} (${org.name})`);

    return {
      orgId: org.id,
      orgName: org.name,
      subdomain: org.subdomain
    };

  } catch (error) {
    console.error('Error resolving subdomain:', error);
    return null;
  }
}

/**
 * Validate subdomain availability (server-side only)
 * @param subdomain - The subdomain to check
 * @returns true if available, false if taken
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  try {
    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      return false;
    }

    // Reserved subdomains
    const reserved = ['www', 'api', 'admin', 'app', 'dashboard', 'mail', 'ftp', 'localhost'];
    if (reserved.includes(subdomain.toLowerCase())) {
      return false;
    }

    // Check database
    const [rows] = await pool.query(
      'SELECT id FROM organizations WHERE subdomain = ?',
      [subdomain]
    );

    const orgs = rows as any[];
    return orgs.length === 0;

  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    return false;
  }
}

/**
 * Get organization by ID with subdomain info
 * @param orgId - Organization ID
 * @returns Organization details or null
 */
export async function getOrgById(orgId: number): Promise<SubdomainResolution | null> {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, subdomain FROM organizations WHERE id = ? AND status = "active"',
      [orgId]
    );

    const orgs = rows as any[];

    if (orgs.length === 0) {
      return null;
    }

    const org = orgs[0];

    return {
      orgId: org.id,
      orgName: org.name,
      subdomain: org.subdomain
    };

  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
}
