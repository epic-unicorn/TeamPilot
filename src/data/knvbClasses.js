/**
 * KNVB competition classes (lowest → highest).
 * Used for team settings and to derive training intensity/complexity.
 */
export const KNVB_CLASSES = [
  { id: '6e',          label: '6e klasse',   level: 1 },
  { id: '5e',          label: '5e klasse',   level: 2 },
  { id: '4e',          label: '4e klasse',   level: 3 },
  { id: '3e',          label: '3e klasse',   level: 4 },
  { id: '2e',          label: '2e klasse',   level: 5 },
  { id: '1e',          label: '1e klasse',   level: 6 },
  { id: 'hoofdklasse', label: 'Hoofdklasse', level: 7 },
]

export const DEFAULT_KNVB_CLASS = '5e'

const byId = Object.fromEntries(KNVB_CLASSES.map(c => [c.id, c]))

export function getKnvbClass(id) {
  return byId[id] ?? byId[DEFAULT_KNVB_CLASS]
}

/** Numeric level 1 (6e) – 7 (hoofdklasse) for training engine use. */
export function getKnvbLevel(id) {
  return getKnvbClass(id).level
}
