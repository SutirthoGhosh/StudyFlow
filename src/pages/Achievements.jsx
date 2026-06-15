import React from 'react';
import { Trophy, Flame, Star, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useStudyFlowData } from '@/hooks/useStudyFlowData';
import { BADGES, getLevelInfo, LEVELS } from '@/lib/gamification';
import StatCard from '@/components/studyflow/StatCard';

export default function Achievements() {
  const { progress, loading } = useStudyFlowData();
  const xp = progress?.xp || 0;
  const levelInfo = getLevelInfo(xp);
  const earnedBadges = progress?.badges || [];

  if (loading) {
    return <div className="flex items-center justify-center py-32"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Achievements</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your progress and earn rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Star} label="Total XP" value={xp} gradient="gradient-primary" delay={0} />
        <StatCard icon={Trophy} label="Level" value={levelInfo.current.level} subtitle={levelInfo.current.title} gradient="gradient-warning" delay={0.05} />
        <StatCard icon={Flame} label="Streak" value={`${progress?.streak_days || 0}d`} subtitle={`Best: ${progress?.longest_streak || 0}d`} gradient="gradient-danger" delay={0.1} />
        <StatCard icon={Zap} label="Badges" value={earnedBadges.length} subtitle={`of ${BADGES.length}`} gradient="gradient-success" delay={0.15} />
      </div>

      {/* Level Progress */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display font-semibold mb-4">Level Progress</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
            <span className="text-2xl font-display font-bold text-white">{levelInfo.current.level}</span>
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-lg">{levelInfo.current.title}</p>
            <p className="text-sm text-muted-foreground">{xp} XP total</p>
          </div>