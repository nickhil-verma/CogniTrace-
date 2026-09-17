import { Memory } from '@/types/memory';

export const initialMockMemories: Memory[] = [
  {
    id: 'mem_1',
    title: 'Family Vacation in Goa',
    date: 'Summer 1987',
    location: 'Calangute Beach, Goa',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    description: 'Our first family beach vacation together. Mom loved watching the sunset over the sea and walking along the shoreline with ice cream.',
    people: ['Mom (Sunita)', 'Dad (Ramesh)', 'Rahul', 'Priya'],
    tags: ['Vacation', 'Beach', 'Family', '1980s'],
    reminiscencePrompt: 'Mom, do you remember our beach trip to Goa in 1987? You loved the sound of the ocean waves at sunset.'
  },
  {
    id: 'mem_2',
    title: 'Spring Garden & Rose Blossoms',
    date: 'March 2015',
    location: 'Home Garden, New Delhi',
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    description: 'Mom spent the entire morning planting yellow and red roses in her backyard garden. The blossoms bloomed beautifully for months.',
    people: ['Mom (Sunita)', 'Priya'],
    tags: ['Gardening', 'Flowers', 'Home', 'Spring'],
    reminiscencePrompt: 'Mom, remember how vibrant yellow roses bloomed in your home garden? You always cared for them every morning.'
  },
  {
    id: 'mem_3',
    title: 'Granddaughter Graduation Day',
    date: 'June 2021',
    location: 'University Auditorium',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    description: 'Mom smiled so brightly when Ananya walked across the stage to receive her engineering degree.',
    people: ['Mom (Sunita)', 'Ananya', 'Rahul'],
    tags: ['Graduation', 'Pride', 'Celebration'],
    reminiscencePrompt: 'Mom, look at Ananya in her graduation gown! You were so proud of her achievements.'
  },
  {
    id: 'mem_4',
    title: 'Traditional Festival Sweets Preparation',
    date: 'Diwali 2019',
    location: 'Family Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337cc?auto=format&fit=crop&w=800&q=80',
    description: 'Mom guiding everyone in making home-style kaju katli and besan ladoos. The aroma of cardamom filled the whole house.',
    people: ['Mom (Sunita)', 'Dad', 'Priya', 'Ananya'],
    tags: ['Diwali', 'Festival', 'Cooking', 'Traditions'],
    reminiscencePrompt: 'Mom, do you recall making cardamom sweets for Diwali? The kitchen smelled so delicious!'
  }
];
