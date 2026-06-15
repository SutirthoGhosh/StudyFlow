import React from 'react';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { CheckCircle2, Clock, GraduationCap, MoreHorizontal, Trash2, Edit, Archive, ChevronRight } from 'lucide-react';
import { PRIORITY_COLORS, DIFFICULTY_CONFIG, STATUS_CONFIG } from '@/lib/priority';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

function getDueDateLabel(date) {
  const d = new Date(date);
  if (isToday(d)) return { text: 'Due today', urgent: true };
  if (isTomorrow(d)) return { text: 'Due tomorrow', urgent: false };
  if (isPast(d)) return { text: `Overdue by ${formatDistanceToNow(d)}`, urgent: true };
  return { text: `Due ${formatDistanceToNow(d, { addSuffix: true })}`, urgent: false };
}

export default function AssignmentCard({ assignment, subject, onComplete, onEdit, onDelete, onClick }) {
  const priorityColor = PRIORITY_COLORS[assignment.priority_level] || PRIORITY_COLORS.medium;
  const diffConfig = DIFFICULTY_CONFIG[assignment.difficulty] || DIFFICULTY_CONFIG.medium;
  const dueInfo = getDueDateLabel(assignment.due_date);
  const isCompleted = assignment.status === 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`group bg-card border border-border rounded-2xl p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer ${isCompleted ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); if (!isCompleted) onComplete?.(assignment.id); }}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500'
              : `border-muted-foreground/30 hover:border-primary hover:bg-primary/10`
          }`}
        >
          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">