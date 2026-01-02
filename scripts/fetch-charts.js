#!/usr/bin/env node

/**
 * Fetch charts from Datawrapper API
 * 
 * Usage:
 *   npm run fetch              Interactive mode (prompts for options)
 *   npm run fetch --all        Fetch all accessible charts
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import config from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../src/lib/data/charts.json');

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

const API_BASE = config.apiBase;
const TOKEN = process.env.DATAWRAPPER_TOKEN;

if (!TOKEN) {
  console.error('Error: DATAWRAPPER_TOKEN environment variable is required');
  console.error('');
  console.error('Add to your shell profile (~/.zshrc or ~/.bashrc):');
  console.error('  export DATAWRAPPER_TOKEN=your_token_here');
  console.error('');
  console.error('Get your token at: https://app.datawrapper.de/account/api-tokens');
  process.exit(1);
}

/**
 * Interactive prompt helper
 */
function createPrompt() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return {
    ask: (question) => new Promise(resolve => {
      rl.question(question, answer => resolve(answer.trim()));
    }),
    close: () => rl.close()
  };
}

/**
 * Get options interactively or from args
 */
async function getOptions() {
  const args = process.argv.slice(2);
  
  // Check for --all flag (skip prompts)
  if (args.includes('--all')) {
    return { authors: [], org: null, limit: config.maxCharts };
  }

  // Check for config defaults
  const hasConfigDefaults = config.authorId || config.organizationId;
  if (hasConfigDefaults) {
    // Support comma-separated author IDs in config
    const configAuthors = config.authorId 
      ? config.authorId.split(',').map(id => id.trim()).filter(Boolean)
      : [];
    return {
      authors: configAuthors,
      org: config.organizationId || null,
      limit: config.maxCharts
    };
  }

  // Interactive mode
  console.log('Chartfeed - Fetch Datawrapper Charts\n');
  
  const prompt = createPrompt();

  console.log('How do you want to filter charts?\n');
  console.log('  1. By author ID(s) - your personal charts');
  console.log('  2. By organization - all team charts');
  console.log('  3. Both author(s) and organization');
  console.log('  4. Fetch all accessible charts\n');

  const choice = await prompt.ask('Enter choice (1-4): ');

  let authors = [];
  let org = null;

  if (choice === '1' || choice === '3') {
    const authorInput = await prompt.ask('Author ID(s) - comma-separated for multiple (e.g., 508399,672102): ');
    if (authorInput) {
      authors = authorInput.split(',').map(id => id.trim()).filter(Boolean);
    }
  }

  if (choice === '2' || choice === '3') {
    org = await prompt.ask('Organization ID: ');
    if (!org) org = null;
  }

  const limitInput = await prompt.ask(`Max charts to fetch (default ${config.maxCharts}): `);
  const limit = limitInput ? parseInt(limitInput, 10) : config.maxCharts;

  prompt.close();

  // Offer to save to config
  if (authors.length || org) {
    console.log('\nTip: Add these to scripts/config.js to skip prompts next time:');
    if (authors.length) console.log(`  authorId: '${authors.join(',')}',`);
    if (org) console.log(`  organizationId: '${org}',`);
    console.log('');
  }

  return { authors, org, limit };
}

/**
 * Fetch a page of charts from the API
 */
