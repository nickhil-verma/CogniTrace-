'use client';

import React, { useState } from 'react';
import { MemoryCard } from '@/components/memories/MemoryCard';
import { ReminiscenceCard } from '@/components/memories/ReminiscenceCard';
import { useMemories } from '@/hooks/useMemories';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Memory } from '@/types/memory';
import { Image as ImageIcon, Plus, Sparkles, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MemoriesPage() {
  const router = useRouter();
  const { memories, selectedMemory, setSelectedMemory, addMemory } = useMemories();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [reminisceActiveMemory, setReminisceActiveMemory] = useState<Memory>(memories[0]);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    addMemory({
      title,
      date: date || 'Recent',
      location: location || 'Home',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      description,
      people: ['Mom', 'Caregiver'],
      tags: ['Family', 'Memory'],
      reminiscencePrompt: `Mom, do you remember when we enjoyed ${title}?`
    });
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
              Memory Vault
            </span>
            <span className="text-xs text-[#66736F]">Preserve moments & trigger conversation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            Family Photo Memories & Reminiscence
          </h1>
        </div>
        <Button variant="default" onClick={() => setIsUploadOpen(true)} className="shadow-md">
          <Plus className="w-4 h-4 mr-2 text-white" />
          Add New Memory
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
          <h3 className="text-xl font-bold text-[#123B35]">Preserved Memory Cards</h3>
          <span className="text-xs text-[#66736F]">{memories.length} memories preserved</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((mem) => (
            <MemoryCard
              key={mem.id}
              memory={mem}
              onSelect={(m) => setSelectedMemory(m)}
              onReminisce={(m) => setReminisceActiveMemory(m)}
            />
          ))}
        </div>
      </div>

      {/* Upload Memory Modal */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Add Preserved Family Memory"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Memory Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Beach Picnic in Goa"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">Year / Date</label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Summer 1987"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Goa Beach"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Story / Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What made this memory special for Mom?"
              className="w-full h-24 rounded-2xl border border-[#DDE7E3] p-3 text-xs text-[#123B35] focus:border-[#17665B] focus:outline-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Image URL (or mock photo)</label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#DDE7E3]">
            <Button variant="outline" type="button" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" type="submit">
              Save Memory
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
