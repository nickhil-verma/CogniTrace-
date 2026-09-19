'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

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
  const { t } = useLanguage();

  const filteredArticles = selectedCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === selectedCategory);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'All': return t('resources.catAll');
      case 'Communication': return t('resources.catCommunication');
      case 'Daily care': return t('resources.catDailyCare');
      case 'Memory': return t('resources.catMemory');
      case 'Appointments': return t('resources.catAppointments');
      case 'Safety': return t('resources.catSafety');
      case 'Caregiver support': return t('resources.catCaregiverSupport');
      default: return cat;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <Badge variant="teal">{t('resources.badge')}</Badge>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            {t('resources.title')}
          </h1>
          <p className="text-sm text-[#66736F]">
            {t('resources.subtitle')}
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#17665B] text-white shadow-xs'
                : 'bg-white border border-[#DDE7E3] text-[#66736F] hover:bg-[#F5F8F6] hover:text-[#123B35]'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="flex flex-col justify-between hover:border-[#17665B]/30 transition-all group">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="teal" className="text-[10px]">
                  {getCategoryLabel(article.category)}
                </Badge>
                <div className="flex items-center space-x-1 text-xs text-[#66736F]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.readTime}</span>
                </div>
              </div>
              <CardTitle className="text-lg font-bold text-[#123B35] group-hover:text-[#17665B] transition-colors leading-snug">
                {article.title}
              </CardTitle>
              <CardDescription className="text-xs text-[#66736F] leading-relaxed">
                {article.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between border-t border-[#DDE7E3]/60 pt-3 text-xs text-[#66736F]">
                <span>By {article.author}</span>
                <span className="font-semibold text-[#17665B] flex items-center group-hover:translate-x-0.5 transition-transform">
                  <BookOpen className="w-3.5 h-3.5 mr-1" />
                  Guide
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
