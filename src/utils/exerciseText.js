/**
 * Build Rinus exercise URL and player-aware exercise text.
 */

import { RINUS_ID_MAP } from '@/data/rinusLinks'
import { RINUS_META_BY_RINUS_ID, RINUS_META_MAP } from '@/data/rinusMetaMap'
import { RINUS_SVG_BY_RINUS_ID, RINUS_SVG_MAP } from '@/data/rinusSvgMap'
import { RINUS_RULES_BY_RINUS_ID, RINUS_RULES_MAP } from '@/data/rinusRulesMap'
import { isCustomExercise } from '@/utils/customExercises'

export { isCustomExercise }

function rinusIdFor(exercise) {
  if (isCustomExercise(exercise)) return null
  return exercise.rinusId ?? RINUS_ID_MAP[exercise.id] ?? null
}

export function getRinusMeta(exercise) {
  if (isCustomExercise(exercise)) return null
  if (RINUS_META_MAP[exercise.id]) return RINUS_META_MAP[exercise.id]
  const id = rinusIdFor(exercise)
  if (id && RINUS_META_BY_RINUS_ID[String(id)]) return RINUS_META_BY_RINUS_ID[String(id)]
  return null
}

export function getExerciseTitle(exercise) {
  if (isCustomExercise(exercise)) return exercise.title
  return getRinusMeta(exercise)?.title ?? exercise.title
}

export function getExerciseDurationMin(exercise) {
  if (isCustomExercise(exercise)) return exercise.durationMin
  return getRinusMeta(exercise)?.durationMin ?? exercise.durationMin
}

function playerBounds(exercise) {
  if (isCustomExercise(exercise)) {
    return { minPlayers: exercise.minPlayers, maxPlayers: exercise.maxPlayers }
  }
  const meta = getRinusMeta(exercise)
  return {
    minPlayers: meta?.minPlayers ?? exercise.minPlayers,
    maxPlayers: meta?.maxPlayers ?? exercise.maxPlayers,
  }
}

export function getRinusUrl(exercise) {
  if (isCustomExercise(exercise)) return null
  const id = rinusIdFor(exercise)
  if (id) return `https://rinus.knvb.nl/nl/exercise/id/${id}`
  return 'https://rinus.knvb.nl/'
}

export function getRinusSvgUrl(exercise) {
  if (exercise.customSvg) return exercise.customSvg
  if (exercise.rinusSvgUrl) return exercise.rinusSvgUrl
  if (RINUS_SVG_MAP[exercise.id]) return RINUS_SVG_MAP[exercise.id]
  const id = rinusIdFor(exercise)
  if (id && RINUS_SVG_BY_RINUS_ID[String(id)]) return RINUS_SVG_BY_RINUS_ID[String(id)]
  return null
}

export function getRinusRules(exercise) {
  if (isCustomExercise(exercise)) return exercise.rules ?? []
  if (RINUS_RULES_MAP[exercise.id]?.length) return RINUS_RULES_MAP[exercise.id]
  const id = rinusIdFor(exercise)
  if (id && RINUS_RULES_BY_RINUS_ID[String(id)]?.length) return RINUS_RULES_BY_RINUS_ID[String(id)]
  return []
}

export function formatPlayerNote(exercise, playerCount) {
  const { minPlayers, maxPlayers } = playerBounds(exercise)
  if (playerCount == null) return ''

  if (playerCount < minPlayers) {
    const diff = minPlayers - playerCount
    return `Met ${playerCount} aanwezige speler${playerCount !== 1 ? 's' : ''} (${minPlayers}–${maxPlayers} ideaal, ${diff} tekort): verdeel het team in kleinere groepen, wissel met een andere oefening, of vul aan met spelbegeleiders. `
  }
  if (playerCount > maxPlayers) {
    const groups = Math.ceil(playerCount / maxPlayers)
    return `Met ${playerCount} aanwezige spelers (${minPlayers}–${maxPlayers} per groep): maak ${groups} groepen en roteer elke ${getExerciseDurationMin(exercise)} min. `
  }
  return `Met ${playerCount} aanwezige speler${playerCount !== 1 ? 's' : ''} (${minPlayers}–${maxPlayers}): `
}

export function buildExerciseDescription(exercise, playerCount) {
  if (isCustomExercise(exercise)) {
    return formatPlayerNote(exercise, playerCount) + (exercise.description ?? '')
  }
  const meta = getRinusMeta(exercise)
  let text = ''
  if (meta?.description && meta.description !== 'Geen voetbalhandeling') {
    const action = meta.footballAction
    text = action && action !== 'Geen voetbalhandeling' && action !== meta.description
      ? `${meta.description} (${action}).`
      : `${meta.description}.`
  } else if (!meta) {
    text = exercise.description
  }
  return formatPlayerNote(exercise, playerCount) + text
}

export function buildExerciseSetup(exercise, playerCount) {
  const base = isCustomExercise(exercise)
    ? exercise.setup
    : (getRinusMeta(exercise)?.dimensions?.length
      ? getRinusMeta(exercise).dimensions.join('. ') + '.'
      : exercise.setup)
  if (playerCount == null) return base

  const { minPlayers, maxPlayers } = playerBounds(exercise)
  if (playerCount >= minPlayers && playerCount <= maxPlayers) {
    return `${base} Werk met ${playerCount} spelers.`
  }
  if (playerCount > maxPlayers) {
    const groups = Math.ceil(playerCount / maxPlayers)
    const perGroup = Math.ceil(playerCount / groups)
    return `${base} Verdeel ${playerCount} spelers over ${groups} velden (ca. ${perGroup} per veld).`
  }
  return `${base} Pas de opstelling aan voor ${playerCount} speler${playerCount !== 1 ? 's' : ''} (minimaal ${minPlayers} aanbevolen).`
}

export function playerRangeLabel(exercise) {
  const { minPlayers, maxPlayers } = playerBounds(exercise)
  if (minPlayers === maxPlayers) return `${minPlayers} spelers`
  return `${minPlayers}–${maxPlayers} spelers`
}
