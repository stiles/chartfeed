<script>
  /** @type {{ title: string, count: number, lastUpdated: string | null }} */
  let { title, count, lastUpdated } = $props();

  function formatLastUpdated(dateStr) {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
</script>

<header class="header">
  <div class="header-content">
    <div class="title-block">
      <h1 class="title">{title}</h1>
      <p class="meta">
        <span class="count">{count} charts</span>
        {#if lastUpdated}
          <span class="separator">·</span>
          <span class="updated">Updated {formatLastUpdated(lastUpdated)}</span>
        {/if}
      </p>
    </div>
  </div>
</header>

<style>
  .header {
    padding: var(--space-2xl) 0 var(--space-xl);
  }

  .header-content {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-lg);
    flex-wrap: wrap;
  }

  .title-block {
    flex: 1;
    min-width: 200px;
  }

  .title {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin-bottom: var(--space-sm);
  }

  .meta {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  .count {
    font-weight: 500;
    color: var(--color-accent);
  }

  .separator {
    color: var(--color-text-subtle);
  }

  .updated {
    font-family: var(--font-mono);
    font-size: 0.8rem;
  }
</style>

