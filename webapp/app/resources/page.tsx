'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Heart, Shield, MessageCircle, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Communication',
  'Daily care',
  'Memory',
  'Appointments',
  'Safety',
  'Caregiver support'
];

const ARTICLES = [
  {
    id: 'art_1',
    title: 'Communicating with Pacing & Warmth in Middle-Stage Care',
    description: 'Practical strategies for gentle verbal cues, active listening, and supporting sentence formation without pressure.',
    category: 'Communication',
    readTime: '4 min read',
    author: 'Dr. Anita Sharma'
  },
  {
    id: 'art_2',
    title: 'Creating a Peaceful Evening Routine to Reduce Sundowning',
    description: 'How dim lighting, soft acoustic music, and consistent 8:00 PM routine cues foster peaceful sleep.',
    category: 'Daily care',
    readTime: '5 min read',
    author: 'CogniTrace Care Team'
  },
  {
    id: 'art_3',
    title: 'The Power of Photo Reminiscence in Preserving Identity',
    description: 'Using old family photographs, favorite songs, and familiar recipes to spark comforting long-term recall.',
    category: 'Memory',
    readTime: '6 min read',
    author: 'Geriatric Care Institute'
  },
  {
    id: 'art_4',
    title: 'Preparing for Neurologist Consultations & Memory Vitals',
    description: 'A caregiver guide on logging daily observed changes and asking targeted questions during routine clinical check-ups.',
    category: 'Appointments',
    readTime: '3 min read',
    author: 'City Care Health'
  },
  {
    id: 'art_5',
    title: 'Home Safety Checklist & Environmental Adjustments',
    description: 'Simple non-intrusive modifications for bathroom grab bars, non-slip rugs, and nightlight placement.',
    category: 'Safety',
    readTime: '4 min read',
    author: 'Safety Advisory Board'
  },
  {
    id: 'art_6',
    title: 'Preventing Caregiver Fatigue & Protecting Your Emotional Well-Being',
    description: 'Essential self-care routines, respite support options, and remembering that caring for yourself is caring for your loved one.',
    category: 'Caregiver support',
    readTime: '5 min read',
    author: 'Caregiver Alliance'
  }
];

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredArticles = selectedCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === selectedCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <Badge variant="teal">Caregiver Library</Badge>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            Practical Care Resources
          </h1>
          <p className="text-sm text-[#66736F]">
            Editorial guidance on communication, daily routines, and caregiver self-care.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              selectedCategory === cat
                ? 'bg-[#17665B] text-white shadow-sm'
                : 'bg-white border border-[#DDE7E3] text-[#66736F] hover:bg-[#F5F8F6] hover:text-[#123B35]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((art) => (
          <Card key={art.id} className="flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="default">{art.category}</Badge>
                <span className="text-[10px] text-[#66736F] flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {art.readTime}
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-[#123B35] leading-snug">
                {art.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-[#66736F] leading-relaxed">
                {art.description}
              </p>
              <div className="pt-3 border-t border-[#DDE7E3] flex items-center justify-between text-xs font-semibold text-[#17665B]">
                <span>By {art.author}</span>
                <span className="hover:underline cursor-pointer">Read Guide →</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
