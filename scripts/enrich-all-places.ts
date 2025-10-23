/**
 * Script to enrich all hotels, tours, and entrance fees with Google Places API data
 * Run with: npx tsx scripts/enrich-all-places.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

interface EnrichmentResult {
  table: string;
  id: number;
  name: string;
  success: boolean;
  error?: string;
}

async function getItemsNeedingEnrichment(
  token: string,
  table: string
): Promise<{ id: number; name: string }[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/enrich-places?table=${table}&getItems=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get items: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error getting items from ${table}:`, error);
    return [];
  }
}

async function enrichItem(
  token: string,
  table: string,
  id: number,
  name: string
): Promise<EnrichmentResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/enrich-places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ table, id }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        table,
        id,
        name,
        success: true,
      };
    } else {
      return {
        table,
        id,
        name,
        success: false,
        error: data.error || 'Unknown error',
      };
    }
  } catch (error) {
    return {
      table,
      id,
      name,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function enrichTable(
  token: string,
  table: string
): Promise<{ success: number; failed: number; results: EnrichmentResult[] }> {
  console.log(`\n📋 Enriching ${table}...`);

  const items = await getItemsNeedingEnrichment(token, table);

  if (items.length === 0) {
    console.log(`  ✓ No items need enrichment`);
    return { success: 0, failed: 0, results: [] };
  }

  console.log(`  Found ${items.length} items needing enrichment\n`);

  const results: EnrichmentResult[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const item of items) {
    console.log(`  Processing: ${item.name} (ID: ${item.id})`);

    const result = await enrichItem(token, table, item.id, item.name);
    results.push(result);

    if (result.success) {
      console.log(`    ✓ Success`);
      successCount++;
    } else {
      console.log(`    ✗ Failed: ${result.error}`);
      failCount++;
    }

    // Rate limit: Wait 1 second between requests to avoid hitting Google API limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(
    `\n  Summary: ${successCount} successful, ${failCount} failed\n`
  );

  return { success: successCount, failed: failCount, results };
}

async function main() {
  console.log('🗺️  Google Places Enrichment Script\n');
  console.log('=====================================\n');

  // Get JWT token from environment
  const token = process.env.TEST_JWT_TOKEN;

  if (!token) {
    console.error(
      '❌ Error: TEST_JWT_TOKEN not found in .env.local'
    );
    console.error(
      'Please add your JWT token to .env.local: TEST_JWT_TOKEN=your_token_here'
    );
    process.exit(1);
  }

  const tables = ['hotels', 'tours', 'entrance_fees'];
  const allResults: EnrichmentResult[] = [];
  let totalSuccess = 0;
  let totalFailed = 0;

  for (const table of tables) {
    const { success, failed, results } = await enrichTable(token, table);
    totalSuccess += success;
    totalFailed += failed;
    allResults.push(...results);
  }

  // Final summary
  console.log('\n=====================================');
  console.log('📊 Final Results\n');
  console.log(`✅ Total Successful: ${totalSuccess}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  console.log(`📈 Success Rate: ${totalSuccess + totalFailed > 0 ? ((totalSuccess / (totalSuccess + totalFailed)) * 100).toFixed(1) : 0}%`);

  if (totalFailed > 0) {
    console.log('\n❌ Failed Items:');
    allResults
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.table}: ${r.name} (ID: ${r.id})`);
        console.log(`    Error: ${r.error}`);
      });
  }

  console.log('\n✅ Enrichment complete!\n');
}

main().catch(console.error);
