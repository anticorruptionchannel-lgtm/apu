import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Increase payload limits for base64 image uploads
app.use(express.json({ limit: '25mb' }));

// Helper to get GoogleGenAI client lazily
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ----------------- API ENDPOINTS -----------------

// Health check & API Keys Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    channel: 'ACC PK Content Engine',
    keysConfigured: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      invideo: Boolean(process.env.INVIDEO_API_KEY),
      imageGen: Boolean(process.env.IMAGE_GEN_API_KEY),
      elevenLabs: Boolean(process.env.ELEVENLABS_API_KEY),
    },
  });
});

// API: Generate Content (Script, SEO, Scenes, Policy Check)
app.post('/api/generate-content', async (req, res) => {
  try {
    const {
      userPrompt,
      language = 'urdu',
      videoStyle = 'dramatic',
      attachedImageBase64,
      channelName = 'ACC PK',
      contactEmail = 'report@accpk.org',
      endingCTA = '🔔 Stand against corruption! Subscribe to ACC PK to support transparency in Pakistan.',
      isRefresh = false,
    } = req.body;

    if (!userPrompt && !attachedImageBase64) {
      return res.status(400).json({ error: 'Please provide a prompt or attach an issue image.' });
    }

    const ai = getGenAI();

    const OFFICIAL_MISSION = `Kickbacks, bribes and nepotism at the expense of public is a common practice in the developing countries. Pakistan can not be excluded. Anti corruption channel (ACC P[...]`;

    const OFFICIAL_CONTACT_BLOCK = `
--------------------------------------------------
ANTI-CORRUPTION CHANNEL PAKISTAN (ACC PK)
"DETERMINE TO BRING PROSPERITY"
"CRUSH CORRUPTION" • Evidence Based Reporting

👤 Founder & C.E.O: Rashid Hameed
🏢 Address: 148 D Faisal Town, Lahore, Pakistan
📞 Contact / Mobile: +92 315 433 8690
☎️ Landline: +92 42 3522 1515
📧 Official Email: anticorruptionchannel@gmail.com
--------------------------------------------------`;

    const ALWAYS_SAME_HASHTAGS = [
      '#ACCPK',
      '#AntiCorruptionChannel',
      '#RashidHameed',
      '#EvidenceBasedReporting',
      '#CrushCorruption',
      '#DetermineToBringProsperity',
      '#Pakistan',
      '#StopCorruption',
      '#ExposeWrongdoers'
    ];

    let langInstructions = '';
    if (language === 'urdu') {
      langInstructions = 'Write the SCRIPT and NARRATION TEXT in Urdu (اردو script or clean readable Urdu text) with high dramatic impact suitable for Pakistani investigative news narration.';
    } else if (language === 'punjabi') {
      langInstructions = 'Write the SCRIPT and NARRATION TEXT in Punjabi (Gurmukhi/Shahmukhi or clear Roman Punjabi) with powerful anti-corruption slogans.';
    } else if (language === 'roman_urdu') {
      langInstructions = 'Write the SCRIPT and NARRATION TEXT in clean Roman Urdu (e.g., "Mulk main corruption k khilaf awaz uthane ka waqt aa gaya hai...") so it is easy for voice synthesis and [...]';
    } else {
      langInstructions = 'Write the SCRIPT and NARRATION TEXT in English with an authoritative, bold investigative journalism tone.';
    }

    const systemInstruction = `You are the lead investigative scriptwriter, media director, and policy compliance auditor for "${channelName}" (Anti-Corruption Pakistan).
Your channel exposes public sector corruption, financial irregularities, bribery, illegal land encroachment, and governance failures in Pakistan.
${langInstructions}

Requirements:
1. POLISHED SCRIPT: Craft an engaging 30-45 second narration script. Ensure it sounds punchy, serious, and captivating.
2. POLICY SAFETY: Explicitly review the prompt for YouTube community safety. Avoid libel/defamation against named unverified individuals, hate speech, or incitement to violence. State if it is po[...]
3. SCENE BREAKDOWN: Break the narration into 3-4 distinct scenes with visual descriptions and lower-third text overlays.
4. METADATA: Provide high CTR YouTube Title, Full Description (including contact: ${contactEmail} and CTA: ${endingCTA}), Hashtags, Visual Generation Prompt, and Thumbnail Headline.
5. CREATIVE VARIATION: ${isRefresh ? 'Generate a totally fresh, unique angle/perspective compared to standard takes.' : 'Generate a hard-hitting, professional broadcast script.'}`;

    const promptText = `Issue / Topic / Request: "${userPrompt || 'Analyze attached issue image'}"
Atmosphere Style: ${videoStyle}
Target Language: ${language}
${isRefresh ? 'Note: User clicked REFRESH! Give a fresh unique creative angle.' : ''}`;

    const parts: any[] = [{ text: promptText }];

    if (attachedImageBase64) {
      // Remove data URL prefix if present
      const cleanBase64 = attachedImageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = attachedImageBase64.substring(attachedImageBase64.indexOf(":") + 1, attachedImageBase64.indexOf(";")) || 'image/jpeg';
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
      parts.push({ text: 'Analyze this uploaded issue image/document to tailor the background visual prompts and script specifically to the evidence shown in the photo.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Catchy YouTube title with high CTR' },
            script: { type: Type.STRING, description: 'Full narration script in the requested language' },
            description: { type: Type.STRING, description: 'YouTube description including email and subscription CTA' },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of relevant viral hashtags'
            },
            visualPrompt: { type: Type.STRING, description: 'Detailed AI prompt for image/background generation' },
            thumbnailText: { type: Type.STRING, description: '3-5 word high-impact text for YouTube thumbnail' },
            policyStatus: {
              type: Type.OBJECT,
              properties: {
                safe: { type: Type.BOOLEAN },
                reasoning: { type: Type.STRING },
                suggestions: { type: Type.STRING }
              },
              required: ['safe', 'reasoning']
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  narrationText: { type: Type.STRING },
                  visualDescription: { type: Type.STRING },
                  suggestedOverlayText: { type: Type.STRING }
                },
                required: ['sceneNumber', 'narrationText', 'visualDescription', 'suggestedOverlayText']
              }
            }
          },
          required: ['title', 'script', 'description', 'hashtags', 'visualPrompt', 'thumbnailText', 'policyStatus', 'scenes']
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from Gemini AI');
    }

    const jsonOutput = JSON.parse(resultText);

    // Merge official ACC PK mission statement, contact block, and standard hashtags
    const fullDescription = `${jsonOutput.description || ''}\n\n${OFFICIAL_MISSION}\n\n${OFFICIAL_CONTACT_BLOCK}`;

    // Deduplicate and combine hashtags
    const mergedHashtags = Array.from(new Set([
      ...(jsonOutput.hashtags || []),
      ...ALWAYS_SAME_HASHTAGS
    ]));

    res.json({
      ...jsonOutput,
      description: fullDescription.trim(),
      hashtags: mergedHashtags,
      officialMission: OFFICIAL_MISSION,
      officialContact: OFFICIAL_CONTACT_BLOCK,
      ceo: 'Rashid Hameed',
      address: '148 D Faisal Town, Lahore, Pakistan',
      phone: '+92 315 433 8690',
      email: 'anticorruptionchannel@gmail.com'
    });
  } catch (err: any) {
    console.error('Error generating content:', err);
    res.status(500).json({ error: err.message || 'Failed to generate content.' });
  }
});

