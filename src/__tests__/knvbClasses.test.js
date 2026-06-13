import { describe, it, expect } from 'vitest'
import {
  KNVB_CLASSES,
  DEFAULT_KNVB_CLASS,
  getKnvbClass,
  getKnvbLevel,
} from '../data/knvbClasses'

describe('knvbClasses', () => {
  it('lists classes from 6e through hoofdklasse in ascending order', () => {
    expect(KNVB_CLASSES.map(c => c.id)).toEqual([
      '6e', '5e', '4e', '3e', '2e', '1e', 'hoofdklasse',
    ])
  })

  it('assigns increasing levels from 6e (1) to hoofdklasse (7)', () => {
    expect(getKnvbLevel('6e')).toBe(1)
    expect(getKnvbLevel('1e')).toBe(6)
    expect(getKnvbLevel('hoofdklasse')).toBe(7)
  })

  it('falls back to default class for unknown ids', () => {
    expect(getKnvbClass('invalid').id).toBe(DEFAULT_KNVB_CLASS)
    expect(getKnvbLevel('invalid')).toBe(getKnvbLevel(DEFAULT_KNVB_CLASS))
  })
})
