// helpers for converting sec <-> mm:ss
export function secToMMSS(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function totalDurationSecFromSteps(steps: { durationMinutes: number }[]) {
  return steps.reduce((acc, s) => acc + s.durationMinutes * 60, 0);
}
