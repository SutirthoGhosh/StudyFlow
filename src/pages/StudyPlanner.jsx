import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Plus, Timer, Coffee, Brain, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

import { useStudyFlowData } from '@/hooks/useStudyFlowData';
import StatCard from '@/components/studyflow/StatCard';
import EmptyState from '@/components/studyflow/EmptyState';
import { format } from 'date-fns';

const POMODORO_WORK = 25 * 60;
const POMODORO_BREAK = 5 * 60;

export default function StudyPlanner() {
  const { subjects, sessions, addXP, ensureProgress, progress, setProgress, loading } = useStudyFlowData();
  const [timeLeft, setTimeLeft] = useState(POMODORO_WORK);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({ title: '', subject_id: '', duration_minutes: 25, type: 'pomodoro' });
  const intervalRef = useRef(null);

  const totalDuration = isBreak ? POMODORO_BREAK : POMODORO_WORK;
  const progressPct = ((totalDuration - timeLeft) / totalDuration) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current);
      if (!isBreak) {
        setPomodoroCount(c => c + 1);
        handlePomodoroComplete();
        setIsBreak(true);
        setTimeLeft(POMODORO_BREAK);
      } else {
        setIsBreak(false);
        setTimeLeft(POMODORO_WORK);
        setIsRunning(false);