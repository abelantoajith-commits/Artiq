export interface Artist {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  location: string;
  avatar_url: string;
  phone?: string;
  email?: string;
  address?: string;
  journey?: string;
  inspiration?: string;
  intro?: string;
  specialities: string[];
  preferred_language?: string;
  is_demo?: boolean;
}

export interface Artwork {
  id: string;
  artist_id: string;
  artist: Artist;
  title: string;
  description: string; // Unified "About this artwork"
  caption?: string;
  image_url: string;
  width: number;
  height: number;
  categories: string[];
  hashtags: string[];
  keywords?: string[];
  status: "draft" | "published";
  likes_count?: number;
  saves_count?: number;
  created_at: string;
  ai_generated_fields?: Record<string, unknown>;
}

export type CategoryKey = string;
