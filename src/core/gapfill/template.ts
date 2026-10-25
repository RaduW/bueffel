// Splitting a task's template into text and gaps, and helpers for writing hints

export type Segment =
  | { kind: 'text'; text: string }
  // index: position of the gap in the task's gaps; hint: the text in the braces
  | { kind: 'gap'; index: number; hint: string }

export function parseTemplate(template: string): Segment[] {
  const segments: Segment[] = [];
  let index = 0;
  let last = 0;
  for (const m of template.matchAll(/\{([^{}]*)\}/g)) {
    if (m.index > last) segments.push({ kind: 'text', text: template.slice(last, m.index) });
    segments.push({ kind: 'gap', index: index++, hint: m[1] });
    last = m.index + m[0].length;
  }
  if (last < template.length) segments.push({ kind: 'text', text: template.slice(last) });
  return segments;
}

// A hint that rules out none of the options: what they all start with, then "__".
// der/die/das/den/dem/des -> "d__", alt/alte/alten … -> "alt__"
export function hintFor(options: string[]): string {
  let prefix = options[0] ?? '';
  for (const o of options) {
    while (!o.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix + '__';
}

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
