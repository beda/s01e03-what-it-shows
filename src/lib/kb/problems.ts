// The problems inside one merged ticket: the cause causes.ts finds, except reports the desk read as a
// one-day move (desk-notes.json). Those are not a day/month swap at all, so they get their own row.
import { groupByCause, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = CauseGroup['cause'] | 'one-day';

export type ProblemGroup = Omit<CauseGroup, 'cause'> & { problem: Problem };

export function problemsIn(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: number; rows: number; groups: ProblemGroup[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  const swapped = merged.filter((r) => !oneDayMove.includes(r.id));
  const groups: ProblemGroup[] = groupByCause(swapped, tenantOf).map(({ cause, ...g }) => ({ problem: cause, ...g }));
  if (moved.length) {
    const [g] = groupByCause(moved, () => undefined);
    const { cause: _, ...rest } = g;
    groups.push({ problem: 'one-day', ...rest });
  }
  return {
    merged: merged.length,
    rows: reports.filter((r) => r.mergedInto === ticket).length,
    groups: groups.sort((a, b) => b.reports.length - a.reports.length),
  };
}
