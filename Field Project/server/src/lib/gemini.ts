import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function classifyUrlWithMetadata(
  url: string,
  title: string,
  description: string
): Promise<{ isEducational: boolean; platform: string; category: string; reason: string }> {
  if (!process.env.GEMINI_API_KEY) {
    return classifyUrlFallback(url);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a strict educational content classifier for a student productivity app.

A student wants to study using this resource:
URL: ${url}
Page Title: ${title}
Description: ${description}

Is this GENUINELY educational? Judge the specific content, not just the platform.
"YouTube - SQL Full Course" = educational. "YouTube - 10 Funniest Moments" = NOT educational.

Educational: tutorials, CS courses, math/science, coding practice, documentation, lectures, Wikipedia, e-learning, online courses, documentation sites.
NOT educational: music, entertainment, social media, gaming, news, shopping, memes, viral videos.

Respond ONLY with valid JSON (no markdown, no code blocks):
{"isEducational": true, "platform": "YouTube", "category": "CS / Database", "reason": "Full SQL course for beginners"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(clean);
    return {
      isEducational: parsed.isEducational ?? false,
      platform: parsed.platform ?? '',
      category: parsed.category ?? '',
      reason: parsed.reason ?? '',
    };
  } catch (e) {
    console.error('Gemini classification error:', e);
    return classifyUrlFallback(url);
  }
}

export async function classifyUrlFallback(
  url: string
): Promise<{ isEducational: boolean; platform: string; category: string; reason: string }> {
  const urlLower = url.toLowerCase();
  
  const educationalDomains = [
    'wikipedia.org',
    'khanacademy.org',
    'coursera.org',
    'udemy.com',
    'edx.org',
    'codecademy.com',
    'freecodecamp.org',
    'w3schools.com',
    'mozilla.org',
    'github.com',
    'stackoverflow.com',
    'medium.com',
    'dev.to',
    'GeeksforGeeks',
    'tutorialspoint',
    'javatpoint',
    'gfg',
    'leetcod',
    'hackerrank',
    'hackerearth',
    'codeforces',
    'codechef',
    'kaggle',
    'colab.google',
    'tensorflow.org',
    'pytorch.org',
    'scikit-learn.org',
    'numpy.org',
    'pandas.pydata',
    'matplotlib.org',
    'reactjs.org',
    'vuejs.org',
    'angular.io',
    'nextjs.org',
    'nodejs.org',
    'expressjs.com',
    'mongoosejs.com',
    'mongodb.com',
    'postgresql.org',
    'mysql.com',
    'redis.io',
    'docker.com',
    'kubernetes.io',
    'aws.amazon.com',
    'azure.microsoft.com',
    'cloud.google.com',
    'mit.edu',
    'stanford.edu',
    'harvard.edu',
    'berkeley.edu',
    'oxford.edu',
    'cambridge.org',
    'nptel.ac.in',
    'swayam.gov.in',
  ];

  const educationalKeywords = [
    'tutorial',
    'course',
    'learn',
    'documentation',
    'guide',
    'how-to',
    'howto',
    'introduction',
    'beginner',
    'advanced',
    'programming',
    'algorithm',
    'data structure',
    'machine learning',
    'deep learning',
    'python',
    'javascript',
    'java',
    'c++',
    'database',
    'sql',
    'web development',
    'full stack',
    'frontend',
    'backend',
    'devops',
    'cloud',
    'aws',
    'docker',
    'kubernetes',
    'linux',
    'operating system',
    'computer network',
    'dsa',
    'competitive programming',
    'interview preparation',
    'system design',
    'design pattern',
    'clean code',
    'refactoring',
    'testing',
    'ci/cd',
  ];

  const nonEducationalKeywords = [
    'funny',
    'prank',
    'challenge',
    'meme',
    'viral',
    'reaction',
    'compilation',
    'best moments',
    'top 10',
    'fail',
    'win',
    'gaming',
    'fortnite',
    'minecraft',
    'roblox',
    'pubg',
    'cod warzone',
    'music video',
    'lyrics',
    'song',
    'album',
    'concert',
    'spotify',
    'soundcloud',
    'tiktok',
    'reels',
    'shorts',
    'trending',
    'vlog',
    'daily vlog',
    'haul',
    'unboxing',
    'prank',
    'social media',
    'drama',
    'gossip',
  ];

  let platform = '';
  let category = '';
  let reason = '';

  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    platform = 'YouTube';
    if (urlLower.includes('/shorts/')) {
      reason = 'YouTube Shorts are not suitable for focused learning';
      return { isEducational: false, platform, category: 'Entertainment', reason };
    }
    if (nonEducationalKeywords.some(k => urlLower.includes(k))) {
      reason = 'This content appears to be entertainment rather than educational';
      return { isEducational: false, platform, category: 'Entertainment', reason };
    }
    if (educationalKeywords.some(k => urlLower.includes(k) || title.toLowerCase().includes(k))) {
      reason = 'This appears to be educational content on YouTube';
      return { isEducational: true, platform, category: 'Video Tutorial', reason };
    }
  } else if (urlLower.includes('github.com')) {
    platform = 'GitHub';
    reason = 'GitHub repositories can contain educational code and projects';
    return { isEducational: true, platform, category: 'Code Repository', reason };
  } else if (urlLower.includes('stackoverflow.com')) {
    platform = 'Stack Overflow';
    reason = 'Stack Overflow is a valuable programming Q&A resource';
    return { isEducational: true, platform, category: 'Q&A', reason };
  } else if (urlLower.includes('geeksforgeeks.org') || urlLower.includes('gfg.to')) {
    platform = 'GeeksforGeeks';
    reason = 'GeeksforGeeks provides programming tutorials and practice problems';
    return { isEducational: true, platform, category: 'Programming', reason };
  } else if (educationalDomains.some(d => urlLower.includes(d))) {
    platform = urlLower.split('.')[1]?.charAt(0).toUpperCase() + urlLower.split('.')[1]?.slice(1) || 'Educational Site';
    reason = 'This domain is known for educational content';
    return { isEducational: true, platform, category: 'Educational', reason };
  }

  if (nonEducationalKeywords.some(k => urlLower.includes(k) || title.toLowerCase().includes(k))) {
    reason = 'This content appears to be entertainment rather than educational';
    return { isEducational: false, platform: platform || 'Unknown', category: 'Non-Educational', reason };
  }

  if (educationalKeywords.some(k => urlLower.includes(k) || title.toLowerCase().includes(k))) {
    reason = 'This URL appears to contain educational content based on keywords';
    return { isEducational: true, platform: platform || 'Unknown', category: 'Educational', reason };
  }

  reason = 'This URL does not appear to be from a known educational platform';
  return { isEducational: false, platform: platform || 'Unknown', category: 'Unverified', reason };
}
