export interface InterviewQuestion {
  id:
    | "name"
    | "location"
    | "art_type"
    | "journey"
    | "inspiration"
    | "techniques"
    | "cultural_stories"
    | "audience_feeling"
    | string;
  title: {
    en: string;
    ml: string;
  };
  placeholder: {
    en: string;
    ml: string;
  };
}

export interface InterviewAnswerRecord {
  id?: string;
  profile_id?: string;
  question_id: string;
  text: string;
  language: string;
  updated_at?: string;
}

export interface IdentitySectionData {
  displayName?: string;
  location?: string;
  intro: string;
  bio: string;
  journey: string;
  specialities: string[];
  inspiration: string;
}

export interface IdentityBuilderResponse {
  displayName?: string;
  location?: string;
  intro: string;
  bio: string;
  journey: string;
  specialities: string[];
  inspiration: string;
  missing: string[];
  unclear: string[];
  basedOn: Record<string, string[]>;
}
