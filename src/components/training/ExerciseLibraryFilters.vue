<template>
  <details class="library-filters">
    <summary class="filters-summary md-label-md">
      <span class="material-symbols-rounded filters-summary-icon" aria-hidden="true">tune</span>
      <span class="filters-summary-text">Zoeken &amp; filters</span>
      <span v-if="hasActiveFilters" class="filters-active-dot" aria-label="Filters actief" />
      <span class="material-symbols-rounded filters-chevron" aria-hidden="true">expand_more</span>
    </summary>

    <div class="filters-body">
      <div class="filter-toolbar">
        <label class="search-field">
          <span class="material-symbols-rounded search-icon" aria-hidden="true">search</span>
          <input
            class="search-input"
            type="search"
            :value="query"
            placeholder="Zoek oefening…"
            aria-label="Zoek oefening"
            @input="$emit('update:query', $event.target.value)"
          />
        </label>

        <select
          class="filter-select"
          :value="category"
          aria-label="Categorie"
          @change="$emit('update:category', $event.target.value)"
        >
          <option value="">Alle categorieën</option>
          <option v-for="c in EXERCISE_CATEGORIES" :key="c.id" :value="c.id">{{ c.label }}</option>
        </select>

        <button
          v-if="query || hasActiveFilters"
          type="button"
          class="btn-icon reset-btn"
          aria-label="Filters wissen"
          title="Filters wissen"
          @click="$emit('reset')"
        >
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      <label
        class="suitable-toggle md-label-sm"
        title="Verberg oefeningen die niet passen bij leeftijd, klasse en aantal spelers van je team"
      >
        <input
          type="checkbox"
          :checked="suitableOnly"
          @change="$emit('update:suitableOnly', $event.target.checked)"
        />
        <span class="suitable-label">Alleen passend</span>
      </label>
    </div>

    <p class="result-count md-label-sm">{{ resultCount }} {{ resultCount === 1 ? 'oefening' : 'oefeningen' }}</p>
  </details>
</template>

<script setup>
import { computed } from 'vue'
import { EXERCISE_CATEGORIES } from '@/data/exercises'

const props = defineProps({
  query: { type: String, default: '' },
  category: { type: String, default: '' },
  suitableOnly: { type: Boolean, default: true },
  resultCount: { type: Number, default: 0 },
})

defineEmits(['update:query', 'update:category', 'update:suitableOnly', 'reset'])

const hasActiveFilters = computed(() =>
  Boolean(props.query || props.category || !props.suitableOnly)
)
</script>

<style scoped>
.library-filters {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  margin-bottom: var(--sp-2);
  flex-shrink: 0;
}

.filters-summary {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  min-height: 40px;
  padding: var(--sp-2) var(--sp-3);
  border: 1px solid var(--md-outline-variant);
  border-radius: var(--md-shape-md);
  background: var(--md-surface-container-low);
  cursor: pointer;
  list-style: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.filters-summary::-webkit-details-marker {
  display: none;
}

.filters-summary-icon {
  font-size: 18px;
  color: var(--md-on-surface-variant);
  flex-shrink: 0;
}

.filters-summary-text {
  flex: 1;
  min-width: 0;
}

.filters-active-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--md-shape-full);
  background: var(--md-primary);
  flex-shrink: 0;
}

.filters-chevron {
  font-size: 20px;
  color: var(--md-on-surface-variant);
  flex-shrink: 0;
  transition: transform var(--md-duration-short);
}

.library-filters[open] .filters-chevron {
  transform: rotate(180deg);
}

.filters-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding-top: var(--sp-1);
}

.filter-toolbar {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-wrap: nowrap;
  min-width: 0;
  --filter-control-height: 40px;
}

.search-field {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  box-sizing: border-box;
  height: var(--filter-control-height);
  padding: 0 var(--sp-2);
  border: 1px solid var(--md-outline-variant);
  border-radius: var(--md-shape-md);
  background: var(--md-surface);
}

.search-icon {
  font-size: 18px;
  color: var(--md-on-surface-variant);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: var(--md-on-surface);
  outline: none;
}

.search-input::placeholder {
  color: var(--md-on-surface-variant);
}

.filter-select {
  flex: 0 1 auto;
  box-sizing: border-box;
  width: auto;
  max-width: 10.5rem;
  min-width: 0;
  height: var(--filter-control-height);
  padding: 0 var(--sp-2);
  border: 1px solid var(--md-outline-variant);
  border-radius: var(--md-shape-md);
  background: var(--md-surface);
  font: inherit;
  font-size: 14px;
  color: var(--md-on-surface);
  outline: none;
  appearance: none;
  cursor: pointer;
}

.filter-select:hover {
  border-color: var(--md-outline);
}

.filter-select:focus {
  border-color: var(--md-primary);
  background: color-mix(in srgb, var(--md-primary) 4%, transparent);
}

.suitable-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--md-on-surface-variant);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  align-self: flex-start;
}

.suitable-toggle input {
  width: 14px;
  height: 14px;
  accent-color: var(--md-primary);
  flex-shrink: 0;
}

.suitable-label {
  font-size: 11px;
  line-height: 1.2;
}

.reset-btn {
  flex-shrink: 0;
  color: var(--md-on-surface-variant);
}

.result-count {
  margin: 0;
  color: var(--md-on-surface-variant);
}

@media (min-width: 720px) {
  .filter-select {
    max-width: 12rem;
  }

  .suitable-label {
    font-size: 12px;
  }

  .search-input {
    font-size: 15px;
  }
}
</style>
