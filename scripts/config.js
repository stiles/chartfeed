/**
 * Datawrapper API Configuration
 * 
 * Settings for fetching charts from the Datawrapper API.
 * These run in Node.js and can use environment variables.
 */
export default {
  // Your Datawrapper API base URL
  // Default is public Datawrapper; change for enterprise instances
  apiBase: 'https://api.datawrapper.de/v3',

  // CDN base URL for chart thumbnails and embeds
  // Default: Datawrapper's public CDN
  // Enterprise users: set to your custom CDN URL
  cdnBase: process.env.CDN_BASE || 'https://datawrapper.dwcdn.net',

  // Filter by author ID (optional)
  // Run `npm run whoami` to find your ID
  // Leave empty to fetch all charts you have access to
  authorId: process.env.AUTHOR_ID || '',

  // Filter by organization/team ID (optional)
  // Leave empty to not filter by organization
  organizationId: process.env.ORGANIZATION_ID || '',

  // Number of charts to fetch (max per API call is 100)
  // Set to a high number to fetch all; pagination is handled automatically
  maxCharts: 500,

  // Only include published charts
  publishedOnly: true
};