async function fetchChartsPage(options, offset = 0, limit = 100) {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
    orderBy: 'publishedAt',
    order: 'DESC'
  });

  if (options.author) params.set('authorId', options.author);
  if (options.org) params.set('teamId', options.org);
  if (config.publishedOnly) params.set('published', 'true');

  const url = `${API_BASE}/charts?${params}`;
  
  const response = await fetch(url, {
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

/**
 * Get chart type category for filtering/display
 */
function getChartCategory(type) {
  if (!type) return 'other';
  
  const typeMap = {
    'd3-maps': 'map',
    'd3-maps-symbols': 'map',
    'd3-maps-choropleth': 'map',
    'locator-map': 'map',
    'bar-chart': 'bar',
    'd3-bars': 'bar',
    'd3-bars-stacked': 'bar',
    'd3-bars-grouped': 'bar',
    'd3-bars-bullet': 'bar',
    'line-chart': 'line',
    'd3-lines': 'line',
    'd3-area': 'line',
    'tables': 'table',
    'd3-scatter-plot': 'scatter',
    'd3-dot-plot': 'scatter',
    'd3-pies': 'pie',
    'd3-donuts': 'pie',
    'election-donut-chart': 'pie'
  };

  for (const [key, category] of Object.entries(typeMap)) {
    if (type.includes(key) || key.includes(type)) {
      return category;
    }
  }

  return 'other';
}

/**
 * Build thumbnail URL for a chart
 * Extracts the CDN base from publicUrl and constructs image path
 */
function getThumbnailUrl(chart) {
  const id = chart.publicId || chart.id;
  
  if (chart.publicUrl) {
    try {
      const url = new URL(chart.publicUrl);
      // For paths like /charts/{id}/{version}/, image is at /charts/{id}/full.png
      // For paths like /{id}/{version}/, image is at /{id}/{version}/full.png
      if (url.pathname.includes('/charts/')) {
        return `${url.origin}/charts/${id}/full.png`;
      }
      // Standard Datawrapper: keep full path with version
      const base = chart.publicUrl.replace(/\/$/, '');
      return `${base}/full.png`;
    } catch (e) {
      // Fall through
    }
  }
  
  // Fallback
  const version = chart.publicVersion || 1;
  return `https://datawrapper.dwcdn.net/${id}/${version}/full.png`;
}

/**
 * Check if a thumbnail URL is accessible
 */
async function thumbnailExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Extract relevant metadata from a chart object
 */
function transformChart(chart) {
  const id = chart.publicId || chart.id;
  
  return {
    id,
    title: chart.title || 'Untitled',
    type: chart.type || 'unknown',
    category: getChartCategory(chart.type),
    // Use lastModifiedAt for sorting (most recent update), fall back to publishedAt
    publishedAt: chart.lastModifiedAt || chart.publishedAt || chart.createdAt,
    publicUrl: chart.publicUrl || `https://datawrapper.dwcdn.net/${id}/`,
    thumbnailUrl: getThumbnailUrl(chart),
    description: chart.metadata?.describe?.intro || '',
    source: chart.metadata?.describe?.['source-name'] || '',
    byline: chart.metadata?.describe?.byline || '',
    authorId: chart.authorId,
    organizationId: chart.organizationId || chart.teamId
  };
}

/**
 * Fetch charts for a single author/org combination
 */
async function fetchChartsForAuthor(authorId, org, maxLimit) {
  const allCharts = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore && allCharts.length < maxLimit) {
    const data = await fetchChartsPage({ author: authorId, org }, offset, limit);
    const charts = data.list || [];
    
    allCharts.push(...charts);
    process.stdout.write(`\r  Fetched ${allCharts.length} charts...`);
    
    hasMore = charts.length === limit && (data.total > allCharts.length);
    offset += limit;
    
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allCharts;
}

/**
 * Main fetch function - supports multiple author IDs
 */
async function fetchAllCharts(options) {
  console.log('Fetching charts from Datawrapper API...');
  if (options.authors?.length) console.log(`  Authors: ${options.authors.join(', ')}`);
  if (options.org) console.log(`  Organization: ${options.org}`);
  console.log(`  Limit: ${options.limit}`);
  
  const allCharts = [];
  const seenIds = new Set();

  // If we have specific authors, fetch for each
  if (options.authors?.length) {
    for (const authorId of options.authors) {
      console.log(`\n  Fetching for author ${authorId}...`);
      const charts = await fetchChartsForAuthor(authorId, options.org, options.limit);
      
      // Add only unique charts (by ID)
      for (const chart of charts) {
        const id = chart.publicId || chart.id;
        if (!seenIds.has(id)) {
          seenIds.add(id);
          allCharts.push(chart);
        }
      }
    }
  } else {
    // No specific authors - fetch all accessible or by org
    const charts = await fetchChartsForAuthor(null, options.org, options.limit);
    allCharts.push(...charts);
  }

  console.log(`\n  Total unique charts: ${allCharts.length}`);
  return allCharts;
}

/**
 * Run the fetch and save results
 */
async function main() {
  try {
    const options = await getOptions();

    const charts = await fetchAllCharts(options);
    
    let transformed = charts
      .map(transformChart)
      .filter(chart => chart.publishedAt);
    
    // Validate thumbnails exist (skip charts without valid images)
    console.log('\nValidating thumbnails...');
    const validated = [];
    let skipped = 0;
    
    for (let i = 0; i < transformed.length; i++) {
      const chart = transformed[i];
      process.stdout.write(`\r  Checking ${i + 1}/${transformed.length}...`);
      
      const exists = await thumbnailExists(chart.thumbnailUrl);
      if (exists) {
        validated.push(chart);
      } else {
        skipped++;
      }
    }
    
    transformed = validated;
    console.log(`\n  Skipped ${skipped} charts without valid thumbnails`);
    
    transformed.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const output = {
      charts: transformed,
      lastUpdated: new Date().toISOString(),
      meta: {
        total: transformed.length,
        authorIds: options.authors?.length ? options.authors : null,
        organizationId: options.org || null
      }
    };

    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log(`\nSaved ${transformed.length} charts to src/lib/data/charts.json`);
    
    const categories = {};
    transformed.forEach(c => {
      categories[c.category] = (categories[c.category] || 0) + 1;
    });
    console.log('\nBy category:');
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
