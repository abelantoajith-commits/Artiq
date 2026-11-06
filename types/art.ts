export interface Artist {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  location: string;
  avatar_url: string;
  journey?: string;
  specialities: string[];
  preferred_language?: string;
}

export interface Artwork {
  id: string;
  artist_id: string;
  artist: Artist;
  title: string;
  description: string;
  caption?: string;
  image_url: string;
  width: number;
  height: number;
  art_form: string;
  technique?: string;
  materials?: string;
  story: string;
  categories: string[];
  hashtags: string[];
  keywords?: string[];
  status: "draft" | "published";
  likes_count?: number;
  saves_count?: number;
  created_at: string;
}

export type CategoryKey =
  | "all"
  | "traditional"
  | "kerala-mural"
  | "textiles"
  | "handicrafts"
  | "sculpture"
  | "modern"
  | "digital";
