'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Sparkles, Clock, Trash2, Search } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  time: string;
  date: string;
  mood?: string;
  category?: string;
}

const STORAGE_KEY = 'cognitrace_journal_v1';

const initialEntries: JournalEntry[] = [
  {
    id: 'j_1',
    title: 'Went to the neighborhood park',
    content: 'Mom seemed happier today. She recognized the old neighborhood bench where we used to sit and pointed out the bougainvillea flowers.',
    time: '5:42 PM',
    date: 'Today',
    mood: 'Joyful',
    category: 'Mood & Activity'
  },
  {
    id: 'j_2',
    title: 'Dr. Sharma Neurologist Consultation',
    content: 'Appointment completed smoothly. Dr. Sharma noted her cognitive vitals are stable. Next check-in scheduled for next month.',
    time: '11:30 AM',
    date: 'Yesterday',
    mood: 'Calm',
    category: 'Medical'
  },
  {
    id: 'j_3',
    title: 'Evening Photo Reminiscence Session',
    content: 'Looked through the 1987 Goa vacation photos together. Mom sang an old Konkani lullaby she remembered from her childhood.',
    time: '8:15 PM',
    date: '2 Days Ago',
    mood: 'Reflective',
    category: 'Memory & Speech'
  }
];

export default function JournalPage() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Calm');
  const [category, setCategory] = useState('Mood & Activity');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setEntries(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load journal entries', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoaded]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    const item: JournalEntry = {
      id: `j_${Date.now()}`,
      title,
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      mood,
      category
    };
    setEntries([item, ...entries]);
    setIsAddOpen(false);
    setTitle('');
    setContent('');
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((item) => item.id !== id));
  };

  const handleSummarizeWeek = () => {
    setIsSummarizing(true);
    setTimeout(() => {
      setAiSummary(t('journal.aiSummaryGenerated'));
      setIsSummarizing(false);
    }, 1200);
  };

  const filteredEntries = entries.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <Badge variant="pink">{t('journal.badge')}</Badge>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            {t('journal.title')}
          </h1>
          <p className="text-sm text-[#66736F]">
            {t('journal.subtitle')}
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
            {isSummarizing ? t('journal.summarizing') : t('journal.summarizeAi')}
          </Button>
          <Button variant="default" onClick={() => setIsAddOpen(true)} className="shadow-md">
            <Plus className="w-4 h-4 mr-2 text-white" />
            {t('journal.newEntry')}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#66736F]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('journal.searchPlaceholder')}
          className="pl-10"
        />
      </div>

      {/* AI Weekly Summary Card */}
      {aiSummary && (
        <Card className="bg-[#BFDCD6]/30 border-[#BFDCD6] p-5 space-y-2">
          <div className="flex items-center space-x-2 text-[#17665B] font-bold text-sm">
            <Sparkles className="w-5 h-5" />
            <span>{t('journal.aiSummaryTitle')}</span>
          </div>
          <p className="text-sm text-[#123B35] leading-relaxed">{aiSummary}</p>
        </Card>
      )}

      {/* Journal List */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="p-6 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-bold text-[#123B35]">{entry.title}</h4>
                  {entry.category && <Badge variant="teal">{entry.category}</Badge>}
                </div>
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
              &ldquo;{entry.content}&rdquo;
            </p>
          </Card>
        ))}
      </div>

      {/* New Entry Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={t('journal.modalTitle')}
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('journal.formTitle')}</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('journal.formTitlePlaceholder')}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">{t('journal.formMood')}</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full h-11 rounded-2xl border border-[#DDE7E3] px-3 text-sm text-[#123B35]"
              >
                <option value="Joyful">Joyful</option>
                <option value="Calm">Calm</option>
                <option value="Reflective">Reflective</option>
                <option value="Confused">Confused</option>
                <option value="Restless">Restless</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">{t('journal.formCategory')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 rounded-2xl border border-[#DDE7E3] px-3 text-sm text-[#123B35]"
              >
                <option value="Mood & Activity">{t('journal.catMoodActivity')}</option>
                <option value="Medical">{t('journal.catMedical')}</option>
                <option value="Memory & Speech">{t('journal.catMemorySpeech')}</option>
                <option value="Daily Routine">{t('journal.catRoutine')}</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('journal.formContent')}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('journal.formContentPlaceholder')}
              className="w-full h-28 rounded-2xl border border-[#DDE7E3] p-3 text-xs text-[#123B35] focus:border-[#17665B] focus:outline-hidden"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#DDE7E3]">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="default" type="submit">
              {t('journal.saveEntry')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
