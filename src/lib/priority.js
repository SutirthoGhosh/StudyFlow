import { differenceInHours, isPast, isToday } from 'date-fns';

export function calculatePriority(assignment) {
  const now = new Date();
  const due = new Date(assignment.due_date);
  const hoursRemaining = differenceInHours(due, now);
  const daysRemaining = hoursRemaining / 24;

  // Urgency: 0-10 scale (higher = more urgent)
  let urgency;
  if (isPast(due) && !isToday(due)) urgency = 10;
  else if (daysRemaining <= 0.5) urgency = 9.5;
  else if (daysRemaining <= 1) urgency = 9;
  else if (daysRemaining <= 2) urgency = 8;
  else if (daysRemaining <= 3) urgency = 7;
  else if (daysRemaining <= 5) urgency = 5;
  else if (daysRemaining <= 7) urgency = 3;
  else if (daysRemaining <= 14) urgency = 2;
  else urgency = 1;

  // Difficulty: 0-10 scale
  const difficultyMap = { easy: 3, medium: 6, hard: 9 };
  const difficulty = difficultyMap[assignment.difficulty] || 6;

  // Estimated time factor: 0-10 scale (more time needed = higher)
  const estHours = assignment.estimated_hours || 1;
  const timeFactor = Math.min(estHours / 5 * 10, 10);

  // Completion discount
  const completionDiscount = (assignment.completion_percentage || 0) / 100;

  const rawScore = (urgency * 0.5) + (difficulty * 0.3) + (timeFactor * 0.2);
  const score = rawScore * (1 - completionDiscount * 0.5);

  let level;
  if (score >= 7.5) level = 'critical';
  else if (score >= 5.5) level = 'high';
  else if (score >= 3.5) level = 'medium';
  else level = 'low';

  return { score: Math.round(score * 10) / 10, level };
}

export const PRIORITY_COLORS = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20', dot: 'bg-red-500' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20', dot: 'bg-orange-500' },
  medium: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
};

export const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-500/10' },
  hard: { label: 'Hard', color: 'text-red-600', bg: 'bg-red-500/10' },
};

export const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-muted-foreground', bg: 'bg-muted' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  completed: { label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  archived: { label: 'Archived', color: 'text-muted-foreground', bg: 'bg-muted' },
};