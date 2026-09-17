'use client';

import { useState, useCallback } from 'react';
import { Memory } from '@/types/memory';
import { initialMockMemories } from '@/lib/mock/memories';

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>(initialMockMemories);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const addMemory = useCallback((newMem: Omit<Memory, 'id'>) => {
    const item: Memory = {
      ...newMem,
      id: `mem_${Date.now()}`
    };
    setMemories((prev) => [item, ...prev]);
  }, []);

  return {
    memories,
    selectedMemory,
    setSelectedMemory,
    addMemory
  };
}
