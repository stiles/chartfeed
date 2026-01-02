<script>
  /** @type {{ chart: { id: string, title: string, type: string, category: string, publishedAt: string, publicUrl: string, thumbnailUrl: string, description?: string, source?: string, byline?: string } }} */
  let { chart } = $props();

  const categoryColors = {
    map: '#2E7D6B',
    bar: '#D4694A',
    line: '#5B8BD4',
    table: '#8B6BB3',
    scatter: '#C9A227',
    pie: '#D46A8B',
    other: '#6B7280'
  };

  const categoryLabels = {
    map: 'Map',
    bar: 'Bar',
    line: 'Line',
    table: 'Table',
    scatter: 'Scatter',
    pie: 'Pie',
    other: 'Chart'
  };

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  let imageError = $state(false);
</script>

<a 
  href={chart.publicUrl} 
  target="_blank" 
  rel="noopener noreferrer"
  class="card"
>
  <div class="thumbnail">
    {#if !imageError}
      <img 
        src={chart.thumbnailUrl} 
        alt={chart.title}
        loading="lazy"
        onerror={() => imageError = true}
      />
    {:else}
      <div class="placeholder">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zm-7-2l-4-5 3-4 4 5.5L18 9v8H6v-2l6-4z"/>
        </svg>
      </div>
    {/if}
  </div>
  
  <div class="content">
    <div class="header">
      <span 
        class="badge" 
        style="background-color: {categoryColors[chart.category] || categoryColors.other}"
      >
        {categoryLabels[chart.category] || 'Chart'}
      </span>
      <time class="date" datetime={chart.publishedAt}>
        {formatDate(chart.publishedAt)}
      </time>
    </div>
    
    <h3 class="title">{chart.title}</h3>
    
    {#if chart.source}
      <p class="source">{chart.source}</p>
    {/if}
  </div>
</a>

<style>
  .card {
    display: block;
    background: var(--color-bg-card);
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--color-border-subtle);
    transition: 
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease;
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    border-color: var(--color-border);
  }

  .thumbnail {
    position: relative;
    background: var(--color-bg-elevated);
    overflow: hidden;
    line-height: 0;
  }

  .thumbnail img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s ease;
  }

  .card:hover .thumbnail img {
    transform: scale(1.02);
  }

  .placeholder {
    aspect-ratio: 4 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-hover);
    color: var(--color-text-muted);
  }

  .placeholder svg {
    width: 48px;
    height: 48px;
    opacity: 0.4;
  }

  .content {
    padding: var(--space-md);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    margin-bottom: var(--space-xs);
  }

  .badge {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 2px 6px;
    color: #fff;
    border-radius: 3px;
  }

  .date {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
  }

  .title {
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1.35;
    color: var(--color-text);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .source {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    margin: var(--space-xs) 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
