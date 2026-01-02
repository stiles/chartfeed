<script>
  import ChartCard from '$lib/components/ChartCard.svelte';
  import Header from '$lib/components/Header.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import chartsData from '$lib/data/charts.json';
  import config from '$lib/config.js';

  const { charts: rawCharts, lastUpdated, meta } = chartsData;

  // Filter out untitled charts
  const charts = rawCharts.filter(c => 
    c.title && c.title.toLowerCase() !== 'untitled'
  );

  // Get unique categories from charts
  const allCategories = [...new Set(charts.map(c => c.category))].sort();

  // Reactive state
  let selectedCategory = $state('all');
  let sortOrder = $state('newest');
  let searchQuery = $state('');

  // Filtered and sorted charts
  let filteredCharts = $derived.by(() => {
    let result = [...charts];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(c => {
        const searchableText = [
          c.title,
          c.description,
          c.source,
          c.byline
        ].filter(Boolean).join(' ').toLowerCase();
        return searchableText.includes(query);
      });
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(c => c.category === selectedCategory);
    }
    
    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  });

  function handleCategoryChange(category) {
    selectedCategory = category;
  }

  function handleSortChange(order) {
    sortOrder = order;
  }

  function handleSearchChange(query) {
    searchQuery = query;
  }

</script>

<svelte:head>
  <title>{config.siteTitle}</title>
  <meta name="description" content={config.siteDescription} />
</svelte:head>

<div class="container">
  <Header 
    title={config.siteTitle}
    count={charts.length}
    {lastUpdated}
  />

  {#if charts.length > 0}
    <FilterBar 
      categories={allCategories}
      {selectedCategory}
      {sortOrder}
      {searchQuery}
      onCategoryChange={handleCategoryChange}
      onSortChange={handleSortChange}
      onSearchChange={handleSearchChange}
    />

    <main class="masonry">
      {#each filteredCharts as chart (chart.id)}
        <div class="masonry-item">
          <ChartCard {chart} />
        </div>
      {/each}
    </main>

    {#if filteredCharts.length === 0}
      <div class="empty">
        <p>No charts match {searchQuery ? `"${searchQuery}"` : 'the selected filter'}.</p>
        <button onclick={() => { searchQuery = ''; selectedCategory = 'all'; }}>
          Clear filters
        </button>
      </div>
    {/if}
  {:else}
    <div class="empty">
      <h2>No charts yet</h2>
      <p>Run the fetch script to populate your portfolio:</p>
      <code>npm run fetch</code>
    </div>
  {/if}
</div>

<footer class="footer">
  <div class="container">
    <p>
      Built with <a href="https://kit.svelte.dev" target="_blank" rel="noopener">SvelteKit</a>
      · Data from <a href="https://datawrapper.de" target="_blank" rel="noopener">Datawrapper</a>
    </p>
  </div>
</footer>

<style>
  .masonry {
    column-count: 1;
    column-gap: var(--space-md);
    padding-bottom: var(--space-2xl);
  }

  .masonry-item {
    break-inside: avoid;
    margin-bottom: var(--space-md);
  }

  @media (min-width: 500px) {
    .masonry {
      column-count: 2;
    }
  }

  @media (min-width: 800px) {
    .masonry {
      column-count: 3;
      column-gap: var(--space-lg);
    }

    .masonry-item {
      margin-bottom: var(--space-lg);
    }
  }

  @media (min-width: 1200px) {
    .masonry {
      column-count: 4;
    }
  }

  @media (min-width: 1600px) {
    .masonry {
      column-count: 5;
    }
  }

  .empty {
    text-align: center;
    padding: var(--space-2xl);
    color: var(--color-text-muted);
  }

  .empty h2 {
    font-size: 1.5rem;
    margin-bottom: var(--space-md);
    color: var(--color-text);
  }

  .empty p {
    margin-bottom: var(--space-md);
  }

  .empty code {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    padding: var(--space-sm) var(--space-md);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
  }

  .empty button {
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-lg);
    font-weight: 500;
    color: var(--color-accent);
    background: var(--color-accent-muted);
    border: 1px solid var(--color-accent);
    border-radius: var(--radius-sm);
    transition: background var(--transition-fast);
  }

  .empty button:hover {
    background: var(--color-accent);
    color: white;
  }

  .footer {
    border-top: 1px solid var(--color-border-subtle);
    padding: var(--space-xl) 0;
    margin-top: auto;
  }

  .footer p {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    text-align: center;
  }

  .footer a {
    color: var(--color-text);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .footer a:hover {
    color: var(--color-accent);
  }
</style>