// API: Generate AI Background Image using Gemini Image Model
app.post('/api/generate-image', async (req, res) => {
  try {
    const { visualPrompt, aspectRatio = '16:9' } = req.body;
    if (!visualPrompt) {
      return res.status(400).json({ error: 'visualPrompt is required' });
    }

    const ai = getGenAI();
    const prompt = `${visualPrompt}, cinematic lighting, dramatic contrast, high resolution anti-corruption investigative journalism aesthetic, broadcast quality, 8k`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio === '16:9' ? '16:9' : '1:1'
        }
      }
    });

    let imageUrl = '';
    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      // Fallback placeholder image with high contrast if generation model is restricted
      imageUrl = `https://picsum.photos/seed/${encodeURIComponent(visualPrompt.slice(0, 20))}/1280/720`;
    }

    res.json({ imageUrl });
  } catch (err: any) {
    console.error('Error generating image:', err);
    // Fallback to picsum on error
    const fallbackUrl = `https://picsum.photos/seed/accpk_${Date.now()}/1280/720`;
    res.json({ imageUrl: fallbackUrl, warning: err.message });
  }
});

// API: Generate Speech Audio (TTS using Gemini TTS)
app.post('/api/generate-speech', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Say with serious, authoritative news presenter tone: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/mp3';

    if (base64Audio) {
      res.json({ audioUrl: `data:${mimeType};base64,${base64Audio}` });
    } else {
      res.json({ audioUrl: null, message: 'Audio stream unavailable, browser synthesis fallback will be used.' });
    }
  } catch (err: any) {
    console.error('Error generating speech:', err);
    res.json({ audioUrl: null, message: 'Fallback to client browser speech synthesis' });
  }
});

