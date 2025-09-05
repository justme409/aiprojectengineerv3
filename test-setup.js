#!/usr/bin/env node

// Simple test to verify database connection and basic functionality

const { Pool } = require('pg')
require('dotenv').config({ path: './.env.example' })

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/projectpro'
  })

  try {
    console.log('Testing database connection...')
    const result = await pool.query('SELECT version()')
    console.log('✅ Database connected successfully')
    console.log('PostgreSQL version:', result.rows[0].version.split(' ')[0])

    // Test if tables exist
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('assets', 'asset_edges', 'projects', 'documents')
    `)

    if (tables.rows.length > 0) {
      console.log('✅ Database tables exist:', tables.rows.map(r => r.table_name).join(', '))
    } else {
      console.log('⚠️  No database tables found. Run migrations first.')
    }

    await pool.end()
    console.log('✅ Test completed successfully')
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    process.exit(1)
  }
}

testConnection()
