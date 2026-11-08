import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/ai/gemini";
import { VALID_CATEGORY_IDS, DEFAULT_SUGGESTED_CATEGORIES } from "@/lib/categories";
import { StoryCardTheme } from "@/lib/artworks/story-card";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export interface StoryPostMetadata {
  title_suggestions: string[];
  caption: string;
  suggested_categories: string[];
  hashtags: string[];
  recommended_theme: StoryCardTheme;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyText, language = "en" } = body as {
      storyText?: string;
      language?: "en" | "ml";
    };

    if (!storyText || !storyText.trim()) {
      return NextResponse.json(
        { error: "Story text is required" },
        { status: 400 }
      );
    }

    const cleanStory = storyText.trim();
    const gemini = getGeminiClient();

    let result: StoryPostMetadata | null = null;

    if (gemini) {
      const candidateModels = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];

      const prompt = `You are ARTIQ's artist story curator.
An independent or traditional artist just spoke their personal story or reflection:
Primary language: ${language === "ml" ? "Malayalam" : "English"}

"""
${cleanStory}
"""

Task:
1. Provide 3 distinct, poetic, and respectful titles (each 2-6 words) that directly capture the soul, emotion, materials, or theme of what the artist said.
2. Provide a 1-line poetic caption summarizing the essence of their story.
3. Select EXACTLY 5 category IDs from our fixed taxonomy:
   ${JSON.stringify(VALID_CATEGORY_IDS)}
4. Provide 4 relevant searchable hashtags.
5. Recommend 1 craft card background theme out of: "canvas", "clay", "sprout", "sand", "mist".
   (e.g., use "clay" for pottery/sculpture, "sprout" for nature/botanical, "sand" for textiles/heritage, "canvas" for painting/classic reflections).

Output STRICTLY valid JSON with no markdown wrapping or code blocks:
{
  "title_suggestions": ["Title 1", "Title 2", "Title 3"],
  "caption": "Short 1-line caption",
  "suggested_categories": ["cat1", "cat2", "cat3", "cat4", "cat5"],
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4"],
  "recommended_theme": "canvas"
}`;

      for (const model of candidateModels) {
        try {
          const res = await gemini.models.generateContent({
            model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              responseMimeType: "application/json",
              temperature: 0.7,
            },
          });

          if (res.text) {
            const parsed = JSON.parse(res.text);
            const validTaxonomySet = new Set<string>(VALID_CATEGORY_IDS);
            const rawCats = Array.isArray(parsed.suggested_categories)
              ? (parsed.suggested_categories as unknown[]).map(String).map((c: string) => c.toLowerCase())
              : [];
            const filteredCats = rawCats.filter((c: string) => validTaxonomySet.has(c));

            for (const def of DEFAULT_SUGGESTED_CATEGORIES) {
              if (filteredCats.length >= 5) break;
              if (!filteredCats.includes(def)) filteredCats.push(def);
            }

            const theme = ["canvas", "clay", "sprout", "sand", "mist"].includes(
              parsed.recommended_theme
            )
              ? (parsed.recommended_theme as StoryCardTheme)
              : "canvas";

            result = {
              title_suggestions:
                Array.isArray(parsed.title_suggestions) && parsed.title_suggestions.length > 0
                  ? parsed.title_suggestions.slice(0, 3)
                  : ["Stories from the Atelier"],
              caption: parsed.caption || "An authentic artist story shared on ARTIQ.",
              suggested_categories: filteredCats.slice(0, 5),
              hashtags:
                Array.isArray(parsed.hashtags) && parsed.hashtags.length > 0
                  ? parsed.hashtags.slice(0, 5)
                  : ["#ArtistStory", "#AuthenticCraft", "#TraditionalArt"],
              recommended_theme: theme,
            };
            break;
          }
        } catch (err) {
          console.warn(`[StoryPost] Model ${model} failed, trying next:`, err);
        }
      }
    }

    // Fallback if AI was unavailable
    if (!result) {
      const firstLine = cleanStory.split(/[.\n]/)[0]?.slice(0, 40).trim() || "An Artist's Reflection";
      result = {
        title_suggestions: [
          firstLine,
          "Words from the Craft Workshop",
          "An Authentic Artist Reflection",
        ],
        caption: "An authentic artist reflection shared directly in their own words.",
        suggested_categories: DEFAULT_SUGGESTED_CATEGORIES.slice(0, 5),
        hashtags: ["#ArtistStory", "#CraftStory", "#AuthenticWords"],
        recommended_theme: "canvas",
      };
    }

    return NextResponse.json({
      success: true,
      metadata: result,
      storyText: cleanStory,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[StoryPost API] Fatal error:", msg);
    return NextResponse.json(
      { error: "Failed to generate story post metadata" },
      { status: 500 }
    );
  }
}
