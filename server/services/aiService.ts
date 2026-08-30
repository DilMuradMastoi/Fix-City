import { GoogleGenAI, Type } from '@google/genai';
import { IssueCategory, IssuePriority } from '../db';

export interface AIAssessmentResult {
  category: IssueCategory;
  priority: IssuePriority;
  suggestedTitle: string;
  suggestedDescription: string;
  severityReasoning: string;
  confidenceScore: number;
  tags: string[];
}

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const CATEGORIES: IssueCategory[] = [
  'Garbage',
  'Road Damage',
  'Street Light',
  'Water Leakage',
  'Infrastructure',
  'Environment',
  'Traffic',
  'Safety',
  'Other',
];

export async function analyzeIssueWithAI(params: {
  imageBase64?: string;
  mimeType?: string;
  userHint?: string;
  locationAddress?: string;
}): Promise<AIAssessmentResult> {
  const { imageBase64, mimeType = 'image/jpeg', userHint = '', locationAddress = '' } = params;
  const client = getAIClient();

  if (client) {
    try {
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      if (imageBase64) {
        // Strip data:image/...;base64, prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        });
      }

      const promptText = `
You are the AI engine for FixMyCity AI, an advanced civic issue management platform.
Analyze this civic issue photo / user input.
Allowed Categories: ${CATEGORIES.join(', ')}
Allowed Priorities: Low, Medium, High, Critical

User hint / raw note: "${userHint}"
Location context: "${locationAddress}"

Return a JSON object with:
- category: exactly one of [Garbage, Road Damage, Street Light, Water Leakage, Infrastructure, Environment, Traffic, Safety, Other]
- priority: exactly one of [Low, Medium, High, Critical]
- suggestedTitle: A concise, impactful headline (max 10 words)
- suggestedDescription: A clear, professional, objective municipal report description (2-3 sentences) detailing the observed hazard, impact on pedestrians or traffic, and recommended municipal urgency.
- severityReasoning: 1 sentence explaining why this priority was assigned.
- confidenceScore: number between 0.75 and 0.99
- tags: array of 3-5 relevant civic keywords
`;

      parts.push({ text: promptText });

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: {
          parts,
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              priority: { type: Type.STRING },
              suggestedTitle: { type: Type.STRING },
              suggestedDescription: { type: Type.STRING },
              severityReasoning: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['category', 'priority', 'suggestedTitle', 'suggestedDescription', 'severityReasoning', 'confidenceScore'],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        const validCategory = CATEGORIES.includes(parsed.category as IssueCategory)
          ? (parsed.category as IssueCategory)
          : 'Other';
        const validPriority = ['Low', 'Medium', 'High', 'Critical'].includes(parsed.priority)
          ? (parsed.priority as IssuePriority)
          : 'Medium';

        return {
          category: validCategory,
          priority: validPriority,
          suggestedTitle: parsed.suggestedTitle || 'Civic Infrastructure Incident',
          suggestedDescription: parsed.suggestedDescription || 'Reported civic issue requiring municipal inspection and remediation.',
          severityReasoning: parsed.severityReasoning || 'Assessed based on public safety impact.',
          confidenceScore: Math.min(0.99, Math.max(0.7, parsed.confidenceScore || 0.92)),
          tags: Array.isArray(parsed.tags) ? parsed.tags : ['Civic', 'Municipal', 'FixMyCity'],
        };
      }
    } catch (err) {
      console.warn('Gemini AI analysis encountered an issue, falling back to smart heuristic classifier:', err);
    }
  }

  // Smart Heuristic Fallback Classifier
  return generateSmartHeuristicAssessment(userHint, locationAddress);
}

