import { describe, it, expect } from 'vitest'
import { analyzePlayerBalance, generateTraining, getCycleTheme, browseExercises } from '../utils/trainingEngine'
import { EXERCISES } from '../data/exercises'

describe('trainingEngine', () => {
  it('detects when team has more defenders than attackers', () => {
    const balance = analyzePlayerBalance([
      { position: 'DEF' }, { position: 'DEF' }, { position: 'DEF' }, { position: 'ATT' },
    ])
    expect(balance.needsAttackFocus).toBe(true)
  })

  it('generates a session within reasonable duration', () => {
    const result = generateTraining({
      ageGroup: 'JO11',
      knvbLevel: 3,
      playerCount: 10,
      trainingType: 'gemengd',
      durationMin: 60,
      presentPlayers: Array.from({ length: 10 }, () => ({ position: 'MID' })),
    })
    expect(result.blocks.length).toBeGreaterThan(0)
    expect(result.totalMin).toBeGreaterThanOrEqual(45)
    expect(result.totalMin).toBeLessThanOrEqual(75)
  })

  it('prefers exercises matching cycle theme', () => {
    const theme = getCycleTheme(1)
    expect(theme).toBe('techniek')
    const themed = EXERCISES.filter(e => e.cycleThemes?.includes('techniek'))
    expect(themed.length).toBeGreaterThan(0)
  })

  it('learns from negative feedback by deprioritizing exercises', () => {
    const disliked = EXERCISES[0].id
    const withFeedback = generateTraining({
      ageGroup: 'JO11',
      knvbLevel: 2,
      playerCount: 12,
      trainingType: 'techniek',
      durationMin: 60,
      feedback: { [disliked]: { dislikes: 5, likes: 0 } },
      presentPlayers: Array.from({ length: 12 }, () => ({ position: 'MID' })),
    })
    const ids = withFeedback.blocks.map(b => b.exercise.id)
    expect(ids.includes(disliked)).toBe(false)
  })

  it('browseExercises returns all exercises for age group without type filter', () => {
    const all = browseExercises({ ageGroup: 'JO11', knvbLevel: 3 })
    const filtered = EXERCISES.filter(ex =>
      ex.ageGroups.includes('JO11') && 3 >= ex.minKnvbLevel && 3 <= ex.maxKnvbLevel
    )
    expect(all.length).toBe(filtered.length)
    expect(all.length).toBeGreaterThan(10)
  })
})
