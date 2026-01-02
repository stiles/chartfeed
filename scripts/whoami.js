#!/usr/bin/env node

/**
 * Discover your Datawrapper user ID and organization memberships
 * 
 * Usage:
 *   npm run whoami
 * 
 * Requires DATAWRAPPER_TOKEN environment variable to be set.
 */

import config from './config.js';

const API_BASE = config.apiBase;
const TOKEN = process.env.DATAWRAPPER_TOKEN;

if (!TOKEN) {
  console.error('Error: DATAWRAPPER_TOKEN environment variable is required');
  console.error('');
  console.error('To set it up:');
  console.error('1. Go to https://app.datawrapper.de/account/api-tokens');
  console.error('2. Create a new token with chart:read scope');
  console.error('3. Add to your shell profile (~/.zshrc or ~/.bashrc):');
  console.error('   export DATAWRAPPER_TOKEN=your_token_here');
  console.error('4. Reload your shell: source ~/.zshrc');
  process.exit(1);
}

async function fetchMe() {
  const response = await fetch(`${API_BASE}/me`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json();
}

async function fetchTeams() {
  const response = await fetch(`${API_BASE}/teams`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    // Teams endpoint might not be available for all accounts
    return { list: [] };
  }

  return response.json();
}

async function main() {
  try {
    console.log('Fetching your Datawrapper account info...\n');
    
    const [me, teamsData] = await Promise.all([fetchMe(), fetchTeams()]);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('  YOUR DATAWRAPPER ACCOUNT');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log(`  Name:      ${me.name || 'Not set'}`);
    console.log(`  Email:     ${me.email}`);
    console.log(`  Author ID: ${me.id}`);
    console.log('');
    
    if (me.teams && me.teams.length > 0) {
      console.log('  Teams/Organizations:');
      me.teams.forEach(team => {
        console.log(`    - ${team.name} (ID: ${team.id})`);
      });
    } else if (teamsData.list && teamsData.list.length > 0) {
      console.log('  Teams/Organizations:');
      teamsData.list.forEach(team => {
        console.log(`    - ${team.name} (ID: ${team.id})`);
      });
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  HOW TO USE THESE IDs');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('  To fetch only YOUR charts:');
    console.log(`    AUTHOR_ID=${me.id} npm run fetch\n`);
    
    if ((me.teams && me.teams.length > 0) || (teamsData.list && teamsData.list.length > 0)) {
      const teams = me.teams || teamsData.list || [];
      const firstTeam = teams[0];
      console.log('  To fetch charts from a specific team:');
      console.log(`    ORGANIZATION_ID=${firstTeam.id} npm run fetch\n`);
    }
    
    console.log('  Or set these in config.js for permanent configuration.\n');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

