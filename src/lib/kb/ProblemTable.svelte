<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsIn, type Problem } from '#lib/kb/problems';

  // What each problem is, and where its ticket lives: problem → { what, href, label }.
  let { ticket, tickets }: { ticket: number; tickets: Record<Problem, { what: string; href: string; label: string }> } =
    $props();

  const result = $derived(problemsIn(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const total = $derived(result.groups.reduce((n, g) => n + g.reports.length, 0));
</script>

<p class="sum">
  <strong>{result.merged}</strong> reports merged into #{ticket} ({result.rows} rows in the export; a repeated id counts once) ·
  <strong>{result.groups.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each result.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code><br /><span class="what">{tickets[g.problem]?.what}</span></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if tickets[g.problem]}<a href={tickets[g.problem].href}>{tickets[g.problem].label}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr><td>total</td><td><strong>{total}</strong></td><td colspan="3">{total === result.merged ? 'every report placed once' : `${result.merged - total} not placed`}</td></tr>
  </tfoot>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .what { color: var(--muted); font-size: 0.85em; }
  tfoot td { font-weight: 600; }
</style>