// API: Search Free Stock Media (Pixabay, Pexels, Unsplash)
app.get('/api/stock-search', async (req, res) => {
  try {
    const { q, type } = req.query;
    const query = encodeURIComponent((q as string) || 'investigation');
    const mediaType = type === 'video' ? 'video' : 'image';
    const items: any[] = [];

    if (mediaType === 'video') {
      // Pixabay Videos
      if (process.env.PIXABAY_API_KEY) {
        try {
          const url = `https://pixabay.com/api/videos/?key=${process.env.PIXABAY_API_KEY}&q=${query}&per_page=9`;
          const pixRes = await fetch(url);
          if (pixRes.ok) {
            const data = await pixRes.json();
            data.hits.forEach((hit: any) => {
              if (hit.videos && hit.videos.medium && hit.videos.medium.url) {
                items.push({
                  id: `pixabay_v_${hit.id}`,
                  title: hit.tags || 'Pixabay Stock Video',
                  type: 'video',
                  url: hit.videos.medium.url,
                  thumbnail: hit.picture_id ? `https://i.vimeocdn.com/video/${hit.picture_id}_295x166.jpg` : '',
                  category: 'Pixabay Video'
                });
              }
            });
          }
        } catch (e) {
          console.error('Pixabay Video API error:', e);
        }
      }

      // Pexels Videos
      if (process.env.PEXELS_API_KEY) {
        try {
          const url = `https://api.pexels.com/videos/search?query=${query}&per_page=9`;
          const pexelsRes = await fetch(url, { headers: { Authorization: process.env.PEXELS_API_KEY } });
          if (pexelsRes.ok) {
            const data = await pexelsRes.json();
            data.videos.forEach((vid: any) => {
              const hdFile = vid.video_files?.find((f: any) => f.quality === 'hd' || f.quality === 'sd') || vid.video_files?.[0];
              if (hdFile && hdFile.link) {
                items.push({
                  id: `pexels_v_${vid.id}`,
                  title: 'Pexels Stock Video',
                  type: 'video',
                  url: hdFile.link,
                  thumbnail: vid.image,
                  category: 'Pexels Video'
                });
              }
            });
          }
        } catch (e) {
          console.error('Pexels Video API error:', e);
        }
      }
    } else {
      // Unsplash Images
      if (process.env.UNSPLASH_ACCESS_KEY) {
        try {
          const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=9`;
          const unsRes = await fetch(url, { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } });
          if (unsRes.ok) {
            const data = await unsRes.json();
            data.results.forEach((img: any) => {
              items.push({
                id: `unsplash_${img.id}`,
                title: img.alt_description || 'Unsplash Stock Photo',
                type: 'image',
                url: img.urls.regular,
                thumbnail: img.urls.small,
                category: 'Unsplash Image'
              });
            });
          }
        } catch (e) {
          console.error('Unsplash API error:', e);
        }
      }
      
      // Pixabay Images
      if (process.env.PIXABAY_API_KEY) {
        try {
          const url = `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${query}&image_type=photo&per_page=9`;
          const pixRes = await fetch(url);
          if (pixRes.ok) {
            const data = await pixRes.json();
            data.hits.forEach((hit: any) => {
              items.push({
                id: `pixabay_i_${hit.id}`,
                title: hit.tags || 'Pixabay Stock Photo',
                type: 'image',
                url: hit.largeImageURL,
                thumbnail: hit.webformatURL,
                category: 'Pixabay Image'
              });
            });
          }
        } catch (e) {
          console.error('Pixabay Image API error:', e);
        }
      }
    }

    res.json({ items });
  } catch (err: any) {
    console.error('Stock Search Error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ ACC PK Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
