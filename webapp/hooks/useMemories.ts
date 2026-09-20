'use client';

import { useState, useEffect, useCallback } from 'react';
import { Memory } from '@/types/memory';
import { initialMockMemories } from '@/lib/mock/memories';
import { api } from '@/lib/api';

const STORAGE_KEY = 'cognitrace_memories_v1';

function mergeMemories(...sources: Memory[][]): Memory[] {
  const merged = new Map<string, Memory>();
  for (const source of sources) {
    for (const memory of source) {
      merged.set(memory.id, memory);
    }
  }
  return Array.from(merged.values());
}

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>(initialMockMemories);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadMemories() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        let savedMemories: Memory[] = [];
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            savedMemories = parsed;
          }
        }

        const apiData = await api.getMemories('patient_001');
        const backendMemories = Array.isArray(apiData) ? apiData : [];
        const mergedMemories = mergeMemories(initialMockMemories, savedMemories, backendMemories);
        setMemories(mergedMemories);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedMemories));
      } catch {
        console.warn('Backend memories fetch warning.');
      } finally {
        setIsLoaded(true);
      }
    }
    loadMemories();
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    }
  }, [memories, isLoaded]);

  const addMemory = useCallback(async (newMem: Omit<Memory, 'id'>) => {
    const item: Memory = {
      ...newMem,
      id: `mem_${Date.now()}`
    };
    setMemories((prev) => [item, ...prev]);

    try {
      await api.createMemory(item);
    } catch (e) {
      console.warn('API create memory warning:', e);
    }
  }, []);

  const deleteMemory = useCallback(async (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    if (selectedMemory?.id === id) {
      setSelectedMemory(null);
    }
    try {
      await api.deleteMemory(id);
    } catch (e) {
      console.warn('API delete memory warning:', e);
    }
  }, [selectedMemory]);

  const generateReminiscencePrompt = useCallback(async (memoryId: string, description: string) => {
    try {
      const res = await api.getReminiscencePrompt(memoryId, description);
      return res.prompt;
    } catch {
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
