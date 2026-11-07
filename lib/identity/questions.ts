import { InterviewQuestion } from "@/types/identity";

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "name",
    title: {
      en: "What is your name, and what would you like people to call you as an artist?",
      ml: "നിങ്ങളുടെ പേരെന്താണ്? കലാകാരൻ / കലാകാരി എന്ന നിലയിൽ നിങ്ങൾ ഏത് പേരിലാണ് അറിയപ്പെടാൻ ആഗ്രഹിക്കുന്നത്?",
    },
    placeholder: {
      en: "e.g. K. R. Raghavan (people call me Raghavan Master)",
      ml: "ഉദാഹരണത്തിന്: കെ. ആർ. രാഘവൻ (രാഘവൻ മാസ്റ്റർ എന്ന് ആളുകൾ വിളിക്കുന്നു)",
    },
  },
  {
    id: "location",
    title: {
      en: "Where are you from? (Town/city and state)",
      ml: "നിങ്ങൾ എവിടെ നിന്നുള്ളയാളാണ്? (ഗ്രാമം/നഗരം, ജില്ല അല്ലെങ്കിൽ സംസ്ഥാനം)",
    },
    placeholder: {
      en: "e.g. Kottayam, Kerala",
      ml: "ഉദാഹരണത്തിന്: കോട്ടയം, കേരളം",
    },
  },
  {
    id: "art_type",
    title: {
      en: "What type of art do you create? (For example: painting, sculpture, pottery, weaving, digital art, etc.)",
      ml: "നിങ്ങൾ ഏതുതരം കലാരൂപങ്ങളാണ് സൃഷ്ടിക്കുന്നത്? (ഉദാഹരണത്തിന്: ചിത്രകല, ശില്പകല, മൺപാത്ര നിർമ്മാണം, നെയ്ത്ത്, ഡിജിറ്റൽ ആർട്ട് തുടങ്ങിയവ)",
    },
    placeholder: {
      en: "e.g. Traditional temple mural painting and wood carving",
      ml: "ഉദാഹരണത്തിന്: പരമ്പരാഗത ചുവർചിത്രരചന, തടി ശില്പകല",
    },
  },
  {
    id: "journey",
    title: {
      en: "How did your journey as an artist begin?",
      ml: "ഒരു കലാകാരൻ / കലാകാരി എന്ന നിലയിലുള്ള നിങ്ങളുടെ യാത്ര എങ്ങനെ ആരംഭിച്ചു?",
    },
    placeholder: {
      en: "e.g. Initiated under temple masters in Guruvayur in 1984, learning sacred proportions...",
      ml: "ഉദാഹരണത്തിന്: ഗുരുവായൂരിലെ ചിത്രകലാ ഗുരുക്കന്മാരുടെ കീഴിൽ അഭ്യസിച്ചാണ് തുടക്കം...",
    },
  },
  {
    id: "inspiration",
    title: {
      en: "What inspires you to create art?",
      ml: "കല സൃഷ്ടിക്കാൻ നിങ്ങൾക്ക് പ്രചോദനം നൽകുന്നത് എന്താണ്?",
    },
    placeholder: {
      en: "e.g. Ancient mythological narratives, temple architecture, and the rhythms of nature...",
      ml: "ഉദാഹരണത്തിന്: പുരാണകഥകളും, ക്ഷേത്രകലകളും, പ്രകൃതിയുടെ ഭാവങ്ങളും...",
    },
  },
  {
    id: "techniques",
    title: {
      en: "What techniques, materials or special skills do you use in your artwork?",
      ml: "നിങ്ങളുടെ കലാസൃഷ്ടികളിൽ നിങ്ങൾ ഉപയോഗിക്കുന്ന സാങ്കേതിക വിദ്യകൾ, മാധ്യമങ്ങൾ അല്ലെങ്കിൽ പ്രത്യേക കഴിവുകൾ എന്തൊക്കെയാണ്?",
    },
    placeholder: {
      en: "e.g. Fresco-secco, natural rock pigments, tree resin binders, fine bamboo brushwork...",
      ml: "ഉദാഹരണത്തിന്: പ്രകൃതിദത്ത ചായക്കൂട്ടുകൾ, ചുണ്ണാമ്പ് ഭിത്തിയിലെ രചന, മുളങ്കൂട് ബ്രഷുകൾ...",
    },
  },
  {
    id: "cultural_stories",
    title: {
      en: "Are there any cultural traditions, personal experiences or stories reflected in your art?",
      ml: "നിങ്ങളുടെ കലയിൽ പ്രതിഫലിക്കുന്ന ഏതെങ്കിലും സാംസ്കാരിക പാരമ്പര്യങ്ങളോ, വ്യക്തിപരമായ അനുഭവങ്ങളോ, കഥകളോ ഉണ്ടോ?",
    },
    placeholder: {
      en: "e.g. 500-year-old Kerala mural traditions, folk rituals, and generational village stories...",
      ml: "ഉദാഹരണത്തിന്: 500 വർഷം പഴക്കമുള്ള കേരള ചുമർചിത്ര പാരമ്പര്യവും ഗ്രാമീണ നാടോടി ആചാരങ്ങളും...",
    },
  },
  {
    id: "audience_feeling",
    title: {
      en: "What would you like people to understand or feel when they see your artwork?",
      ml: "നിങ്ങളുടെ കലാസൃഷ്ടി കാണുമ്പോൾ ആളുകൾ എന്താണ് മനസ്സിലാക്കണമെന്നോ അനുഭവിക്കണമെന്നോ നിങ്ങൾ ആഗ്രഹിക്കുന്നത്?",
    },
    placeholder: {
      en: "e.g. A serene spiritual connection, peace, and reverence for authentic handmade heritage...",
      ml: "ഉദാഹരണത്തിന്: മനസ്സിന് ശാന്തിയും, നമ്മുടെ പരമ്പരാഗത പൈതൃകത്തോടുള്ള ആദരവും...",
    },
  },
  {
    id: "contact",
    title: {
      en: "How can collectors and art lovers contact you? (Phone number, address, and email)",
      ml: "കല ആസ്വാദകർക്കും ആവശ്യക്കാർക്കും നിങ്ങളെ എങ്ങനെ ബന്ധപ്പെടാം? (ഫോൺ നമ്പർ, വിലാസം, ഇമെയിൽ)",
    },
    placeholder: {
      en: "e.g. Phone: +91 94471 23456, Email: artist@artiq.gallery, Studio: Temple Road, Kottayam",
      ml: "ഉദാഹരണത്തിന്: ഫോൺ: +91 94471 23456, ഇമെയിൽ: artist@artiq.gallery, വിലാസം: കോട്ടയം, കേരളം",
    },
  },
];

export function getQuestionById(id: string): InterviewQuestion | undefined {
  return INTERVIEW_QUESTIONS.find((q) => q.id === id);
}
