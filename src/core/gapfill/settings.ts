// Reading an exercise's setting values against its definitions

import type { SettingDef, SettingValues } from './types.ts'

export function defaultValues(defs: SettingDef[] = []): SettingValues {
  return Object.fromEntries(defs.map(d => [d.id, d.default]));
}

// The selected options of a 'multi' setting, leaving out unknown ones (e.g.
// saved by an older version); the default if nothing valid is left
export function multiValue(defs: SettingDef[], values: SettingValues, id: string): string[] {
  const def = defs.find(d => d.id === id);
  if (def?.type !== 'multi') return [];
  const v = values[id];
  const valid = Array.isArray(v) ? v.filter(x => def.options.some(o => o.id === x)) : [];
  return valid.length ? valid : def.default;
}

// The chosen option of a 'choice' setting, or its default
export function choiceValue(defs: SettingDef[], values: SettingValues, id: string): string {
  const def = defs.find(d => d.id === id);
  if (def?.type !== 'choice') return '';
  const v = values[id];
  return typeof v === 'string' && def.options.some(o => o.id === v) ? v : def.default;
}

// The first 'multi' setting with nothing selected, as a message; null if none
export function emptySelection(defs: SettingDef[] = [], values: SettingValues): string | null {
  for (const d of defs) {
    const v = values[d.id];
    if (d.type === 'multi' && (!Array.isArray(v) || !v.length)) return `Select at least one option under ${d.label}.`;
  }
  return null;
}
