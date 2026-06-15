const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Plus, GraduationCap, BookOpen, CheckCircle2, Clock, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

import { useStudyFlowData } from '@/hooks/useStudyFlowData';
import EmptyState from '@/components/studyflow/EmptyState';

const PRESET_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6b7280', '#f97316'];
const SUBJECT_ICONS = ['📐', '🔬', '📖', '💻', '🌍', '🎨', '🎵', '🏃', '📊', '🧪', '📝', '🌐'];

export default function Subjects() {
  const { subjects, assignments, setSubjects, loading } = useStudyFlowData();
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#6366f1', icon: '📐', teacher_name: '' });

  const resetForm = () => setForm({ name: '', color: '#6366f1', icon: '📐', teacher_name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    if (editData) {
      await db.entities.Subject.update(editData.id, form);
      setSubjects(prev => prev.map(s => s.id === editData.id ? { ...s, ...form } : s));
    } else {
      const created = await db.entities.Subject.create(form);
      setSubjects(prev => [...prev, created]);
    }
    setFormOpen(false);
    setEditData(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    await db.entities.Subject.delete(id);
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const getSubjectStats = (subjectId) => {
    const subAssignments = assignments.filter(a => a.subject_id === subjectId);