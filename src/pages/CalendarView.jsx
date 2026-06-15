import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyFlowData } from '@/hooks/useStudyFlowData';
import AssignmentForm from '@/components/studyflow/AssignmentForm';
import { PRIORITY_COLORS } from '@/lib/priority';

export default function CalendarView() {
  const { assignments, subjects, sessions, createAssignment, updateAssignment, loading } = useStudyFlowData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const getEventsForDay = (day) => {
    const dayAssignments = assignments.filter(a => isSameDay(new Date(a.due_date), day));
    const daySessions = sessions.filter(s => isSameDay(new Date(s.date), day));
    return { assignments: dayAssignments, sessions: daySessions };
  };

  const selectedEvents = getEventsForDay(selectedDate);

  if (loading) {
    return <div className="flex items-center justify-center py-32"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Calendar</h1>