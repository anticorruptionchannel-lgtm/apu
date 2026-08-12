import { LanguageOption, PresetIssue, VideoStyle } from '../types';

export function getPresetSelection(
  preset: PresetIssue,
  defaultLanguage: LanguageOption,
): {
  userPrompt: string;
  selectedStyle: VideoStyle;
  selectedLanguage: LanguageOption;
} {
  return {
    userPrompt: preset.prompt,
    selectedStyle: preset.suggestedStyle,
    selectedLanguage: defaultLanguage,
  };
}
