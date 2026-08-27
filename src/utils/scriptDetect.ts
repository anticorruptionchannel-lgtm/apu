// Detects Arabic-script text (covers Urdu, Punjabi written in Shahmukhi, and Arabic
// itself) so canvas text draws can switch to a Nastaliq font and right-to-left flow —
// Latin text (English, Roman Urdu) stays on the regular sans-serif font, since Nastaliq
// fonts render Latin characters poorly.
//
// Ranges: Arabic (U+0600-U+06FF), Arabic Supplement (U+0750-U+077F),
// Arabic Extended-A (U+08A0-U+08FF), Arabic Presentation Forms A/B
// (U+FB50-U+FDFF, U+FE70-U+FEFF).
const ARABIC_SCRIPT_RANGE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export function isArabicScript(text: string): boolean {
  return ARABIC_SCRIPT_RANGE.test(text);
}
