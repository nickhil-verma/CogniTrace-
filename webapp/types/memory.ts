export interface Memory {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  description: string;
  people: string[];
  tags: string[];
  reminiscencePrompt?: string;
  audioNoteUrl?: string;
}
