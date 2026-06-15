const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback } from 'react';

import { calculatePriority } from '@/lib/priority';
import { getXPForAction, checkNewBadges } from '@/lib/gamification';
import { isPast, isToday, isFuture, startOfDay, format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export function useStudyFlowData() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAll = useCallback(async () => {
    try {
      const [a, s, ss, p] = await Promise.all([
        db.entities.Assignment.list('-created_date', 500),
        db.entities.Subject.list(),
        db.entities.StudySession.list('-date', 200),
        db.entities.UserProgress.list(),
      ]);

      const withPriority = a.filter(x => x.status !== 'archived').map(item => {
        if (item.status === 'completed') return { ...item, priority_score: 0, priority_level: 'low' };
        const { score, level } = calculatePriority(item);
        return { ...item, priority_score: score, priority_level: level };
      });

      setAssignments(withPriority);
      setSubjects(s);
      setSessions(ss);
      setProgress(p[0] || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const ensureProgress = async () => {
    if (!progress) {
      const p = await db.entities.UserProgress.create({ xp: 0, level: 1, streak_days: 0, longest_streak: 0, total_assignments_completed: 0, total_study_minutes: 0, badges: [] });
      setProgress(p);
      return p;
    }
    return progress;
  };

  const addXP = async (action) => {
    const p = await ensureProgress();
    const xp = getXPForAction(action);
    const newXP = (p.xp || 0) + xp;
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastDate = p.last_activity_date;
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

    let newStreak = p.streak_days || 0;
    if (lastDate === yesterday) newStreak += 1;
    else if (lastDate !== today) newStreak = 1;

    let newLevel = p.level || 1;
    const { 0: _, ...levelThresholds } = { 0: 0, 1: 0, 2: 100, 3: 250, 4: 500, 5: 800, 6: 1200, 7: 1700, 8: 2300, 9: 3000, 10: 4000 };
    for (const [lvl, req] of Object.entries(levelThresholds)) {
      if (newXP >= req) newLevel = Math.max(newLevel, Number(lvl));
    }

    const updates = {
      xp: newXP,
      level: newLevel,
      streak_days: newStreak,
      longest_streak: Math.max(p.longest_streak || 0, newStreak),
      last_activity_date: today,
    };

    const updated = { ...p, ...updates };
    const newBadges = checkNewBadges(updated);
    if (newBadges.length > 0) {
      updates.badges = [...(p.badges || []), ...newBadges.map(b => b.id)];
      newBadges.forEach(b => {
        toast({ title: `🏆 Badge Earned: ${b.name}!`, description: b.description });
      });
    }

    await db.entities.UserProgress.update(p.id, updates);
    setProgress({ ...p, ...updates });
    return xp;
  };

  const createAssignment = async (data) => {
    const created = await db.entities.Assignment.create(data);
    const { score, level } = calculatePriority(created);
    const enriched = { ...created, priority_score: score, priority_level: level };
    setAssignments(prev => [enriched, ...prev]);
    return enriched;
  };

  const updateAssignment = async (id, data) => {
    await db.entities.Assignment.update(id, data);
    setAssignments(prev => prev.map(a => {
      if (a.id !== id) return a;
      const updated = { ...a, ...data };
      if (updated.status !== 'completed') {
        const { score, level } = calculatePriority(updated);
        return { ...updated, priority_score: score, priority_level: level };
      }
      return updated;
    }));
  };

  const completeAssignment = async (id) => {
    await db.entities.Assignment.update(id, { status: 'completed', completion_percentage: 100, completed_date: new Date().toISOString() });
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed', completion_percentage: 100, completed_date: new Date().toISOString(), priority_score: 0, priority_level: 'low' } : a));

    const p = await ensureProgress();
    const totalDone = (p.total_assignments_completed || 0) + 1;
    await db.entities.UserProgress.update(p.id, { total_assignments_completed: totalDone });
    setProgress(prev => ({ ...prev, total_assignments_completed: totalDone }));

    const assignment = assignments.find(a => a.id === id);
    if (assignment && isFuture(new Date(assignment.due_date))) {
      await addXP('complete_early');
    } else {
      await addXP('complete_assignment');
    }

    toast({ title: '✅ Assignment completed!', description: 'Great job!' });
  };

  const deleteAssignment = async (id) => {
    await db.entities.Assignment.delete(id);
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const todayTasks = assignments.filter(a => a.status !== 'completed' && isToday(new Date(a.due_date)));
  const overdueTasks = assignments.filter(a => a.status !== 'completed' && isPast(new Date(a.due_date)) && !isToday(new Date(a.due_date)));
  const upcomingTasks = assignments.filter(a => a.status !== 'completed' && isFuture(new Date(a.due_date)) && !isToday(new Date(a.due_date)));
  const completedTasks = assignments.filter(a => a.status === 'completed');
  const pendingTasks = assignments.filter(a => a.status !== 'completed');

  const sortedByPriority = [...pendingTasks].sort((a, b) => b.priority_score - a.priority_score);

  return {
    assignments, subjects, sessions, progress, loading,
    todayTasks, overdueTasks, upcomingTasks, completedTasks, pendingTasks, sortedByPriority,
    createAssignment, updateAssignment, completeAssignment, deleteAssignment,
    addXP, ensureProgress, loadAll,
    setSubjects, setSessions, setProgress,
  };
}