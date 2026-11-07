export interface InterviewQuestion {
  id: "intro" | "mentor" | "experience" | "inspiration" | "special" | "techniques";
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
  intro: string;
  bio: string;
  journey: string;
  specialities: string[];
  inspiration: string;
}

export interface IdentityBuilderResponse {
  intro: string;
  bio: string;
  journey: string;
  specialities: string[];
  inspiration: string;
  missing: string[];
  unclear: string[];
  basedOn: Record<string, string[]>;
}

