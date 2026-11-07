-- ARTIQ: Demo Login, Empty Profile Onboarding, and AI Identity Interview Migration

-- 1. Extend profiles table with inspiration, intro, and demo flag
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS inspiration TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS intro TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- 2. Create profile_interview_answers table for step-by-step auto-save
CREATE TABLE IF NOT EXISTS public.profile_interview_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'en',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_profile_question UNIQUE (profile_id, question_id)
);

-- Index for speedy retrieval by profile
CREATE INDEX IF NOT EXISTS idx_interview_answers_profile ON public.profile_interview_answers(profile_id);

-- 3. Enable RLS on profile_interview_answers
ALTER TABLE public.profile_interview_answers ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: strictly owner-only
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_interview_answers' AND policyname = 'Users can view their own interview answers'
  ) THEN
    CREATE POLICY "Users can view their own interview answers"
      ON public.profile_interview_answers FOR SELECT
      USING (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_interview_answers' AND policyname = 'Users can insert their own interview answers'
  ) THEN
    CREATE POLICY "Users can insert their own interview answers"
      ON public.profile_interview_answers FOR INSERT
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_interview_answers' AND policyname = 'Users can update their own interview answers'
  ) THEN
    CREATE POLICY "Users can update their own interview answers"
      ON public.profile_interview_answers FOR UPDATE
      USING (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_interview_answers' AND policyname = 'Users can delete their own interview answers'
  ) THEN
    CREATE POLICY "Users can delete their own interview answers"
      ON public.profile_interview_answers FOR DELETE
      USING (auth.uid() = profile_id);
  END IF;
END $$;

-- 5. Update handle_new_user() trigger function to handle anonymous demo sign-ins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_is_anonymous BOOLEAN;
  v_username TEXT;
  v_display_name TEXT;
BEGIN
  v_is_anonymous := COALESCE(NEW.is_anonymous, false);

  IF v_is_anonymous THEN
    v_username := 'demo_' || substr(NEW.id::text, 1, 8);
    v_display_name := 'Demo artist ' || substr(NEW.id::text, 1, 4);
    
    INSERT INTO public.profiles (id, username, display_name, is_demo, bio, journey, inspiration, intro, specialities)
    VALUES (
      NEW.id,
      v_username,
      v_display_name,
      true,
      '', '', '', '', '{}'
    ) ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO public.profiles (id, username, display_name, avatar_url, is_demo)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', 'artist_' || substr(NEW.id::text, 1, 8)),
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
      false
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reattach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

