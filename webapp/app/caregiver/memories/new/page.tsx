'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Image as ImageIcon, Heart, Calendar, MapPin, Users, Tag, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useMemories } from '@/hooks/useMemories';
import { useLanguage } from '@/hooks/useLanguage';

const PRESET_PHOTOS = [
  { label: 'Beach Sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Spring Garden', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80' },
  { label: 'Graduation', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80' },
  { label: 'Festival Sweets', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
];

export default function CaregiverNewMemoryPage() {
  const router = useRouter();
  const { addMemory } = useMemories();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [narrative, setNarrative] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0].url);
  const [peopleInput, setPeopleInput] = useState('Mom, Caregiver');
  const [relationshipInput, setRelationshipInput] = useState('Daughter, Mother');
  const [tagsInput, setTagsInput] = useState('Family, Celebration');
  const [reminiscencePrompt, setReminiscencePrompt] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !narrative) return;
    setLoading(true);

    const people = peopleInput.split(',').map((p) => p.trim()).filter(Boolean);
    const relationshipCues = relationshipInput.split(',').map((r) => r.trim()).filter(Boolean);
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const finalPhoto = imageUrl || PRESET_PHOTOS[0].url;

    const payload = {
      patient_id: 'patient_001',
      title,
      narrative,
      description: narrative,
      photo_url: finalPhoto,
      imageUrl: finalPhoto,
      date: date || 'Recent Memory',
      location: location || 'Home',
      people,
      relationship_cues: relationshipCues,
      tags,
      reminiscence_prompt: reminiscencePrompt || `Mom, do you remember this special moment from '${title}'?`,
      reminiscencePrompt: reminiscencePrompt || `Mom, do you remember this special moment from '${title}'?`
    };

    try {
      await addMemory(payload as any);
      setSuccess(true);
      setTimeout(() => {
        router.push('/memories');
      }, 1200);
    } catch (err) {
      console.warn('Memory vector ingestion error:', err);
      router.push('/memories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Navigation Back Bar */}
      <div className="flex items-center justify-between border-b border-[#DDE7E3] pb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#17665B] hover:text-[#123B35] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Memory Album</span>
        </button>
        <Badge variant="accent" className="flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-[#17665B]" />
          <span>Vector Embedding Engine</span>
        </Badge>
      </div>

      {/* Main Ingestion Form Card */}
      <Card className="border border-[#DDE7E3] bg-white rounded-3xl shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#164E48] to-[#17665B] text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Heart className="w-6 h-6 text-[#C8ECE4] fill-current" />
            </div>
            <div>
              <CardTitle className="text-xl font-extrabold text-white">
                Caregiver Memory Ingestion Portal
              </CardTitle>
              <p className="text-xs text-[#C8ECE4] mt-1 font-medium">
                Preserve life stories & photo archival records encoded into vector embeddings (`text-embedding-004`).
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {success && (
            <div className="p-4 rounded-2xl bg-[#E8F4F1] border border-[#BFDCD6] text-[#164E48] font-bold text-sm flex items-center space-x-3 animate-in zoom-in-95">
              <Check className="w-5 h-5 text-[#164E48]" />
              <span>Memory successfully encoded into vector database! Redirecting to album...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#123B35] flex items-center space-x-1">
                  <ImageIcon className="w-3.5 h-3.5 text-[#17665B]" />
                  <span>Memory Title *</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Family Vacation in Goa, Granddaughter Graduation"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#123B35] flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#3E9C87]" />
                  <span>Historical Date</span>
                </label>
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Summer 1987, March 2015"
                />
              </div>
            </div>

            {/* Location & Reminiscence Cue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#123B35] flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C85C82]" />
                  <span>Location</span>
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Calangute Beach, Goa"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#123B35] flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#E7A23B]" />
                  <span>Reminiscence Question Cue</span>
                </label>
                <Input
                  value={reminiscencePrompt}
                  onChange={(e) => setReminiscencePrompt(e.target.value)}
                  placeholder="e.g. Mom, do you remember who walked along the beach with you?"
                />
              </div>
            </div>

            {/* Narrative / Life Story Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#123B35]">
                Life Story Narrative & Contextual Profile *
              </label>
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Describe the memory in vivid detail. This text will be encoded into 768-dimensional vector embeddings to help the AI Voice Companion trigger positive reminiscence therapy."
                rows={4}
                className="w-full rounded-2xl border border-[#DDE7E3] p-3 text-sm text-[#123B35] focus:outline-hidden focus:border-[#17665B]"
                required
              />
            </div>

            {/* Archival Photo Selection & Preview */}
            <div className="space-y-3 pt-2 border-t border-[#DDE7E3]">
              <label className="text-xs font-bold text-[#123B35] flex items-center justify-between">
                <span>Archival Photo Image URL</span>
                <span className="text-[11px] text-[#66736F] font-normal">Select preset or paste image URL</span>
              </label>

              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />

              {/* Preset Thumbnails */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESET_PHOTOS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all h-20 text-left group cursor-pointer ${
                      imageUrl === preset.url ? 'border-[#164E48] ring-2 ring-[#164E48]/30' : 'border-[#DDE7E3] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1.5">
                      <span className="text-[10px] font-bold text-white truncate">{preset.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Image Preview */}
              {imageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-[#DDE7E3] max-h-48">
                  <img src={imageUrl} alt="Selected Archival Memory" className="w-full h-48 object-cover" />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
                    Photo Preview
                  </div>
                </div>
              )}
            </div>

            {/* People & Relationship Cues */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#DDE7E3]">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#123B35] flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-[#17665B]" />
                  <span>Tagged People</span>
                </label>
                <Input
                  value={peopleInput}
                  onChange={(e) => setPeopleInput(e.target.value)}
                  placeholder="Mom, Dad, Priya"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#123B35] flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 text-[#C85C82]" />
                  <span>Relationship Cues</span>
                </label>
                <Input
                  value={relationshipInput}
                  onChange={(e) => setRelationshipInput(e.target.value)}
                  placeholder="Daughter, Mother, Husband"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#123B35] flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-[#3E9C87]" />
                  <span>Category Tags</span>
                </label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Vacation, Diwali, Family"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-[#DDE7E3]">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#164E48] hover:bg-[#113e39] text-white font-bold shadow-lg rounded-2xl"
              >
                {loading ? 'Encoding Vector Story...' : 'Ingest Memory & Compute Vectors'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
