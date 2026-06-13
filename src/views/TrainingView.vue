<template>
  <div class="page">
    <div v-if="payload" class="view-content">
      <div class="view-header">
        <div>
          <h1 class="md-headline-sm">Gedeelde training</h1>
          <p class="md-body-sm view-meta">
            {{ payload.teamName }} · {{ ageGroupLabel }} · {{ knvbLabel }}
            · {{ trainingTypeLabel }} · {{ payload.playerCount }} spelers
          </p>
          <p class="md-label-sm view-meta">Weekthema: {{ cycleThemeLabel }}</p>
        </div>
        <button v-if="canImport" class="btn btn-filled" @click="importToTeam">
          <span class="material-symbols-rounded" style="font-size:18px">download</span>
          In mijn team
        </button>
      </div>

      <p class="md-label-md total-line">
        {{ totalMin }} min · {{ blocks.length }} oefening{{ blocks.length !== 1 ? 'en' : '' }}
      </p>

      <div class="session-list">
        <button
          v-for="(block, i) in blocks"
          :key="block.exercise.id + i"
          class="session-item card card-elevated"
          @click="detailBlock = block"
        >
          <span class="session-num md-label-md">{{ i + 1 }}</span>
          <div class="session-info">
            <p class="md-title-sm session-title">
              <span
                v-if="isCustomExercise(block.exercise)"
                class="custom-ex-badge"
                title="Eigen oefening"
              >
                <span class="material-symbols-rounded" aria-hidden="true">draw</span>
              </span>
              <span class="session-title-text">{{ getExerciseTitle(block.exercise) }}</span>
            </p>
            <p class="md-body-sm meta">
              {{ categoryLabel(block.exercise.category) }} · {{ block.durationMin }} min
            </p>
          </div>
          <span class="material-symbols-rounded chevron">chevron_right</span>
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <span class="material-symbols-rounded empty-icon">link_off</span>
      <p class="md-title-md">Ongeldige link</p>
      <p class="md-body-md">Deze trainingslink is ongeldig of verlopen.</p>
      <RouterLink to="/" class="btn btn-tonal mt-3">Naar TeamPilot</RouterLink>
    </div>

    <ExerciseDetailDialog
      :block="detailBlock"
      :player-count="payload?.playerCount ?? 0"
      :show-player-range="false"
      @close="detailBlock = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/teamStore'
import { decodeTrainingSession } from '@/utils/trainingShare'
import { getExerciseById, EXERCISE_CATEGORIES, TRAINING_TYPES } from '@/data/exercises'
import { getKnvbClass } from '@/data/knvbClasses'
import { AGE_GROUPS } from '@/data/formations'
import { getCycleTheme, getCycleThemeLabel } from '@/utils/trainingEngine'
import ExerciseDetailDialog from '@/components/training/ExerciseDetailDialog.vue'
import { getExerciseTitle, isCustomExercise } from '@/utils/exerciseText'
import { showSnackbar } from '@/composables/useSnackbar'

const route = useRoute()
const router = useRouter()
const store = useTeamStore()

const payload = ref(null)
const detailBlock = ref(null)

const blocks = computed(() => {
  if (!payload.value) return []
  const customList = payload.value.customExercises ?? []
  return payload.value.blocks
    .map(b => {
      const exercise = getExerciseById(b.exerciseId, customList)
      if (!exercise) return null
      return { exercise, durationMin: b.durationMin }
    })
    .filter(Boolean)
})

const totalMin = computed(() => blocks.value.reduce((s, b) => s + b.durationMin, 0))

const ageGroupLabel = computed(() =>
  AGE_GROUPS.find(g => g.id === payload.value?.ageGroup)?.label ?? payload.value?.ageGroup
)

const knvbLabel = computed(() =>
  getKnvbClass(payload.value?.knvbClass).label
)

const trainingTypeLabel = computed(() =>
  TRAINING_TYPES.find(t => t.id === payload.value?.trainingType)?.label ?? payload.value?.trainingType
)

const cycleThemeLabel = computed(() =>
  getCycleThemeLabel(getCycleTheme(payload.value?.cycleWeek ?? 1))
)

const canImport = computed(() => blocks.value.length > 0 && store.activeTeam)

function categoryLabel(id) {
  return EXERCISE_CATEGORIES.find(c => c.id === id)?.label ?? id
}

function importToTeam() {
  if (!payload.value || !blocks.value.length) return
  store.importSharedTraining(store.activeTeamId, {
    trainingType: payload.value.trainingType,
    durationMin: payload.value.durationMin,
    playerCount: payload.value.playerCount,
    blocks: blocks.value.map(b => ({ exerciseId: b.exercise.id, durationMin: b.durationMin })),
    customExercises: payload.value.customExercises ?? [],
  })
  showSnackbar('Training geladen in jouw team ✓')
  router.push('/training')
}

onMounted(() => {
  const encoded = route.query.training
  if (!encoded) return
  payload.value = decodeTrainingSession(String(encoded))
})
</script>

<style scoped>
.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-3);
  margin-bottom: var(--sp-4);
  flex-wrap: wrap;
}
.view-meta { color: var(--md-on-surface-variant); margin-top: var(--sp-1); }
.total-line { margin-bottom: var(--sp-3); color: var(--md-on-surface-variant); }
.session-list { display: flex; flex-direction: column; gap: var(--sp-2); }
.session-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  width: 100%;
  border: none;
  cursor: pointer;
  text-align: left;
  background: var(--md-surface);
}
.session-num {
  width: 28px;
  height: 28px;
  border-radius: var(--md-shape-full);
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.session-info { flex: 1; min-width: 0; }
.session-title {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin: 0;
  min-width: 0;
}
.session-title-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta { color: var(--md-on-surface-variant); }
.chevron { color: var(--md-outline); }
.custom-ex-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--md-shape-sm);
  background: var(--md-tertiary-container);
  color: var(--md-on-tertiary-container);
  flex-shrink: 0;
}
.custom-ex-badge .material-symbols-rounded {
  font-size: 15px;
}
.empty-state { text-align: center; padding: var(--sp-8) var(--sp-4); }
.empty-icon { font-size: 48px; color: var(--md-outline); display: block; margin-bottom: var(--sp-3); }
</style>
