import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { format, subDays, isSameDay, startOfWeek, addDays } from 'date-fns';
import { motion } from 'framer-motion';
import { useStudyFlowData } from '@/hooks/useStudyFlowData';
import StatCard from '@/components/studyflow/StatCard';

const CHART_COLORS = [' hsl(250,84%,54%)', ' hsl(262,83%,58%)', ' hsl(174,72%,46%)', ' hsl(38,92%,50%)', ' hsl(0,84%,60%)', ' hsl(210,70%,50%)', ' hsl(300,60%,50%)'];

export default function Analytics() {
  const { assignments, subjects, sessions, progress, loading } = useStudyFlowData();

  const completedCount = assignments.filter(a => a.status === 'completed').length;
  const pendingCount = assignments.filter(a => a.status !== 'completed').length;
  const totalStudyHours = Math.round((progress?.total_study_minutes || 0) / 60 * 10) / 10;
  const avgCompletion = assignments.length > 0
    ? Math.round(assignments.reduce((s, a) => s + (a.completion_percentage || 0), 0) / assignments.length)
    : 0;

  const subjectWorkload = useMemo(() => {
    return subjects.map(s => ({
      name: s.name,
      color: s.color,
      count: assignments.filter(a => a.subject_id === s.id).length,
      completed: assignments.filter(a => a.subject_id === s.id && a.status === 'completed').length,
    })).filter(s => s.count > 0);
  }, [assignments, subjects]);

  const weeklyProductivity = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const completed = assignments.filter(a => a.completed_date && isSameDay(new Date(a.completed_date), day)).length;
      const studied = sessions.filter(s => isSameDay(new Date(s.date), day)).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      return { day: format(day, 'EEE'), completed, studyMinutes: studied };
    });
  }, [assignments, sessions]);

  const completionTrend = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const day = subDays(new Date(), 13 - i);
      const total = assignments.filter(a => new Date(a.created_date) <= day).length;
      const done = assignments.filter(a => a.completed_date && new Date(a.completed_date) <= day).length;
      const rate = total > 0 ? Math.round((done / total) * 100) : 0;
      return { day: format(day, 'MMM d'), rate };