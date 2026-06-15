import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, BookOpen, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { useStudyFlowData } from '@/hooks/useStudyFlowData';
import AssignmentCard from '@/components/studyflow/AssignmentCard';
import AssignmentForm from '@/components/studyflow/AssignmentForm';
import EmptyState from '@/components/studyflow/EmptyState';

export default function Assignments() {
  const { assignments, subjects, createAssignment, updateAssignment, completeAssignment, deleteAssignment, loading } = useStudyFlowData();
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let items = [...assignments];

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.teacher_name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') items = items.filter(a => a.status === statusFilter);
    if (subjectFilter !== 'all') items = items.filter(a => a.subject_id === subjectFilter);
    if (priorityFilter !== 'all') items = items.filter(a => a.priority_level === priorityFilter);

    if (sortBy === 'priority') items.sort((a, b) => b.priority_score - a.priority_score);
    else if (sortBy === 'due_date') items.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    else if (sortBy === 'created') items.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    else if (sortBy === 'difficulty') {
      const order = { hard: 3, medium: 2, easy: 1 };
      items.sort((a, b) => (order[b.difficulty] || 0) - (order[a.difficulty] || 0));
    }

    return items;
  }, [assignments, search, statusFilter, subjectFilter, priorityFilter, sortBy]);

  if (loading) {
    return <div className="flex items-center justify-center py-32"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Assignments</h1>
          <p className="text-sm text-muted-foreground mt-1">{assignments.length} total assignments</p>
        </div>
        <Button onClick={() => { setEditData(null); setFormOpen(true); }} className="gradient-primary text-white shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-1.5" /> Add
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Sort" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="due_date">Due Date</SelectItem>
                    <SelectItem value="created">Recently Added</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({assignments.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map(a => (
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
        <EmptyState
          icon={BookOpen}
          title="No assignments found"
          description={search || statusFilter !== 'all' ? "Try adjusting your filters" : "Add your first assignment to get started"}
          action={!search && statusFilter === 'all' && (
            <Button onClick={() => { setEditData(null); setFormOpen(true); }} className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-1.5" /> Add Assignment
            </Button>
          )}
        />
      )}

      <AssignmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        subjects={subjects}
        editData={editData}
        onSubmit={async (data) => {
          if (editData) await updateAssignment(editData.id, data);
          else await createAssignment(data);
        }}
      />
    </div>
  );
}