<template>
  <section class="saved-panel card card-elevated">
    <div class="panel-head">
      <p class="md-title-sm">Opgeslagen trainingen</p>
      <span class="md-label-sm count">{{ filtered.length }}/{{ recipes.length }}</span>
    </div>

    <div class="theme-filters" role="tablist" aria-label="Filter op weekthema">
      <button
        v-for="chip in themeChips"
        :key="chip.id || 'all'"
        type="button"
        class="theme-chip md-label-sm"
        :class="{ active: themeFilter === chip.id }"
        @click="themeFilter = chip.id"
      >
        <span v-if="chip.icon" class="material-symbols-rounded chip-icon" aria-hidden="true">{{ chip.icon }}</span>
        {{ chip.label }}
      </button>
    </div>

    <div v-if="!filtered.length" class="saved-empty md-body-sm">
      <template v-if="recipes.length">
        Geen trainingen voor dit thema — kies een ander filter.
      </template>
      <template v-else>
        Sla een sessie op als recept, of importeer een gedeeld recept van een collega.
      </template>
    </div>

    <div v-else class="saved-list">
      <article v-for="recipe in filtered" :key="recipe.id" class="saved-item">
        <div class="saved-item-main">
          <p class="md-label-lg saved-name">{{ recipe.name }}</p>
          <p class="md-body-sm saved-meta">
            <span v-if="recipe.cycleTheme" class="theme-badge">
              <span class="material-symbols-rounded theme-badge-icon" aria-hidden="true">{{ getCycleThemeIcon(recipe.cycleTheme) }}</span>
              {{ cycleThemeLabel(recipe.cycleTheme) }}
            </span>
            {{ trainingTypeLabel(recipe.trainingType) }}
            · {{ recipe.durationMin }} min
            · {{ recipe.exerciseCount }} oef.
          </p>
          <p v-if="recipe.sharedFrom?.name" class="md-label-sm shared-from">
            Via {{ recipe.sharedFrom.name }}
          </p>
        </div>
        <div class="saved-actions">
          <button
            type="button"
            class="btn btn-filled btn-sm"
            @click="$emit('use', recipe)"
          >
            Gebruik
          </button>
          <button
            type="button"
            class="btn btn-tonal btn-sm"
            @click="$emit('edit', recipe)"
          >
            Bewerken
          </button>
          <button
            type="button"
            class="btn-icon"
            aria-label="Dupliceren"
            title="Dupliceren"
            @click="$emit('duplicate', recipe)"
          >
            <span class="material-symbols-rounded">content_copy</span>
          </button>
          <button
            type="button"
            class="btn-icon"
            aria-label="Delen"
            title="Deel recept"
            @click="$emit('share', recipe)"
          >
            <span class="material-symbols-rounded">share</span>
          </button>
          <button
            type="button"
            class="btn-icon danger"
            aria-label="Verwijderen"
            title="Verwijderen"
            @click="confirmDelete(recipe)"
          >
            <span class="material-symbols-rounded">delete</span>
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { TRAINING_TYPES } from '@/data/exercises'
import { CYCLE_THEME_OPTIONS, cycleThemeLabel, getCycleThemeIcon } from '@/utils/savedTraining'

const props = defineProps({
  recipes: { type: Array, required: true },
})

const emit = defineEmits(['use', 'edit', 'share', 'duplicate', 'delete'])

const themeFilter = ref('')

const themeChips = computed(() => [
  { id: '', label: 'Alle', icon: null },
  ...CYCLE_THEME_OPTIONS.filter(o => o.id && props.recipes.some(r => r.cycleTheme === o.id)),
])

const filtered = computed(() => {
  if (!themeFilter.value) return props.recipes
  return props.recipes.filter(r => r.cycleTheme === themeFilter.value)
})

function trainingTypeLabel(id) {
  return TRAINING_TYPES.find(t => t.id === id)?.label ?? id
}

function confirmDelete(recipe) {
  if (window.confirm(`"${recipe.name}" verwijderen?`)) {
    emit('delete', recipe)
  }
}
</script>

<style scoped>
.saved-panel {
  padding: var(--sp-3);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  margin-bottom: var(--sp-2);
}

.count {
  color: var(--md-on-surface-variant);
}

.theme-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1);
  margin-bottom: var(--sp-3);
}

.theme-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: var(--md-shape-full);
  border: 1px solid var(--md-outline-variant);
  background: var(--md-surface);
  color: var(--md-on-surface-variant);
  cursor: pointer;
}

.theme-chip.active {
  border-color: var(--md-primary);
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
}

.saved-empty {
  padding: var(--sp-4) var(--sp-2);
  text-align: center;
  color: var(--md-on-surface-variant);
}

.saved-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.saved-item {
  padding: var(--sp-3);
  border-radius: var(--md-shape-md);
  border: 1px solid var(--md-outline-variant);
  background: var(--md-surface-container-low);
}

.saved-name {
  margin: 0;
}

.saved-meta {
  margin: var(--sp-1) 0 0;
  color: var(--md-on-surface-variant);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-1);
}

.theme-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 8px 1px 4px;
  border-radius: var(--md-shape-full);
  background: var(--md-tertiary-container);
  color: var(--md-on-tertiary-container);
  font-size: 11px;
  font-weight: 600;
}

.theme-badge-icon,
.chip-icon {
  font-size: 14px;
}

.theme-badge-icon {
  font-size: 13px;
}

.shared-from {
  margin: var(--sp-1) 0 0;
  color: var(--md-outline);
}

.saved-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-1);
  margin-top: var(--sp-2);
}

.btn-sm {
  min-height: 36px;
  padding: 0 var(--sp-3);
  font-size: 13px;
}

.danger {
  color: var(--md-error);
}
</style>