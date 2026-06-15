import React, { useState, useMemo } from 'react';
import { BookOpen, Clock, AlertTriangle, CheckCircle2, Flame, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyFlowData } from '@/hooks/useStudyFlowData';
import StatCard from '@/components/studyflow/StatCard';
import AssignmentCard from '@/components/studyflow/AssignmentCard';
import AssignmentForm from '@/components/studyflow/AssignmentForm';
import EmptyState from '@/components/studyflow/EmptyState';
import { PRIORITY_COLORS } from '@/lib/priority';
import { getLevelInfo } from '@/lib/gamification';

export default function Dashboard() {
  const {
    assignments, subjects, progress, loading,
    todayTasks, overdueTasks, upcomingTasks, completedTasks, sortedByPriority,
    createAssignment, completeAssignment, deleteAssignment, updateAssignment,
  } = useStudyFlowData();
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const totalActive = assignments.filter(a => a.status !== 'completed').length;
  const completionRate = assignments.length > 0 ? Math.round((completedTasks.length / assignments.length) * 100) : 0;
  const levelInfo = progress ? getLevelInfo(progress.xp || 0) : getLevelInfo(0);

  const weeklyData = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(start, i);
      const due = assignments.filter(a => isSameDay(new Date(a.due_date), day)).length;
      const done = assignments.filter(a => a.completed_date && isSameDay(new Date(a.completed_date), day)).length;
      return { day: format(day, 'EEE'), due, done };
    });
  }, [assignments]);

  const priorityBreakdown = useMemo(() => {
    const active = assignments.filter(a => a.status !== 'completed');
    return {
      critical: active.filter(a => a.priority_level === 'critical').length,
      high: active.filter(a => a.priority_level === 'high').length,
      medium: active.filter(a => a.priority_level === 'medium').length,
      low: active.filter(a => a.priority_level === 'low').length,
    };
  }, [assignments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d')} &middot; {totalActive} active task{totalActive !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { setEditData(null); setFormOpen(true); }} className="gradient-primary text-white shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-1.5" /> Add Task
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} label="Active" value={totalActive} subtitle="assignments" gradient="gradient-primary" delay={0} />
        <StatCard icon={AlertTriangle} label="Overdue" value={overdueTasks.length} subtitle="need attention" gradient="gradient-danger" delay={0.05} />
        <StatCard icon={CheckCircle2} label="Completed" value={completionRate + '%'} subtitle={`${completedTasks.length} done`} gradient="gradient-success" delay={0.1} />
        <StatCard icon={Flame} label="Streak" value={`${progress?.streak_days || 0}d`} subtitle={`Level ${levelInfo.current.level}`} gradient="gradient-warning" delay={0.15} />
      </div>

      {/* XP Progress */}
      {progress && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎓</span>
              <span className="font-display font-semibold text-sm">{levelInfo.current.title}</span>
              <span className="text-xs text-muted-foreground">Lvl {levelInfo.current.level}</span>
            </div>
            <span className="text-xs text-muted-foreground">{progress.xp || 0} XP</span>
          </div>
          <Progress value={levelInfo.progress * 100} className="h-2" />
          {levelInfo.next && (
            <p className="text-[10px] text-muted-foreground mt-1.5">{levelInfo.xpForNext - levelInfo.xpInLevel} XP to {levelInfo.next.title}</p>
          )}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-sm text-destructive mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Overdue ({overdueTasks.length})
              </h2>
              <div className="space-y-2">
                <AnimatePresence>
                  {overdueTasks.slice(0, 3).map(a => (
                    <AssignmentCard
                      key={a.id}
                      assignment={a}
                      subject={subjects.find(s => s.id === a.subject_id)}
                      onComplete={completeAssignment}
                      onEdit={(a) => { setEditData(a); setFormOpen(true); }}
                      onDelete={deleteAssignment}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Today */}
          <div>
            <h2 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Due Today ({todayTasks.length})
            </h2>
            {todayTasks.length > 0 ? (
              <div className="space-y-2">
                <AnimatePresence>
                  {todayTasks.map(a => (
                    <AssignmentCard
                      key={a.id}
                      assignment={a}
                      subject={subjects.find(s => s.id === a.subject_id)}
                      onComplete={completeAssignment}
                      onEdit={(a) => { setEditData(a); setFormOpen(true); }}
                      onDelete={deleteAssignment}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-6 text-center">
                <p className="text-sm text-muted-foreground">No tasks due today 🎉</p>
              </div>
            )}
          </div>

          {/* Top Priority */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Top Priority
              </h2>
              <Link to="/assignments" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {sortedByPriority.slice(0, 5).map(a => (
                  <AssignmentCard
                    key={a.id}
                    assignment={a}
                    subject={subjects.find(s => s.id === a.subject_id)}
                    onComplete={completeAssignment}
                    onEdit={(a) => { setEditData(a); setFormOpen(true); }}
                    onDelete={deleteAssignment}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weekly Chart */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-display font-semibold text-sm mb-4">Weekly Workload</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }} />
                  <Bar dataKey="due" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Due" />
                  <Bar dataKey="done" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Done" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Priority Breakdown */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-display font-semibold text-sm mb-3">Priority Breakdown</h3>
            <div className="space-y-2.5">
              {Object.entries(priorityBreakdown).map(([level, count]) => {
                const colors = PRIORITY_COLORS[level];
                const total = Object.values(priorityBreakdown).reduce((s, v) => s + v, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <span className="capitalize font-medium">{level}</span>
                      </div>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors.dot}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Upcoming */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-display font-semibold text-sm mb-3">Upcoming</h3>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-2">
                {upcomingTasks.slice(0, 4).map(a => (
                  <div key={a.id} className="flex items-center gap-2.5 py-1.5">
                    <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[a.priority_level]?.dot || 'bg-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(a.due_date), 'MMM d')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming tasks</p>
            )}
          </motion.div>
        </div>
      </div>

      <AssignmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        subjects={subjects}
        editData={editData}
        onSubmit={async (data) => {
          if (editData) {
            await updateAssignment(editData.id, data);
          } else {
            await createAssignment(data);
          }
        }}
      />
    </div>
  );
}