// The problems inside one merged ticket, counted the desk's way: by cause (causes.ts), every report
// where it is filed. Reports the desk read as a one-day move (desk-notes.json) are not a day/month
// swap, so they also get a row of their own, footnoted under the cause they are filed under.
import { groupByCause, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = CauseGroup['cause'] | 'one-day';

export type ProblemGroup = Omit<CauseGroup, 'cause'> & { problem: Problem; filedUnder?: CauseGroup['cause'] };

export function problemsIn(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: number; rows: number; groups: ProblemGroup[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const causes = groupByCause(merged, tenantOf);
  const groups: ProblemGroup[] = causes.map(({ cause, ...g }) => ({ problem: cause, ...g }));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const [{ cause: _, ...g }] = groupByCause(moved, () => undefined);
    const filedUnder = causes.find((c) => c.reports.some((r) => r.id === moved[0].id))?.cause;
    groups.push({ problem: 'one-day', filedUnder, ...g });
  }
  return { merged: merged.length, rows: reports.filter((r) => r.mergedInto === ticket).length, groups };
}