function generateSmartHeuristicAssessment(hint: string, location: string): AIAssessmentResult {
  const lower = (hint + ' ' + location).toLowerCase();

  let category: IssueCategory = 'Other';
  let priority: IssuePriority = 'Medium';
  let title = 'Civic Maintenance Requirement';
  let desc = 'A community issue has been logged and queued for city inspection.';
  let reason = 'Standard municipal triage applied.';
  let tags = ['Civic', 'Community', 'Inspection'];

  if (lower.includes('pothole') || lower.includes('road') || lower.includes('asphalt') || lower.includes('crack') || lower.includes('tarmac')) {
    category = 'Road Damage';
    priority = lower.includes('deep') || lower.includes('huge') || lower.includes('car') ? 'High' : 'Medium';
    title = 'Hazardous Pothole and Pavement Deterioration';
    desc = 'Severe surface deterioration observed on roadway creating traffic obstruction and potential vehicle alignment damage.';
    reason = 'Road damage poses direct risk to vehicular safety and smooth transit.';
    tags = ['Pothole', 'Roads', 'PublicWorks', 'Asphalt'];
  } else if (lower.includes('trash') || lower.includes('garbage') || lower.includes('waste') || lower.includes('dump') || lower.includes('bin') || lower.includes('litter')) {
    category = 'Garbage';
    priority = 'Medium';
    title = 'Accumulated Waste and Overflowing Receptacle';
    desc = 'Excessive uncollected refuse located in public area causing sanitary concerns, odor, and sidewalk impediment.';
    reason = 'Public health and sanitation priority.';
    tags = ['Sanitation', 'WasteManagement', 'CleanCity'];
  } else if (lower.includes('light') || lower.includes('lamp') || lower.includes('dark') || lower.includes('pole') || lower.includes('bulb')) {
    category = 'Street Light';
    priority = 'Medium';
    title = 'Non-Operational Public Street Light';
    desc = 'Overhead street lamp is extinguished during night hours, creating a low-visibility corridor for pedestrians and motorists.';
    reason = 'Dark areas significantly reduce nighttime pedestrian security.';
    tags = ['Lighting', 'Electrical', 'PublicSafety'];
  } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('flood') || lower.includes('drain')) {
    category = 'Water Leakage';
    priority = lower.includes('burst') || lower.includes('flood') ? 'Critical' : 'High';
    title = 'Pressurized Water Line Leakage';
    desc = 'Active water runoff leaking from municipal supply line or damaged storm drain, eroding adjacent pavement.';
    reason = 'Active water leaks cause rapid infrastructural erosion and water loss.';
    tags = ['WaterSupply', 'Plumbing', 'Erosion', 'CriticalUtility'];
  } else if (lower.includes('signal') || lower.includes('traffic') || lower.includes('crosswalk') || lower.includes('jam') || lower.includes('sign')) {
    category = 'Traffic';
    priority = 'High';
    title = 'Traffic Control Signal Malfunction';
    desc = 'Defective intersection signaling equipment causing vehicular congestion and dangerous pedestrian crossing conditions.';
    reason = 'Intersection safety requires immediate municipal department intervention.';
    tags = ['TrafficControl', 'Signaling', 'Crosswalk'];
  } else if (lower.includes('tree') || lower.includes('branch') || lower.includes('park') || lower.includes('pollution') || lower.includes('plant')) {
    category = 'Environment';
    priority = 'Low';
    title = 'Environmental Hazard & Park Maintenance Needed';
    desc = 'Fallen botanical debris or neglected greenery obstructing community public park pathways.';
    reason = 'Public park accessibility and urban greenery maintenance.';
    tags = ['Parks', 'UrbanGreenery', 'Environment'];
  } else if (lower.includes('danger') || lower.includes('hazard') || lower.includes('fire') || lower.includes('wire') || lower.includes('exposed')) {
    category = 'Safety';
    priority = 'Critical';
    title = 'Urgent Public Safety Hazard';
    desc = 'Exposed hazard detected in accessible pedestrian area posing immediate risk to citizens.';
    reason = 'Immediate life-safety risk detected.';
    tags = ['Emergency', 'PublicSafety', 'ImmediateAction'];
  }

  return {
    category,
    priority,
    suggestedTitle: title,
    suggestedDescription: desc,
    severityReasoning: reason,
    confidenceScore: 0.88,
    tags,
  };
}
