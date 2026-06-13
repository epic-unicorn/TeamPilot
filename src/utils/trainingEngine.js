import { EXERCISES } from '@/data/exercises'

export function analyzePlayerBalance(players) {
  const counts = { GK: 0, DEF: 0, WB: 0, MID: 0, ATT: 0 }
  for (const p of players) {
    if (counts[p.position] !== undefined) counts[p.position]++
  }
  const defenders = counts.DEF + counts.GK + counts.WB * 0.5
  const attackers = counts.ATT + counts.WB * 0.5
  const midfielders = counts.MID
  const total = players.length || 1
  return {
    counts,
    defenders,
    attackers,
    midfielders,
    defenderRatio: defenders / total,
    attackerRatio: attackers / total,
    needsAttackFocus: defenders > attackers + 1,
    needsDefenceFocus: attackers > defenders + 1,
  }
}

export function filterExercises({
  ageGroup,
  knvbLevel,
  playerCount,
  trainingType,
  category,
}) {
  return EXERCISES.filter(ex => {
    if (!ex.ageGroups.includes(ageGroup)) return false
    if (knvbLevel < ex.minKnvbLevel || knvbLevel > ex.maxKnvbLevel) return false
    if (playerCount < ex.minPlayers || playerCount > ex.maxPlayers) return false
    if (trainingType && !ex.trainingTypes.includes(trainingType)) return false
    if (category && ex.category !== category) return false
    return true
  })
}

function scoreExercise(ex, ctx) {
  let score = 10
  const fb = ctx.feedback?.[ex.id]
  if (fb) {
    score += (fb.likes ?? 0) * 2
    score -= (fb.dislikes ?? 0) * 4
    if (fb.ratingSum && fb.count) {
      const avg = fb.ratingSum / fb.count
      score += (avg - 3) * 2
    }
  }
  if (ex.cycleThemes?.includes(ctx.cycleTheme)) score += 5
  if (ex.focusPositions?.some(p => ctx.focusPositions?.includes(p))) score += 3
  if (ctx.needsAttackFocus && ex.focusPositions?.includes('ATT')) score += 4
  if (ctx.needsDefenceFocus && ex.focusPositions?.includes('DEF')) score += 4
  if (ctx.recentIds?.includes(ex.id)) score -= 8
  return score
}

function pickBest(pool, ctx, usedIds) {
  const available = pool.filter(ex => !usedIds.has(ex.id))
  if (!available.length) return null
  const ranked = [...available].sort((a, b) => scoreExercise(b, ctx) - scoreExercise(a, ctx))
  return ranked[0]
}

const SESSION_TEMPLATES = {
  techniek: [
    { category: 'warming-up', share: 0.12 },
    { category: 'techniek', share: 0.65 },
    { category: 'partijvorm', share: 0.13 },
    { category: 'afsluiting', share: 0.10 },
  ],
  tactiek: [
    { category: 'warming-up', share: 0.10 },
    { category: 'tactiek', share: 0.55 },
    { category: 'partijvorm', share: 0.25 },
    { category: 'afsluiting', share: 0.10 },
  ],
  conditie: [
    { category: 'warming-up', share: 0.15 },
    { category: 'conditie', share: 0.55 },
    { category: 'partijvorm', share: 0.15 },
    { category: 'afsluiting', share: 0.15 },
  ],
  gemengd: [
    { category: 'warming-up', share: 0.12 },
    { category: 'techniek', share: 0.25 },
    { category: 'tactiek', share: 0.20 },
    { category: 'conditie', share: 0.13 },
    { category: 'partijvorm', share: 0.20 },
    { category: 'afsluiting', share: 0.10 },
  ],
  partij: [
    { category: 'warming-up', share: 0.15 },
    { category: 'techniek', share: 0.15 },
    { category: 'partijvorm', share: 0.55 },
    { category: 'afsluiting', share: 0.15 },
  ],
}

const CYCLE_THEMES = ['techniek', 'passing', 'tactiek', 'conditie']

export { CYCLE_THEMES }

export function getCycleTheme(week) {
  return CYCLE_THEMES[(week - 1) % CYCLE_THEMES.length]
}

const CYCLE_THEME_LABELS = {
  techniek: 'Techniek',
  passing: 'Passing',
  tactiek: 'Tactiek',
  conditie: 'Conditie',
}

export function getCycleThemeLabel(themeOrWeek) {
  const theme = typeof themeOrWeek === 'number' ? getCycleTheme(themeOrWeek) : themeOrWeek
  return CYCLE_THEME_LABELS[theme] ?? theme
}

export function generateTraining({
  ageGroup,
  knvbLevel,
  playerCount,
  trainingType = 'gemengd',
  durationMin = 60,
  feedback = {},
  cycleWeek = 1,
  recentIds = [],
  presentPlayers = [],
}) {
  const balance = analyzePlayerBalance(presentPlayers)
  const cycleTheme = getCycleTheme(cycleWeek)
  const ctx = {
    feedback,
    cycleTheme,
    recentIds,
    needsAttackFocus: balance.needsAttackFocus,
    needsDefenceFocus: balance.needsDefenceFocus,
    focusPositions: presentPlayers.map(p => p.position),
  }

  const template = SESSION_TEMPLATES[trainingType] ?? SESSION_TEMPLATES.gemengd
  const usedIds = new Set()
  const blocks = []

  for (const block of template) {
    const targetMin = Math.round(durationMin * block.share)
    if (targetMin < 4) continue

    const pool = filterExercises({
      ageGroup,
      knvbLevel,
      playerCount,
      trainingType,
      category: block.category,
    })

    let remaining = targetMin
    while (remaining >= 5) {
      const ex = pickBest(pool, ctx, usedIds)
      if (!ex) break
      const dur = Math.min(ex.durationMin, remaining)
      blocks.push({ exercise: ex, durationMin: dur })
      usedIds.add(ex.id)
      remaining -= dur
      if (remaining < 5) break
    }
  }

  // Fill gap to reach target duration
  let total = blocks.reduce((s, b) => s + b.durationMin, 0)
  if (total < durationMin - 3) {
    const extraPool = filterExercises({ ageGroup, knvbLevel, playerCount, trainingType })
    while (total < durationMin - 3) {
      const ex = pickBest(extraPool, ctx, usedIds)
      if (!ex) break
      blocks.push({ exercise: ex, durationMin: ex.durationMin })
      usedIds.add(ex.id)
      total += ex.durationMin
    }
  }

  return {
    blocks,
    totalMin: blocks.reduce((s, b) => s + b.durationMin, 0),
    balance,
    cycleTheme,
    cycleWeek,
  }
}

export function searchExercises(filters) {
  return filterExercises(filters)
}

/** All exercises for manual browse — age group + level only (no type/player filter). */
export function browseExercises({ ageGroup, knvbLevel }) {
  return EXERCISES.filter(ex => {
    if (!ex.ageGroups.includes(ageGroup)) return false
    if (knvbLevel < ex.minKnvbLevel || knvbLevel > ex.maxKnvbLevel) return false
    return true
  })
}
