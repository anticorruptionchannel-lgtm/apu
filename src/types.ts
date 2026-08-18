export type LanguageOption = 'urdu' | 'english' | 'punjabi' | 'roman_urdu';

export type VideoStyle = 
  | 'dramatic' 
  | 'breaking_news' 
  | 'investigative' 
  | 'corporate_expose' 
  | 'short_reel';

export interface GeneratedMetadata {
  title: string;
  script: string;
  description: string;
  hashtags: string[];
  visualPrompt: string;
  thumbnailText: string;
  policyStatus: {
    safe: boolean;
    reasoning: string;
    suggestions?: string;
  };
  language: LanguageOption;
  languageLabel: string;
  scenes: {
    sceneNumber: number;
    narrationText: string;
    visualDescription: string;
    suggestedOverlayText: string;
  }[];
}

export interface PresetIssue {
  id: string;
  category: string;
  title: string;
  prompt: string;
  suggestedStyle: VideoStyle;
  previewImage: string;
}
