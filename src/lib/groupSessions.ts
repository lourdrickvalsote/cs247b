import type { SessionWithActivity, StudyRound, RoundPair } from '../types/database';

const PROXIMITY_MS = 2 * 60 * 1000;

function pairSessions(members: SessionWithActivity[]): RoundPair[] {
  const sorted = [...members].sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  );

  const pairs: RoundPair[] = [];
  const used = new Set<string>();

  const workSessions = sorted.filter((s) => s.type === 'work');
  const breakSessions = sorted.filter((s) => s.type !== 'work');

  for (const w of workSessions) {
    used.add(w.id);
    const wEnd = w.ended_at ? new Date(w.ended_at).getTime() : new Date(w.started_at).getTime();

    let bestBreak: SessionWithActivity | null = null;
    let bestDist = Infinity;

    for (const b of breakSessions) {
      if (used.has(b.id)) continue;
      const bStart = new Date(b.started_at).getTime();
      const dist = bStart - wEnd;
      if (dist >= 0 && dist < PROXIMITY_MS && dist < bestDist) {
        bestBreak = b;
        bestDist = dist;
      }
    }

    if (bestBreak) used.add(bestBreak.id);
    pairs.push({ workSession: w, breakSession: bestBreak });
  }

  for (const b of breakSessions) {
    if (used.has(b.id)) continue;
    pairs.push({ workSession: null, breakSession: b });
  }

  pairs.sort(
    (a, b) =>
      new Date((a.workSession ?? a.breakSession!).started_at).getTime() -
      new Date((b.workSession ?? b.breakSession!).started_at).getTime(),
  );

  return pairs;
}

function buildStudyRound(id: string, pairs: RoundPair[]): StudyRound {
  const first = pairs[0].workSession ?? pairs[0].breakSession!;
  const lastPair = pairs[pairs.length - 1];
  const last = lastPair.breakSession ?? lastPair.workSession!;

  const totalWorkSeconds = pairs.reduce(
    (sum, p) => sum + (p.workSession?.actual_duration_seconds ?? 0),
    0,
  );
  const totalBreakSeconds = pairs.reduce(
    (sum, p) => sum + (p.breakSession?.actual_duration_seconds ?? 0),
    0,
  );

  return {
    id,
    rounds: pairs,
    startedAt: first.started_at,
    endedAt: last.ended_at ?? last.started_at,
    totalWorkSeconds,
    totalBreakSeconds,
    totalDurationSeconds: totalWorkSeconds + totalBreakSeconds,
  };
}

export function groupSessionsIntoRounds(sessions: SessionWithActivity[]): StudyRound[] {
  const withGroupId: SessionWithActivity[] = [];
  const withoutGroupId: SessionWithActivity[] = [];

  for (const s of sessions) {
    if (s.session_group_id) withGroupId.push(s);
    else withoutGroupId.push(s);
  }

  const result: StudyRound[] = [];

  // Group sessions by session_group_id
  const groupMap = new Map<string, SessionWithActivity[]>();
  for (const s of withGroupId) {
    const gid = s.session_group_id!;
    if (!groupMap.has(gid)) groupMap.set(gid, []);
    groupMap.get(gid)!.push(s);
  }

  for (const [gid, members] of groupMap) {
    const pairs = pairSessions(members);
    result.push(buildStudyRound(gid, pairs));
  }

  // Handle legacy sessions without group IDs using proximity matching
  const used = new Set<string>();
  const orphanWork = withoutGroupId.filter((s) => s.type === 'work');
  const orphanBreaks = withoutGroupId.filter((s) => s.type !== 'work');

  for (const w of orphanWork) {
    used.add(w.id);
    const wEnd = w.ended_at ? new Date(w.ended_at).getTime() : new Date(w.started_at).getTime();

    let bestBreak: SessionWithActivity | null = null;
    let bestDist = Infinity;

    for (const b of orphanBreaks) {
      if (used.has(b.id)) continue;
      const bStart = new Date(b.started_at).getTime();
      const dist = Math.abs(bStart - wEnd);
      if (dist < PROXIMITY_MS && dist < bestDist) {
        bestBreak = b;
        bestDist = dist;
      }
    }

    if (bestBreak) used.add(bestBreak.id);
    const pair: RoundPair = { workSession: w, breakSession: bestBreak };
    result.push(buildStudyRound(w.id, [pair]));
  }

  for (const b of orphanBreaks) {
    if (used.has(b.id)) continue;
    const pair: RoundPair = { workSession: null, breakSession: b };
    result.push(buildStudyRound(b.id, [pair]));
  }

  result.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  return result;
}
