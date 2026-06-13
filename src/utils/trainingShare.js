/**
 * Training share encoding / decoding.
 *
 * Payload:
 * {
 *   _t: 'training',
 *   tn, a, k, tt, d, pc, cw,
 *   b:  [["ex-id", 10], ...],
 *   ce: { "custom-id": { title, category, ... } }  // embedded custom exercises
 * }
 */

import { isCustomExercise, restoreCustomExercise, serializeCustomForShare } from './customExercises'

function encode(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj))
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function decode(encoded) {
  const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

function collectCustomExercises(blocks) {
  const ce = {}
  for (const block of blocks) {
    const ex = block.exercise
    if (isCustomExercise(ex)) {
      ce[ex.id] = serializeCustomForShare(ex)
    }
  }
  return Object.keys(ce).length ? ce : undefined
}

export function encodeTrainingSession({
  teamName,
  ageGroup,
  knvbClass,
  trainingType,
  durationMin,
  playerCount,
  cycleWeek,
  blocks,
}) {
  const payload = {
    _t: 'training',
    tn: teamName,
    a: ageGroup,
    k: knvbClass,
    tt: trainingType,
    d: durationMin,
    pc: playerCount,
    cw: cycleWeek,
    b: blocks.map(bl => [bl.exercise.id, bl.durationMin]),
  }
  const ce = collectCustomExercises(blocks)
  if (ce) payload.ce = ce
  return encode(payload)
}

export function decodeTrainingSession(encoded) {
  try {
    const d = decode(encoded)
    if (d._t !== 'training' || !Array.isArray(d.b)) return null

    const customById = d.ce ?? {}
    const customExercises = Object.entries(customById).map(([id, data]) =>
      restoreCustomExercise(id, data, d.a ?? 'JO11')
    )

    return {
      teamName: d.tn ?? 'Training',
      ageGroup: d.a ?? 'JO11',
      knvbClass: d.k ?? '5e',
      trainingType: d.tt ?? 'gemengd',
      durationMin: d.d ?? 60,
      playerCount: d.pc ?? 0,
      cycleWeek: d.cw ?? 1,
      blocks: d.b.map(([id, durationMin]) => ({ exerciseId: id, durationMin })),
      customExercises,
    }
  } catch {
    return null
  }
}

export function buildTrainingShareUrl(encoded) {
  return `${window.location.origin}${window.location.pathname}#/training/view?training=${encoded}`
}

export function resolveSharedExercise(exerciseId, customExercises = []) {
  const custom = customExercises.find(e => e.id === exerciseId)
  if (custom) return custom
  return null
}
