const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: '188.132.230.193',
    port: 3306,
    user: 'tqb',
    password: 'Dlr235672.-Yt',
    database: 'tqb_db',
    multipleStatements: true
  });

  try {
    console.log('\n🚀 Running Migration 04: Pricing Configuration System\n');
    console.log('='.repeat(70));

    // Read SQL file
    const sqlFile = path.join(__dirname, '..', 'database_migrations', '04_pricing_configuration.sql');
    const sql = await fs.readFile(sqlFile, 'utf8');

    // Execute migration
    console.log('\n📝 Executing SQL statements...');
    await connection.query(sql);

    console.log('\n✅ Migration completed successfully!');

    // Verify tables were created
    const [tables] = await connection.query(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = 'tqb_db'
      AND TABLE_NAME IN ('operator_pricing_config', 'operator_child_pricing')
      ORDER BY TABLE_NAME
    `);

    console.log('\n📊 Created tables:');
    tables.forEach(t => console.log(`   ✓ ${t.TABLE_NAME}`));

    // Check default config was created
    const [configCount] = await connection.query(`
      SELECT COUNT(*) as count FROM operator_pricing_config
    `);
    console.log(`\n📋 Operator pricing configs created: ${configCount[0].count}`);

    const [childCount] = await connection.query(`
      SELECT COUNT(*) as count FROM operator_child_pricing
    `);
    console.log(`📋 Child pricing slabs created: ${childCount[0].count}`);

    // Show sample config
    const [sampleConfig] = await connection.query(`
      SELECT
        opc.single_supplement_type,
        opc.single_supplement_value,
        opc.triple_room_discount_percentage,
        opc.three_star_multiplier,
        opc.four_star_multiplier,
        opc.five_star_multiplier,
        opc.default_markup_percentage,
        o.company_name
      FROM operator_pricing_config opc
      JOIN operators o ON opc.operator_id = o.id
      LIMIT 1
    `);

    if (sampleConfig.length > 0) {
      const config = sampleConfig[0];
      console.log(`\n📊 Sample Configuration (${config.company_name}):`);
      console.log(`   Single Supplement: ${config.single_supplement_value}% (${config.single_supplement_type})`);
      console.log(`   Triple Discount: ${config.triple_room_discount_percentage}%`);
      console.log(`   Hotel Multipliers: 3⭐=${config.three_star_multiplier}x, 4⭐=${config.four_star_multiplier}x, 5⭐=${config.five_star_multiplier}x`);
      console.log(`   Markup: ${config.default_markup_percentage}%`);
    }

    // Show child slabs
    const [childSlabs] = await connection.query(`
      SELECT label, min_age, max_age, discount_type, discount_value
      FROM operator_child_pricing
      WHERE is_active = TRUE
      ORDER BY display_order
      LIMIT 5
    `);

    console.log('\n👶 Default Child Pricing Slabs:');
    childSlabs.forEach(slab => {
      const discount = slab.discount_type === 'free' ? 'FREE' :
                      slab.discount_type === 'percentage' ? `${slab.discount_value}% off` :
                      `$${slab.discount_value} off`;
      console.log(`   ${slab.label} (${slab.min_age}-${slab.max_age} years): ${discount}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('✅ MIGRATION 04 COMPLETE!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration();
