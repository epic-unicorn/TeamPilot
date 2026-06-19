<template>
  <div class="training-tabs" role="tablist" aria-label="Training weergave">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      class="training-tab"
      :class="{ active: modelValue === tab.id }"
      :aria-selected="modelValue === tab.id"
      @click="$emit('update:modelValue', tab.id)"
    >
      <span class="material-symbols-rounded tab-icon" aria-hidden="true">{{ tab.icon }}</span>
      <span class="tab-label md-label-lg">{{ tab.label }}</span>
      <span v-if="tab.badge" class="tab-badge md-label-sm">{{ tab.badge }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.training-tabs {
  display: flex;
  gap: 0;
  padding: 0;
  background: transparent;
  border-bottom: 1px solid var(--md-outline-variant);
  margin-bottom: var(--sp-2);
}

.training-tab {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-1);
  min-height: 48px;
  padding: var(--sp-2) var(--sp-1);
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  margin-bottom: -1px;
  background: transparent;
  color: var(--md-on-surface-variant);
  cursor: pointer;
  transition: color var(--md-duration-short), border-color var(--md-duration-short);
}

@media (max-width: 899px) {
  .training-tabs {
    margin-bottom: 0;
  }

  .training-tab {
    flex-direction: column;
    gap: 2px;
    min-height: 52px;
    padding: var(--sp-2) var(--sp-1) var(--sp-1);
  }

  .tab-icon {
    font-size: 22px;
  }

  .tab-label {
    font-size: 11px;
    line-height: 1.2;
    font-weight: 500;
  }

  .tab-badge {
    position: absolute;
    top: 6px;
    right: calc(50% - 24px);
    font-size: 10px;
    min-width: 1rem;
    padding: 0 4px;
  }
}

.training-tab.active {
  color: var(--md-primary);
  border-bottom-color: var(--md-primary);
  background: transparent;
  box-shadow: none;
}

.tab-icon {
  font-size: 20px;
}

.training-tab.active .tab-icon {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}

.tab-badge {
  min-width: 1.25rem;
  padding: 0 6px;
  border-radius: var(--md-shape-full);
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  font-size: 11px;
  line-height: 1.6;
}

.training-tab.active .tab-badge {
  background: var(--md-primary);
  color: var(--md-on-primary);
}
</style>
