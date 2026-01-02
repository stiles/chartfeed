<script>
  /** @type {{ categories: string[], selectedCategory: string, sortOrder: 'newest' | 'oldest', searchQuery: string, onCategoryChange: (category: string) => void, onSortChange: (order: 'newest' | 'oldest') => void, onSearchChange: (query: string) => void }} */
  let { 
    categories, 
    selectedCategory, 
    sortOrder,
    searchQuery,
    onCategoryChange, 
    onSortChange,
    onSearchChange
  } = $props();

  const categoryLabels = {
    all: 'All',
    map: 'Maps',
    bar: 'Bar Charts',
    line: 'Line Charts',
    table: 'Tables',
    scatter: 'Scatter Plots',
    pie: 'Pie Charts',
    other: 'Other'
  };

  function handleSearchInput(e) {
    onSearchChange(e.target.value);
  }

  function clearSearch() {
    onSearchChange('');
  }
</script>

<div class="filter-bar">
  <div class="search-wrapper">
    <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
    </svg>
    <input
      type="text"
      class="search-input"
      placeholder="Search charts..."
      value={searchQuery}
      oninput={handleSearchInput}
    />
    {#if searchQuery}
      <button class="clear-btn" onclick={clearSearch} aria-label="Clear search">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    {/if}
  </div>

  <div class="filters">
    <button 
      class="filter-btn"
      class:active={selectedCategory === 'all'}
      onclick={() => onCategoryChange('all')}
    >
      All
    </button>
    {#each categories as category}
      <button 
        class="filter-btn"
        class:active={selectedCategory === category}
        onclick={() => onCategoryChange(category)}
      >
        {categoryLabels[category] || category}
      </button>
    {/each}
  </div>

  <div class="sort">
    <label class="sort-label" for="sort-select">Sort:</label>
    <select 
      id="sort-select"
      class="sort-select"
      value={sortOrder}
      onchange={(e) => onSortChange(e.target.value)}
    >
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
    </select>
  </div>
</div>

<style>
  .filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    margin-bottom: var(--space-lg);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-wrap: wrap;
  }

  .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    flex: 0 1 280px;
    min-width: 200px;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    width: 1rem;
    height: 1rem;
    color: var(--color-text-muted);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    font-family: var(--font-sans);
    font-size: 0.85rem;
    padding: var(--space-sm) var(--space-md);
    padding-left: 2.25rem;
    padding-right: 2rem;
    color: var(--color-text);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    transition: border-color var(--transition-fast);
  }

  .search-input::placeholder {
    color: var(--color-text-muted);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  .clear-btn {
    position: absolute;
    right: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    padding: 0;
    color: var(--color-text-muted);
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: color var(--transition-fast);
  }

  .clear-btn:hover {
    color: var(--color-text);
  }

  .clear-btn svg {
    width: 1rem;
    height: 1rem;
  }

  .filters {
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: var(--space-sm) var(--space-md);
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-text-muted);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    transition: 
      color var(--transition-fast),
      background var(--transition-fast),
      border-color var(--transition-fast);
  }

  .filter-btn:hover {
    color: var(--color-text);
    background: var(--color-bg-hover);
  }

  .filter-btn.active {
    color: var(--color-accent);
    background: var(--color-accent-muted);
    border-color: var(--color-accent);
  }

  .sort {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .sort-label {
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  .sort-select {
    font-family: var(--font-sans);
    font-size: 0.85rem;
    padding: var(--space-sm) var(--space-md);
    padding-right: var(--space-xl);
    color: var(--color-text);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239090a0' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
  }

  .sort-select:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  @media (max-width: 640px) {
    .search-wrapper {
      flex: 1 1 100%;
      order: -1;
    }
  }
</style>

