import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';

const emptyForm = {
  title: '', subject_id: '', description: '', due_date: '', difficulty: 'medium',
  estimated_hours: 1, teacher_name: '', notes: '', type: 'homework', completion_percentage: 0,
};

export default function AssignmentForm({ open, onOpenChange, onSubmit, subjects, editData }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        ...emptyForm,
        ...editData,
        due_date: editData.due_date ? format(new Date(editData.due_date), "yyyy-MM-dd'T'HH:mm") : '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editData, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.due_date) return;
    setSaving(true);
    await onSubmit({ ...form, due_date: new Date(form.due_date).toISOString() });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{editData ? 'Edit Assignment' : 'New Assignment'}</DialogTitle>