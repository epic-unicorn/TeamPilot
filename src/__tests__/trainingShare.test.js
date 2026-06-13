import { describe, it, expect } from 'vitest'
import { syncCycleWeek, getIsoWeekKey } from '../utils/cycleWeek'
import { encodeTrainingSession, decodeTrainingSession } from '../utils/trainingShare'
import { EXERCISES } from '../data/exercises'
import { buildCustomExercise } from '../utils/customExercises'

describe('cycleWeek', () => {
  it('returns stable cycle week within the same ISO week', () => {
    const state = { cycleWeek: 2, cycleIsoWeek: getIsoWeekKey() }
    expect(syncCycleWeek(state)).toBe(2)
    expect(syncCycleWeek(state)).toBe(2)
  })

  it('advances cycle week when ISO week changes', () => {
    const state = { cycleWeek: 2, cycleIsoWeek: '2020-W01' }
    expect(syncCycleWeek(state)).toBe(3)
    expect(state.cycleIsoWeek).toBe(getIsoWeekKey())
  })

  it('wraps from week 4 to week 1', () => {
    const state = { cycleWeek: 4, cycleIsoWeek: '2020-W01' }
    expect(syncCycleWeek(state)).toBe(1)
  })
})

describe('trainingShare', () => {
  const sample = {
    teamName: 'FC Test',
    ageGroup: 'JO11',
    knvbClass: '5e',
    trainingType: 'gemengd',
    durationMin: 60,
    playerCount: 10,
    cycleWeek: 2,
    blocks: [{ exercise: EXERCISES[0], durationMin: 10 }],
  }

  it('round-trips encode and decode', () => {
    const encoded = encodeTrainingSession(sample)
    const decoded = decodeTrainingSession(encoded)
    expect(decoded.teamName).toBe('FC Test')
    expect(decoded.blocks).toEqual([{ exerciseId: EXERCISES[0].id, durationMin: 10 }])
    expect(decoded.cycleWeek).toBe(2)
  })

  it('returns null for invalid payload', () => {
    expect(decodeTrainingSession('invalid')).toBeNull()
  })

  it('embeds custom exercises in share payload', () => {
    const custom = buildCustomExercise({
      id: 'custom-share-1',
      title: 'Eigen passing',
      description: 'Passen en bewegen',
      setup: 'Rond vierkant',
      rules: ['Twee aanrakingen', 'Wissel na goal'],
    })
    const encoded = encodeTrainingSession({
      ...sample,
      blocks: [
        { exercise: custom, durationMin: 12 },
        { exercise: EXERCISES[0], durationMin: 10 },
      ],
    })
    const decoded = decodeTrainingSession(encoded)
    expect(decoded.blocks).toEqual([
      { exerciseId: 'custom-share-1', durationMin: 12 },
      { exerciseId: EXERCISES[0].id, durationMin: 10 },
    ])
    expect(decoded.customExercises).toHaveLength(1)
    expect(decoded.customExercises[0].title).toBe('Eigen passing')
    expect(decoded.customExercises[0].rules).toEqual(['Twee aanrakingen', 'Wissel na goal'])
  })
})
