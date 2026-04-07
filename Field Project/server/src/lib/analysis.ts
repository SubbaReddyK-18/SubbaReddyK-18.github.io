import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface SessionAnalysis {
  summary: string;
  distractionPattern: string;
  focusQuality: string;
  recommendations: string[];
  focusScore: number;
  peakFocusHours: string;
  improvementAreas: string[];
  strengths: string[];
}

export async function generateSessionAnalysis(
  sessionData: {
    subject: string;
    wallClockSeconds: number;
    verifiedFocusSeconds: number;
    distractionSeconds: number;
    presenceFailSeconds: number;
    tabSwitchCount: number;
    presenceFailCount: number;
    efficiencyScore: number;
    verdict: string;
    treeStage: number;
    isTutorial: boolean;
    tutorialPlatform?: string;
  }
): Promise<SessionAnalysis> {
  if (!process.env.GEMINI_API_KEY) {
    return generateFallbackAnalysis(sessionData);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const efficiencyPercent = sessionData.efficiencyScore;
  const distractionPercent = sessionData.wallClockSeconds > 0
    ? Math.round((sessionData.distractionSeconds / sessionData.wallClockSeconds) * 100)
    : 0;
  const presenceFailPercent = sessionData.wallClockSeconds > 0
    ? Math.round((sessionData.presenceFailSeconds / sessionData.wallClockSeconds) * 100)
    : 0;

  const prompt = `You are an expert productivity and psychology analyst for a digital distraction analysis system called MINDORA.

Analyze this focus session data and provide a comprehensive psychological and behavioral report:

SESSION DATA:
- Subject: ${sessionData.subject}
- Total Time: ${Math.round(sessionData.wallClockSeconds / 60)} minutes
- Verified Focus: ${Math.round(sessionData.verifiedFocusSeconds / 60)} minutes
- Distraction Time: ${Math.round(sessionData.distractionSeconds / 60)} minutes (${distractionPercent}% of session)
- Presence Check Failures: ${sessionData.presenceFailCount} times, ${Math.round(sessionData.presenceFailSeconds / 60)} minutes lost
- Tab Switches: ${sessionData.tabSwitchCount} times
- Efficiency Score: ${efficiencyPercent}%
- Session Type: ${sessionData.isTutorial ? `Tutorial Mode (${sessionData.tutorialPlatform || 'Unknown platform'})` : 'Open Study Mode'}
- Verdict: ${sessionData.verdict}

Generate a JSON response with this EXACT structure (no markdown, no code blocks):
{
  "summary": "2-3 sentence summary of this session's overall performance",
  "distractionPattern": "Analysis of WHEN and WHY distractions occurred based on the data",
  "focusQuality": "Assessment of focus depth and quality",
  "recommendations": ["3 specific actionable recommendations to improve"],
  "focusScore": "A score from 0-100 based on overall performance",
  "peakFocusHours": "Estimated best time of day for this user based on focus patterns",
  "improvementAreas": ["2-3 specific areas that need work"],
  "strengths": ["2-3 things the user did well"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(clean);
    
    return {
      summary: parsed.summary || 'Session completed.',
      distractionPattern: parsed.distractionPattern || 'No significant pattern detected.',
      focusQuality: parsed.focusQuality || 'Average focus quality.',
      recommendations: parsed.recommendations || ['Take regular breaks.', 'Minimize tab switching.'],
      focusScore: Math.min(100, Math.max(0, parseInt(parsed.focusScore) || 50)),
      peakFocusHours: parsed.peakFocusHours || 'Morning hours (9 AM - 12 PM)',
      improvementAreas: parsed.improvementAreas || ['Reduce distractions.'],
      strengths: parsed.strengths || ['Completed the session.'],
    };
  } catch (e) {
    console.error('AI analysis error:', e);
    return generateFallbackAnalysis(sessionData);
  }
}

function generateFallbackAnalysis(sessionData: any): SessionAnalysis {
  const efficiency = sessionData.efficiencyScore;
  const tabSwitches = sessionData.tabSwitchCount;
  const presenceFails = sessionData.presenceFailCount;
  const distractionSeconds = sessionData.distractionSeconds;
  
  let summary = '';
  let focusQuality = '';
  const recommendations: string[] = [];
  const improvementAreas: string[] = [];
  const strengths: string[] = [];
  
  if (efficiency >= 85) {
    summary = `Outstanding focus session! You maintained ${efficiency}% efficiency while studying ${sessionData.subject}. Your ability to stay concentrated is exceptional.`;
    focusQuality = 'Exceptional deep focus with minimal interruptions. You achieved a state of flow.';
    strengths.push('Excellent focus retention', 'Minimal distractions', 'Consistent attention throughout');
    recommendations.push('Consider challenging yourself with more difficult material', 'Your focus habits are excellent - maintain this consistency');
  } else if (efficiency >= 70) {
    summary = `Good focus session with ${efficiency}% efficiency. You demonstrated solid concentration while studying ${sessionData.subject}.`;
    focusQuality = 'Good focus quality with room for minor improvements.';
    strengths.push('Good overall concentration', 'Completed the session successfully');
    if (tabSwitches > 3) {
      recommendations.push('Try using browser extensions to block distracting websites during focus time', 'Set specific times for checking messages');
      improvementAreas.push('Reducing tab switching behavior');
    }
    if (presenceFails > 1) {
      recommendations.push('Practice being more present during focus sessions');
      improvementAreas.push('Improving presence awareness');
    }
  } else if (efficiency >= 50) {
    summary = `Moderate focus session at ${efficiency}% efficiency. While studying ${sessionData.subject}, you experienced some distractions that affected your concentration.`;
    focusQuality = 'Average focus quality. Some periods of good focus were interrupted.';
    improvementAreas.push('Managing external distractions', 'Reducing tab switching frequency');
    if (distractionSeconds > 300) {
      recommendations.push('Consider using a dedicated study space free from distractions', 'Try the Pomodoro technique: 25 min focus, 5 min break');
      improvementAreas.push('Time management during study sessions');
    }
    recommendations.push('Start with shorter focus sessions (15-20 mins) and gradually increase duration');
  } else {
    summary = `This session showed significant distractions with only ${efficiency}% efficiency. Studying ${sessionData.subject} requires more focused attention.`;
    focusQuality = 'Poor focus quality with frequent interruptions.';
    improvementAreas.push('Creating a distraction-free environment', 'Building focus endurance gradually', 'Managing impulse to switch tabs');
    recommendations.push('Start with 10-minute focused sessions and slowly increase', 'Close all unnecessary browser tabs and apps', 'Consider using website blockers like Cold Turkey or Freedom');
    recommendations.push('Reflect on what distracted you most and plan how to address it next session');
  }

  if (tabSwitches > 10) {
    summary += ` You switched tabs ${tabSwitches} times, which significantly impacted your focus.`;
    if (!improvementAreas.includes('Reducing tab switching')) {
      improvementAreas.push('Tab switching behavior');
    }
    recommendations.push(`You switched tabs ${tabSwitches} times - aim for fewer than 5 next time`);
  }

  if (presenceFails > 2) {
    summary += ` You missed ${presenceFails} presence checks, suggesting your mind may have been wandering.`;
    if (!improvementAreas.includes('Mindfulness and presence')) {
      improvementAreas.push('Mindfulness and presence during study');
    }
  }

  return {
    summary,
    distractionPattern: analyzeDistractionPattern(sessionData),
    focusQuality,
    recommendations: recommendations.slice(0, 4),
    focusScore: Math.min(100, Math.max(0, efficiency)),
    peakFocusHours: estimatePeakHours(sessionData),
    improvementAreas: improvementAreas.slice(0, 3),
    strengths,
  };
}

function analyzeDistractionPattern(sessionData: any): string {
  const { tabSwitchCount, distractionSeconds, presenceFailCount, presenceFailSeconds, wallClockSeconds, efficiencyScore } = sessionData;
  
  const patterns: string[] = [];
  
  if (tabSwitchCount > wallClockSeconds / 120) {
    patterns.push('High frequency tab switching suggests digital temptation or anxiety-driven browsing');
  }
  
  if (presenceFailCount > wallClockSeconds / 600) {
    patterns.push('Frequent presence check failures indicate mind-wandering or fatigue');
  }
  
  if (distractionSeconds / wallClockSeconds > 0.3) {
    patterns.push('Significant distraction time suggests environmental triggers or external interruptions');
  }
  
  if (efficiencyScore >= 80 && tabSwitchCount < 3) {
    patterns.push('Minimal distractions - user demonstrated strong self-control and environment management');
  }
  
  if (patterns.length === 0) {
    if (efficiencyScore >= 60) {
      return 'Consistent focus with occasional brief distractions. User maintained reasonable concentration.';
    }
    return 'Scattered attention pattern. Multiple factors contributing to reduced focus.';
  }
  
  return patterns.join('. ') + '.';
}

function estimatePeakHours(sessionData: any): string {
  const hour = new Date(sessionData.startTime || Date.now()).getHours();
  
  if (hour >= 6 && hour < 10) {
    return 'Early morning (6 AM - 10 AM) - Fresh mind, optimal for difficult material';
  } else if (hour >= 10 && hour < 14) {
    return 'Late morning (10 AM - 2 PM) - Peak cognitive performance typically';
  } else if (hour >= 14 && hour < 17) {
    return 'Afternoon (2 PM - 5 PM) - Post-lunch dip possible, but still productive';
  } else if (hour >= 17 && hour < 21) {
    return 'Evening (5 PM - 9 PM) - Variable focus, depends on daily energy';
  } else {
    return 'Night sessions - May work for some, but generally not recommended';
  }
}
