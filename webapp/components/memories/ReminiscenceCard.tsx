'use client';

import React, { useState } from 'react';
import { Memory } from '@/types/memory';
import { Button } from '@/components/ui/button';
import { Mic, Sparkles, MapPin, Volume2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ReminiscenceCardProps {
  memory: Memory;
  onStartVoiceSession?: (prompt: string) => void;
}

export function ReminiscenceCard({ memory, onStartVoiceSession }: ReminiscenceCardProps) {
  const [promptText, setPromptText] = useState(
    memory.reminiscencePrompt || `Mom, do you remember our trip to ${memory.location}?`
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateNewPrompt = async () => {
    setIsGenerating(true);
    try {
      const res = await api.getReminiscencePrompt(memory.id, memory.description);
      if (res && res.prompt) {
        setPromptText(res.prompt);
      }
    } catch (e) {
      console.warn('Reminiscence prompt generation fallback.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#DDE7E3] bg-gradient-to-br from-white via-[#F5F8F6] to-white p-6 shadow-md space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-[#F7DDE5] text-[#C85C82]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#123B35]">Memory Moment</h4>
            <p className="text-xs text-[#66736F]">Reminiscence Conversation Mode</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerateNewPrompt}
          disabled={isGenerating}
          className="text-xs text-[#17665B]"
        >
          {isGenerating ? 'Generating prompt...' : 'New Prompt'}
        </Button>
      </div>

      <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-[#DDE7E3] bg-[#BFDCD6]/30">
        <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#123B35]/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
          <span className="text-xs font-semibold text-[#BFDCD6]">{memory.date}</span>
          <h3 className="text-xl font-bold">{memory.title}</h3>
          <p className="text-xs text-white/80 flex items-center mt-1">
            <MapPin className="w-3.5 h-3.5 mr-1 text-[#BFDCD6]" />
            {memory.location}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 border border-[#DDE7E3] space-y-3">
        <p className="text-sm font-semibold text-[#123B35] leading-relaxed">
          "{promptText}"
        </p>

        <Button
          variant="teal"
          size="lg"
          className="w-full shadow-md py-3 text-sm font-bold flex items-center justify-center space-x-2"
          onClick={() => onStartVoiceSession?.(promptText)}
        >
          <Mic className="w-5 h-5 text-white" />
          <span>🎙 Talk about it with Mom</span>
        </Button>
      </div>
    </div>
  );
}
