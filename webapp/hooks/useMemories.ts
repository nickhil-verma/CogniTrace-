'use client';

import { useState, useEffect, useCallback } from 'react';
import { Memory } from '@/types/memory';
import { initialMockMemories } from '@/lib/mock/memories';
import { api } from '@/lib/api';

const STORAGE_KEY = 'cognitrace_memories_v1';

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>(initialMockMemories);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMemories(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse saved memories', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    }
  }, [memories, isLoaded]);

  const addMemory = useCallback((newMem: Omit<Memory, 'id'>) => {
    const item: Memory = {
      ...newMem,
      id: `mem_${Date.now()}`
    };
    setMemories((prev) => [item, ...prev]);
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    if (selectedMemory?.id === id) {
      setSelectedMemory(null);
    }
  }, [selectedMemory]);

  const generateReminiscencePrompt = useCallback(async (memoryId: string, description: string) => {
    try {
      const res = await api.getReminiscencePrompt(memoryId, description);
      return res.prompt;
    } catch (err) {
      return `Mom, do you remember this special moment from "${description}"? Tell me what you remember about that day.`;
    }
  }, []);

  return {
    memories,
    selectedMemory,
    setSelectedMemory,
    addMemory,
    deleteMemory,
    generateReminiscencePrompt,
    isLoaded
  };
}
