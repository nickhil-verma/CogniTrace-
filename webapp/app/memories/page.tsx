'use client';

import React, { useState } from 'react';
import { MemoryCard } from '@/components/memories/MemoryCard';
import { ReminiscenceCard } from '@/components/memories/ReminiscenceCard';
import { useMemories } from '@/hooks/useMemories';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Memory } from '@/types/memory';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';

export default function MemoriesPage() {
  const router = useRouter();
  const { memories, setSelectedMemory, addMemory, deleteMemory } = useMemories();
  const { isCaregiver } = useUserRole();
  const { t } = useLanguage();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [reminisceActiveMemory, setReminisceActiveMemory] = useState<Memory | null>(null);

  React.useEffect(() => {
    if (memories.length > 0) {
      if (!reminisceActiveMemory || !memories.some((m) => m.id === reminisceActiveMemory.id)) {
        setReminisceActiveMemory(memories[0]);
      }
    } else {
      setReminisceActiveMemory(null);
    }
  }, [memories, reminisceActiveMemory]);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    const newMem = {
      title,
      date: date || 'Recent',
      location: location || 'Home',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      description,
      people: ['Mom', 'Caregiver'],
      tags: ['Family', 'Memory'],
      reminiscencePrompt: `Mom, do you remember when we enjoyed ${title}?`
    };
    addMemory(newMem);
    setIsUploadOpen(false);
    setTitle('');
    setDescription('');
    setImageUrl('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-[#F7DDE5] text-[#C85C82] text-xs font-bold">
              {t('memories.badge')}
            </span>
            <span className="text-xs text-[#66736F]">{t('memories.badgeSubtitle')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            {t('memories.title')}
          </h1>
        </div>
        <Button variant="default" onClick={() => setIsUploadOpen(true)} className="shadow-md">
          <Plus className="w-4 h-4 mr-2 text-white" />
          {t('memories.addNewMemory')}
        </Button>
      </div>

      {/* Reminiscence Feature Banner */}
      {reminisceActiveMemory && (
        <ReminiscenceCard
          memory={reminisceActiveMemory}
          onStartVoiceSession={(promptText) => {
            router.push(`/command-center?q=${encodeURIComponent(promptText)}`);
          }}
        />
      )}

      {/* Memory Gallery Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#123B35]">{t('memories.preservedCardsTitle')}</h3>
          <span className="text-xs text-[#66736F]">{t('memories.memoriesPreservedCount', { count: memories.length })}</span>
        </div>

        {memories.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-[#DDE7E3] rounded-3xl bg-white space-y-3">
            <p className="text-base font-bold text-[#123B35]">No photo memories preserved yet.</p>
            <p className="text-xs text-[#66736F]">Click "Add New Memory" above to upload your first family photo memory!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((mem) => (
              <MemoryCard
                key={mem.id}
                memory={mem}
                onSelect={(m) => setSelectedMemory(m)}
                onReminisce={(m) => setReminisceActiveMemory(m)}
                onDelete={isCaregiver ? (id) => deleteMemory(id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Memory Modal */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title={t('memories.modalTitle')}
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('memories.formTitle')}</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('memories.formTitlePlaceholder')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">{t('memories.formDate')}</label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder={t('memories.formDatePlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">{t('memories.formLocation')}</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('memories.formLocationPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('memories.formImageUrl')}</label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t('memories.formImageUrlPlaceholder')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('memories.formDescription')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('memories.formDescriptionPlaceholder')}
              rows={3}
              className="w-full rounded-2xl border border-[#DDE7E3] p-3 text-sm text-[#123B35] focus:outline-hidden focus:border-[#17665B]"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#DDE7E3]">
            <Button variant="outline" type="button" onClick={() => setIsUploadOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="default" type="submit">
              {t('memories.saveMemory')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
