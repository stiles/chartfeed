# Chartfeed

A responsive gallery that displays your Datawrapper charts. Auto-updates daily via GitHub Actions and deploys to GitHub Pages.

## Inspiration

This project builds on [Stephen Stirling's tiled-graphic-wall](https://github.com/sstirling/tiled-graphic-wall), a template for manually curating a portfolio of graphics. Chartfeed automates the process by fetching directly from the Datawrapper API.

## Features

- Fetches charts from the Datawrapper API
- Filter by author ID or organization
- Responsive grid layout
- Search by keyword (title, description, source, byline)
- Filter by chart type (maps, bar charts, line charts, etc.)
- Sort by date (newest/oldest)
- Dark/light mode based on system preference
- Automatic daily updates via GitHub Actions
- Deploys to GitHub Pages

## Quick start

### 1. Create a Datawrapper API token

Go to [app.datawrapper.de/account/api-tokens](https://app.datawrapper.de/account/api-tokens) and create a new token with `chart:read` scope.

### 2. Clone and install

```bash
git clone https://github.com/stiles/chartfeed.git
cd chartfeed
npm install
```

### 3. Set your API token

Add the token to your shell profile, e.g. `~/.zshrc`, if it's not already there:

```bash
export DATAWRAPPER_TOKEN=your_token_here
```

Then reload your shell or run `source ~/.zshrc`.

### 4. Find your author ID

```bash
npm run whoami
```

This displays your user ID and organization memberships.

### 5. Configure

**Site settings** (`src/lib/config.js`):

```javascript
export default {
  siteTitle: 'My Datawrapper Portfolio',
  siteDescription: 'A collection of data visualizations'
};
```

**API settings** (`scripts/config.js`):

```javascript
export default {
  apiBase: 'https://api.datawrapper.de/v3',
  cdnBase: 'https://datawrapper.dwcdn.net',  // or your custom CDN
  authorId: '',        // or set AUTHOR_ID env var
  organizationId: '',  // or set ORGANIZATION_ID env var
  maxCharts: 500,
  publishedOnly: true
};
```

### 6. Test locally

```bash
# Fetch charts (interactive prom  pts guide you)
npm run fetch

# Start dev server
npm run dev
```

Visit [localhost:5173](http://localhost:5173) to see your gallery.

## Deploy to GitHub Pages

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

### 2. Add repository secret

Go to your repo's **Settings > Secrets and variables > Actions** and add:

- `DATAWRAPPER_TOKEN`: Your Datawrapper API token

### 3. Add repository variables (optional)

In **Settings > Secrets and variables > Actions > Variables**, add:

- `AUTHOR_ID`: Filter to a specific author
- `ORGANIZATION_ID`: Filter to a specific team
- `CDN_BASE`: Custom CDN URL

### 4. Enable GitHub Pages

Go to **Settings > Pages** and set:

- Source: **GitHub Actions**

### 5. Run the workflow

The workflow runs automatically on push to `main` and daily at midnight UTC. You can also trigger it manually from **Actions > Update Gallery > Run workflow**.

Your site will be available at `https://yourusername.github.io/chartfeed/`

## Custom domain

To use a custom domain:

1. Add a `CNAME` file to the `static/` folder with your domain
2. Configure your DNS to point to GitHub Pages
3. Update `svelte.config.js` to remove the base path:

```javascript
paths: {
  base: ''
}
```

## Project structure

```
chartfeed/
├── .github/workflows/
│   └── update-gallery.yml    # GitHub Actions workflow
├── scripts/
│   ├── config.js             # API configuration
│   ├── fetch-charts.js       # Fetches charts from API
│   └── whoami.js             # Discovers your user ID
├── src/
│   ├── lib/
│   │   ├── components/       # Svelte components
│   │   ├── config.js         # Site configuration
│   │   └── data/
│   │       └── charts.json   # Generated chart data
│   ├── routes/
│   │   └── +page.svelte      # Main gallery page
│   └── app.css               # Global styles
└── package.json
```

## Data structure

Each chart object stored in `charts.json` contains:

```javascript
{
  "id": "sGhpX",                    // unique chart ID
  "title": "The first freeze...",  // chart headline
  "type": "d3-maps-symbols",       // raw Datawrapper chart type
  "category": "map",               // simplified category (map, bar, line, table, scatter, pie, other)
  "publishedAt": "2025-09-11T20:48:04.000Z",
  "publicUrl": "https://...",      // live chart URL
  "thumbnailUrl": "https://...",   // chart image
  "description": "Many US...",     // intro/deck text
  "source": "Climate Central",     // data source name
  "byline": "Jane Smith",           // author attribution
  "authorId": 672102,
  "organizationId": "my-team"
}
```

**Searchable fields**: `title`, `description`, `source`, `byline`

**Filterable fields**: `category`, `publishedAt`, `source`, `authorId`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run fetch` | Fetch charts (interactive) |
| `npm run whoami` | Display your Datawrapper user info |
| `npm run update` | Fetch charts and build |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATAWRAPPER_TOKEN` | Yes | Your Datawrapper API token |
| `AUTHOR_ID` | No | Filter charts by author ID |
| `ORGANIZATION_ID` | No | Filter charts by team ID |
| `CDN_BASE` | No | Custom CDN URL for thumbnails |

## License

MIT

