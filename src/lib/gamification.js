export const LEVELS = [
  { level: 1, title: 'Freshman', xpRequired: 0 },
  { level: 2, title: 'Sophomore', xpRequired: 100 },
  { level: 3, title: 'Junior', xpRequired: 250 },
  { level: 4, title: 'Senior', xpRequired: 500 },
  { level: 5, title: 'Scholar', xpRequired: 800 },
  { level: 6, title: 'Honor Student', xpRequired: 1200 },
  { level: 7, title: 'Dean\'s List', xpRequired: 1700 },
  { level: 8, title: 'Valedictorian', xpRequired: 2300 },
  { level: 9, title: 'Graduate', xpRequired: 3000 },
  { level: 10, title: 'Expert', xpRequired: 4000 },
  { level: 15, title: 'Professor', xpRequired: 7500 },
  { level: 20, title: 'Sage', xpRequired: 12000 },
  { level: 25, title: 'Master', xpRequired: 18000 },
];

export const BADGES = [
  { id: 'first_assignment', name: 'First Step', description: 'Complete your first assignment', icon: '🎯', condition: (p) => p.total_assignments_completed >= 1 },
  { id: 'five_done', name: 'Getting Started', description: 'Complete 5 assignments', icon: '⭐', condition: (p) => p.total_assignments_completed >= 5 },
  { id: 'twenty_done', name: 'Homework Hero', description: 'Complete 20 assignments', icon: '🦸', condition: (p) => p.total_assignments_completed >= 20 },
  { id: 'fifty_done', name: 'Assignment Ace', description: 'Complete 50 assignments', icon: '🏆', condition: (p) => p.total_assignments_completed >= 50 },
  { id: 'streak_7', name: '7-Day Streak', description: 'Maintain a 7-day activity streak', icon: '🔥', condition: (p) => p.longest_streak >= 7 },
  { id: 'streak_30', name: '30-Day Streak', description: 'Maintain a 30-day activity streak', icon: '💎', condition: (p) => p.longest_streak >= 30 },
  { id: 'study_10h', name: 'Studious', description: 'Study for 10 total hours', icon: '📚', condition: (p) => p.total_study_minutes >= 600 },
  { id: 'study_50h', name: 'Bookworm', description: 'Study for 50 total hours', icon: '🐛', condition: (p) => p.total_study_minutes >= 3000 },
  { id: 'level_5', name: 'Scholar Badge', description: 'Reach level 5', icon: '🎓', condition: (p) => p.level >= 5 },
  { id: 'level_10', name: 'Expert Badge', description: 'Reach level 10', icon: '👑', condition: (p) => p.level >= 10 },
  { id: 'deadline_slayer', name: 'Deadline Slayer', description: 'Complete 10 tasks before their deadline', icon: '⚔️', condition: (p) => p.total_assignments_completed >= 10 },
];

export function getLevelInfo(xp) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }
  const xpInLevel = xp - current.xpRequired;
  const xpForNext = next ? next.xpRequired - current.xpRequired : 0;
  const progress = next ? xpInLevel / xpForNext : 1;
  return { current, next, xpInLevel, xpForNext, progress };
}

export function getXPForAction(action) {
  const xpMap = {
    complete_assignment: 25,
    complete_early: 40,
    complete_hard: 35,
    study_session: 10,
    streak_bonus: 5,
    pomodoro_complete: 8,
  };
  return xpMap[action] || 10;
}

export function checkNewBadges(progress) {
  const earned = progress.badges || [];
  return BADGES.filter(b => !earned.includes(b.id) && b.condition(progress));
}