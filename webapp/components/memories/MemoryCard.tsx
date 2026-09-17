'use client';

import React from 'react';
import { Memory } from '@/types/memory';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Mic, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MemoryCardProps {
  memory: Memory;
  onSelect?: (memory: Memory) => void;
  onReminisce?: (memory: Memory) => void;
}

export function MemoryCard({ memory, onSelect, onReminisce }: MemoryCardProps) {
  return (
    <div className="group rounded-3xl border border-[#DDE7E3] bg-white overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Photo Container */}
        <div className="relative h-48 w-full overflow-hidden bg-[#BFDCD6]/30">
          <img
            src={memory.imageUrl}
            alt={memory.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3">
            <Badge variant="teal" className="shadow-sm">
              {memory.date}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-[#123B35] leading-snug group-hover:text-[#17665B] transition-colors">
              {memory.title}
            </h4>
            <div className="flex items-center space-x-2 text-xs text-[#66736F]">
              <MapPin className="w-3.5 h-3.5 text-[#3E9C87]" />
              <span>{memory.location}</span>
            </div>
          </div>

          <p className="text-xs text-[#66736F] leading-relaxed line-clamp-2">
            "{memory.description}"
          </p>

          {memory.people && memory.people.length > 0 && (
            <div className="flex items-center space-x-1 text-xs text-[#66736F]">
              <Users className="w-3.5 h-3.5 text-[#17665B]" />
              <span className="truncate">{memory.people.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 pt-0 flex items-center justify-between border-t border-[#DDE7E3]/50">
        <div className="flex flex-wrap gap-1">
          {memory.tags.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-[10px] py-0.5">
              #{tag}
            </Badge>
          ))}
        </div>
        <Button
          variant="mint"
          size="sm"
          onClick={() => onReminisce?.(memory)}
          className="text-xs shadow-2xs font-semibold"
        >
          <Mic className="w-3.5 h-3.5 mr-1 text-[#17665B]" />
          Talk about it
        </Button>
      </div>
    </div>
  );
}
