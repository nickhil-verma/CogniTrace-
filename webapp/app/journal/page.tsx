'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FileEdit, Plus, Sparkles, Clock, Trash2, CheckCircle2 } from 'lucide-react';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  time: string;
  date: string;
  mood?: string;
}

const initialEntries: JournalEntry[] = [
  {
    id: 'j_1',
    title: 'Went to the neighborhood park',
    content: 'Mom seemed happier today. She recognized the old neighborhood bench where we used to sit and pointed out the bougainvillea flowers.',
    time: '5:42 PM',
    date: 'Today',
    mood: 'Joyful'
  },
  {
    id: 'j_2',
    title: 'Dr. Sharma Neurologist Consultation',
    content: 'Appointment completed smoothly. Dr. Sharma noted her cognitive vitals are stable. Next check-in scheduled for next month.',
    time: '11:30 AM',
    date: 'Yesterday',
    mood: 'Calm'
  },
  {
    id: 'j_3',
    title: 'Evening Photo Reminiscence Session',
    content: 'Looked through the 1987 Goa vacation photos together. Mom sang an old Konkani lullaby she remembered from her childhood.',
    time: '8:15 PM',
    date: '2 Days Ago',
    mood: 'Reflective'
  }
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    const item: JournalEntry = {
      id: `j_${Date.now()}`,
      title,
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      mood: 'Calm'
    };
    setEntries([item, ...entries]);
    setIsAddOpen(false);
    setTitle('');
    setContent('');
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const handleSummarizeWeek = () => {
    setIsSummarizing(true);
    setTimeout(() => {
      setAiSummary(
        'AI Weekly Summary: Caretaker logged 3 reflective observations. Mom exhibited joyful mood during park walks and Goa photo reminiscence sessions. Cognitive vitals remain stable following Dr. Sharma’s consultation.'
      );
      setIsSummarizing(false);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <Badge variant="pink">Caregiver Journal</Badge>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            Reflective Care Journal
          </h1>
          <p className="text-sm text-[#66736F]">
            Record daily thoughts, emotional moments, and caregiver notes.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="mint"
            onClick={handleSummarizeWeek}
            disabled={isSummarizing}
            className="shadow-xs font-semibold text-xs"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-[#17665B]" />
            {isSummarizing ? 'Analyzing...' : 'Summarize my week'}
          </Button>
          <Button variant="default" onClick={() => setIsAddOpen(true)} className="shadow-md">
            <Plus className="w-4 h-4 mr-2 text-white" />
            New Entry
          </Button>
        </div>
      </div>

      {/* AI Weekly Summary Card */}
      {aiSummary && (
        <Card className="bg-[#BFDCD6]/30 border-[#BFDCD6] p-5 space-y-2">
          <div className="flex items-center space-x-2 text-[#17665B] font-bold text-sm">
            <Sparkles className="w-5 h-5" />
            <span>CogniTrace AI Weekly Digest</span>
          </div>
          <p className="text-sm text-[#123B35] leading-relaxed">{aiSummary}</p>
        </Card>
      )}

      {/* Journal List */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="p-6 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-bold text-[#123B35]">{entry.title}</h4>
                <div className="flex items-center space-x-2 text-xs text-[#66736F] mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[#17665B]" />
                  <span>{entry.date} at {entry.time}</span>
                  {entry.mood && (
                    <Badge variant="pink" className="ml-2 py-0 text-[10px]">
                      Mood: {entry.mood}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(entry.id)}
                className="text-red-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-[#123B35] leading-relaxed bg-[#F5F8F6] p-4 rounded-2xl border border-[#DDE7E3]">
              "{entry.content}"
            </p>
          </Card>
        ))}
      </div>

      {/* New Entry Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="New Journal Entry"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Title / Event</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Afternoon garden walk"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Reflective Notes</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe Mom’s mood, recognized memories, or care thoughts..."
              className="w-full h-28 rounded-2xl border border-[#DDE7E3] p-3 text-xs text-[#123B35] focus:border-[#17665B] focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#DDE7E3]">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" type="submit">
              Save Entry
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
