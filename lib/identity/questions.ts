import { InterviewQuestion } from "@/types/identity";

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "intro",
    title: {
      en: "Tell us a little about yourself and how you started creating art.",
      ml: "നിങ്ങളെക്കുറിച്ചും കലാരംഗത്തേക്ക് എങ്ങനെ കടന്നുവന്നുവെന്നും ചുരുക്കമായി പറയൂ.",
    },
    placeholder: {
      en: "For example: I am a mural painter from Thrissur. I fell in love with drawing when I was a child...",
      ml: "ഉദാഹരണത്തിന്: ഞാൻ തൃശ്ശൂരിൽ നിന്നുള്ള ഒരു ചുവർചിത്രകാരനാണ്. കുട്ടിക്കാലം മുതലേ ചിത്രരചനയിൽ താല്പര്യമുണ്ടായിരുന്നു...",
    },
  },
  {
    id: "mentor",
    title: {
      en: "Who introduced you to art?",
      ml: "ആരാണ് നിങ്ങളെ കലയുടെ ലോകത്തേക്ക് നയിച്ചത് അല്ലെങ്കിൽ ആരാണ് നിങ്ങളുടെ ഗുരു?",
    },
    placeholder: {
      en: "For example: My uncle was a temple artist and let me mix colors in his workshop...",
      ml: "ഉദാഹരണത്തിന്: എന്റെ അമ്മാവൻ ഒരു ക്ഷേത്ര കലാകാരനായിരുന്നു. അദ്ദേഹത്തോടൊപ്പമാണ് ഞാൻ തുടക്കമിട്ടത്...",
    },
  },
  {
    id: "experience",
    title: {
      en: "How long have you been practising?",
      ml: "എത്ര കാലമായി നിങ്ങൾ ഈ രംഗത്ത് പ്രവർത്തിക്കുന്നു?",
    },
    placeholder: {
      en: "For example: Over 15 years, starting with small wooden carvings before moving to canvas...",
      ml: "ഉദാഹരണത്തിന്: ഏകദേശം 15 വർഷത്തിലേറെയായി ഞാൻ ഈ രംഗത്തുണ്ട്...",
    },
  },
  {
    id: "inspiration",
    title: {
      en: "What inspires your creations?",
      ml: "നിങ്ങളുടെ സൃഷ്ടികൾക്ക് പ്രചോദനം നൽകുന്നത് എന്താണ്?",
    },
    placeholder: {
      en: "For example: Village temple festivals, folk folklore, nature, and the colors of the monsoon...",
      ml: "ഉദാഹരണത്തിന്: കേരളത്തിലെ നാടോടി പാരമ്പര്യങ്ങളും, പ്രകൃതിഭംഗിയും, ക്ഷേത്ര ഉത്സവങ്ങളുമാണ് പ്രധാന പ്രചോദനം...",
    },
  },
  {
    id: "special",
    title: {
      en: "What makes your artwork special?",
      ml: "നിങ്ങളുടെ കലാസൃഷ്ടികളെ സവിശേഷമാക്കുന്നത് എന്താണ്?",
    },
    placeholder: {
      en: "For example: I extract all pigments directly from riverbed stones and tree resin...",
      ml: "ഉദാഹരണത്തിന്: സ്വാഭാവിക പ്രകൃതിദത്ത ചായക്കൂട്ടുകളും പരമ്പരാഗത രീതികളും മാത്രമാണ് ഞാൻ ഉപയോഗിക്കുന്നത്...",
    },
  },
  {
    id: "techniques",
    title: {
      en: "Which techniques do you use?",
      ml: "ഏതെല്ലാം മാധ്യമങ്ങളും സാങ്കേതികവിദ്യകളുമാണ് നിങ്ങൾ ഉപയോഗിക്കുന്നത്?",
    },
    placeholder: {
      en: "For example: Fresco-secco on lime plaster, fine bamboo quill lining, natural resin binders...",
      ml: "ഉദാഹരണത്തിന്: മ്യൂറൽ പെയിന്റിംഗ്, പ്രകൃതിദത്ത ചായക്കൂട്ടുകൾ, പാരമ്പര്യ രേഖാചിത്ര രീതികൾ...",
    },
  },
];

export function getQuestionById(id: string): InterviewQuestion | undefined {
  return INTERVIEW_QUESTIONS.find((q) => q.id === id);
}

