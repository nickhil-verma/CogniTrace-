'use client';

import React, { useState } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Bell, Plus, CheckCircle2, Clock, Trash2, Pill, Calendar } from 'lucide-react';
import { ReminderCategory } from '@/types/reminder';

export default function RemindersPage() {
  const { reminders, addReminder, toggleComplete, deleteReminder } = useReminders();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New reminder form
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('8:00 PM');
  const [date, setDate] = useState('Today');
  const [category, setCategory] = useState<ReminderCategory>('Medication');
  const [dosage, setDosage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    addReminder({
      title,
      time,
      date,
      category,
      status: 'Upcoming',
      patientName: 'Mom',
      dosageOrDetails: dosage || 'Take with water after meals',
      recurring: 'Daily'
    });
    setIsAddOpen(false);
    setTitle('');
    setDosage('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <Badge variant="teal">Daily Care Schedule</Badge>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            Medication & Routine Reminders
          </h1>
          <p className="text-sm text-[#66736F]">
            Backend Contract: POST /v1/caretaker/reminders
          </p>
        </div>
        <Button variant="default" onClick={() => setIsAddOpen(true)} className="shadow-md">
          <Plus className="w-4 h-4 mr-2 text-white" />
          Create Reminder
        </Button>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#66736F] border border-dashed border-[#DDE7E3] rounded-3xl bg-white space-y-2">
            <Bell className="w-8 h-8 text-[#17665B] mx-auto opacity-40" />
            <p className="font-bold text-[#123B35]">No Reminders Found</p>
            <p className="text-xs text-[#66736F]">Create a new care reminder or ask the AI Voice Assistant to schedule one for you.</p>
          </div>
        ) : (
          reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                rem.status === 'Completed'
                  ? 'bg-[#F5F8F6] border-[#DDE7E3] opacity-75'
                  : 'bg-white border-[#DDE7E3] shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-3 rounded-2xl ${
                    rem.category === 'Medication'
                      ? 'bg-[#17665B]/10 text-[#17665B]'
                      : rem.category === 'Doctor Check-in'
                      ? 'bg-[#3E9C87]/10 text-[#3E9C87]'
                      : 'bg-[#C85C82]/10 text-[#C85C82]'
                  }`}
                >
                  {rem.category === 'Medication' ? (
                    <Pill className="w-6 h-6" />
                  ) : (
                    <Bell className="w-6 h-6" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4
                      className={`text-base font-bold ${
                        rem.status === 'Completed'
                          ? 'line-through text-[#66736F]'
                          : 'text-[#123B35]'
                      }`}
                    >
                      {rem.title}
                    </h4>
                    <Badge
                      variant={
                        rem.status === 'Completed'
                          ? 'accent'
                          : rem.status === 'Missed'
                          ? 'warning'
                          : 'teal'
                      }
                    >
                      {rem.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-[#66736F]">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-[#17665B]" />
                      {rem.time} ({rem.date})
                    </span>
                    {rem.recurring && <span>• {rem.recurring}</span>}
                  </div>
                  {rem.dosageOrDetails && (
                    <p className="text-xs text-[#66736F] pt-0.5">{rem.dosageOrDetails}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <Button
                  variant={rem.status === 'Completed' ? 'outline' : 'mint'}
                  size="sm"
                  onClick={() => toggleComplete(rem.id)}
                  className="text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  {rem.status === 'Completed' ? 'Mark Pending' : 'Complete'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteReminder(rem.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Reminder Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Care Reminder"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Reminder Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Donepezil 10mg tablet"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">Time</label>
              <Input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="8:00 PM"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReminderCategory)}
                className="w-full h-11 rounded-2xl border border-[#DDE7E3] px-3 text-sm text-[#123B35]"
              >
                <option value="Medication">Medication</option>
                <option value="Doctor Check-in">Doctor Check-in</option>
                <option value="Cognitive Exercise">Cognitive Exercise</option>
                <option value="Daily Routine">Daily Routine</option>
                <option value="Family Call">Family Call</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Dosage / Instructions</label>
            <Input
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 1 tablet after dinner with glass of water"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#DDE7E3]">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" type="submit">
              Save Reminder
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
