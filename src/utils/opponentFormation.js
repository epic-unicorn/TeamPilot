import { FORMATIONS, FORMATION_Y } from '@/data/formations'

export const OPPONENT_MODES = ['off', 'mirror', 'optimal', 'alternative']

/** Tactical counter formation per formation id */
const COUNTER_MAP = {
  '2-2-1':   '2-1-2',
  '2-1-2':   '1-3-1',
  '1-3-1':   '2-2-1',
  '3-2-2':   '2-3-2',
  '2-3-2':   '3-3-1',
  '3-3-1':   '3-2-2',
  '4-3-3':   '4-4-2',
  '4-4-2':   '4-3-3',
  '4-2-3-1': '3-5-2',
  '3-5-2':   '4-3-3',
}

const MODE_LABELS = {
  off: 'Tegenstander uit',
  mirror: 'Zelfde opstelling voor tegenstander',
  optimal: 'Optimale tegenstander opstelling',
  alternative: 'Alternatieve tegenstander opstelling',
}

export function getOpponentModeLabel(mode) {
  return MODE_LABELS[mode] ?? MODE_LABELS.off
}

function slotsFromFormation(formation) {
  return formation.slots.map((slot, i) => ({
    slotId: `opp-${i}`,
    x: slot.x,
    y: 100 - slot.y,
    number: i + 1,
  }))
}

function mirrorFreeSlots(fieldSlots, playerCount) {
  const filled = (fieldSlots ?? []).filter(s => s.playerId)
  if (filled.length) {
    return filled.map((slot, i) => ({
      slotId: `opp-${i}`,
      x: slot.x,
      y: 100 - slot.y,
      number: i + 1,
    }))
  }
  return spreadFallbackSlots(playerCount ?? 11)
}

function spreadFallbackSlots(count) {
  const rows = Math.ceil(Math.sqrt(count))
  const cols = Math.ceil(count / rows)
  const xStep = 100 / (cols + 1)
  const ySpan = FORMATION_Y.ATT - FORMATION_Y.GK
  const yStep = ySpan / (rows + 1)
  const slots = []
  let idx = 0
  for (let r = 0; r < rows && idx < count; r++) {
    for (let c = 0; c < cols && idx < count; c++) {
      const ownY = FORMATION_Y.GK + (r + 1) * yStep
      slots.push({
        slotId: `opp-${idx}`,
        x: (c + 1) * xStep,
        y: 100 - ownY,
        number: idx + 1,
      })
      idx++
    }
  }
  return slots
}

function getFormation(ageGroup, formationId) {
  const formations = FORMATIONS[ageGroup] ?? []
  return formationId ? formations.find(f => f.id === formationId) ?? null : null
}

function getOptimalFormation(ageGroup, formationId) {
  const formations = FORMATIONS[ageGroup] ?? []
  const counterId = formationId ? (COUNTER_MAP[formationId] ?? formations[0]?.id) : formations[0]?.id
  return formations.find(f => f.id === counterId) ?? formations[0] ?? null
}

function getAlternativeFormation(ageGroup, formationId) {
  const formations = FORMATIONS[ageGroup] ?? []
  const optimal = getOptimalFormation(ageGroup, formationId)
  const alternative = formations.find(f => f.id !== formationId && f.id !== optimal?.id)
    ?? formations.find(f => f.id !== formationId)
    ?? formations[0]
  return alternative ?? null
}

export function buildMirrorOpponentSlots({ ageGroup, formationId, fieldSlots, playerCount }) {
  const own = getFormation(ageGroup, formationId)
  if (own) return slotsFromFormation(own)
  return mirrorFreeSlots(fieldSlots, playerCount ?? 11)
}

export function buildOptimalOpponentSlots({ ageGroup, formationId, fieldSlots, playerCount }) {
  const counter = getOptimalFormation(ageGroup, formationId)
  if (counter) return slotsFromFormation(counter)

  const filled = (fieldSlots ?? []).filter(s => s.playerId)
  if (filled.length) return mirrorFreeSlots(fieldSlots)
  return spreadFallbackSlots(playerCount ?? 11)
}

export function buildAlternativeOpponentSlots({ ageGroup, formationId, fieldSlots, playerCount }) {
  const alternative = getAlternativeFormation(ageGroup, formationId)
  if (alternative) return slotsFromFormation(alternative)

  return buildOptimalOpponentSlots({ ageGroup, formationId, fieldSlots, playerCount })
}

export function buildOpponentSlotsForMode(mode, params) {
  switch (mode) {
    case 'mirror':
      return buildMirrorOpponentSlots(params)
    case 'optimal':
      return buildOptimalOpponentSlots(params)
    case 'alternative':
      return buildAlternativeOpponentSlots(params)
    default:
      return []
  }
}

/** @deprecated Use buildOptimalOpponentSlots — kept for compatibility */
export function buildOpponentSlots(params) {
  return buildOptimalOpponentSlots(params)
}

export function getCounterFormationLabel(ageGroup, formationId) {
  return getOptimalFormation(ageGroup, formationId)?.label ?? null
}
