/**
 * Schema validation and normalization for AI insights
 * Handles unpredictable LLM response formats and ensures consistent data structure
 */

export interface RawInsight {
  type?: string;
  type_of_insight?: string;
  category?: string;
  kind?: string;
  level?: string;
  intensity?: string;
  severity?: string;
  priority?: string;
  description?: string;
  text?: string;
  message?: string;
  content?: string;
  recommendation?: string;
  suggestion?: string;
  advice?: string;
  color?: string;
  importance?: string;
}

export interface NormalizedInsight {
  type: 'Risk' | 'Compliance' | 'Suggestion' | 'Standard' | 'Legal' | 'Info';
  level: 'Low' | 'Medium' | 'High';
  text: string;
  color: 'red' | 'yellow' | 'green' | 'blue' | 'gray';
  recommendation?: string;
}

export interface RawAnalysis {
  insights?: any[];
  analysis?: any[];
  findings?: any[];
  results?: any[];
  summary?: string;
  description?: string;
  overview?: string;
  riskScore?: number;
  risk_score?: number;
  complianceScore?: number;
  compliance_score?: number;
  document_analysis?: {
    document_type?: any;
    total_insights?: number;
    generic_insights_count?: number;
    specific_insights_count?: number;
  };
  analysis_method?: string;
  [key: string]: any;
}

export interface NormalizedAnalysis {
  insights: NormalizedInsight[];
  summary: string;
  riskScore: number;
  complianceScore: number;
}

/**
 * Normalize a single insight from various possible formats
 */
export const normalizeInsight = (raw: any): NormalizedInsight => {
  if (!raw || typeof raw !== 'object') {
    return createFallbackInsight('Invalid insight format received');
  }

  try {
    // Extract type with multiple fallbacks
    const type = normalizeType(
      raw.type || raw.type_of_insight || raw.category || raw.kind || 'info'
    );
    
    // Extract level with multiple fallbacks
    const level = normalizeLevel(
      raw.level || raw.intensity || raw.severity || raw.priority || raw.importance || 'medium'
    );
    
    // Extract text with multiple fallbacks and clean markdown
    let text = String(
      raw.description || raw.text || raw.message || raw.content || 'No description available'
    ).trim();
    
    // Remove markdown formatting
    text = text
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove **bold**
      .replace(/\*([^*]+)\*/g, '$1')      // Remove *italic*
      .replace(/__([^_]+)__/g, '$1')      // Remove __bold__
      .replace(/_([^_]+)_/g, '$1')        // Remove _italic_
      .replace(/^\*\*\s*/, '')            // Remove leading **
      .replace(/\s*\*\*$/, '')            // Remove trailing **
      .trim();
    
    // Auto-assign color based on type and level
    const color = assignColor(type, level);
    
    // Extract recommendation and clean markdown
    let recommendation = raw.recommendation || raw.suggestion || raw.advice || undefined;
    if (recommendation) {
      recommendation = String(recommendation)
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove **bold**
        .replace(/\*([^*]+)\*/g, '$1')      // Remove *italic*
        .replace(/__([^_]+)__/g, '$1')      // Remove __bold__
        .replace(/_([^_]+)_/g, '$1')        // Remove _italic_
        .replace(/^\*\*\s*/, '')            // Remove leading **
        .replace(/\s*\*\*$/, '')            // Remove trailing **
        .trim();
    }
    
    return {
      type,
      level,
      text: text || 'No description available',
      color,
      recommendation
    };
  } catch (error) {
    console.warn('Error normalizing insight:', error, raw);
    return createFallbackInsight('Failed to process insight');
  }
};

/**
 * Normalize document analysis response from various possible formats
 */
export const normalizeAnalysis = (rawData: any): NormalizedAnalysis => {
  if (!rawData || typeof rawData !== 'object') {
    return createFallbackAnalysis('Invalid analysis format received');
  }

  try {
    // Extract insights array from various possible locations
    const rawInsights = 
      rawData.insights || 
      rawData.analysis || 
      rawData.findings || 
      rawData.results ||
      (Array.isArray(rawData) ? rawData : []);

    // Normalize insights - the new dynamic backend already provides structured insights
    const insights: NormalizedInsight[] = [];
    if (Array.isArray(rawInsights)) {
      rawInsights.forEach(insight => {
        try {
          insights.push(normalizeInsight(insight));
        } catch (error) {
          console.warn('Skipping invalid insight:', insight, error);
        }
      });
    }

    // If no valid insights found, create default ones
    if (insights.length === 0) {
      insights.push(createFallbackInsight('Analysis completed using dynamic workflow - please try uploading the document again for better results'));
    }

    // Extract summary - enhanced for dynamic analysis
    let summary = '';
    if (rawData.document_analysis?.document_type) {
      const docType = rawData.document_analysis.document_type;
      const totalInsights = rawData.document_analysis.total_insights || insights.length;
      summary = `Document identified as: ${docType.document_type || 'Legal Document'}. Generated ${totalInsights} insights through dynamic analysis workflow.`;
    } else {
      summary = String(
        rawData.summary || 
        rawData.description || 
        rawData.overview || 
        `Document analysis completed with ${insights.length} insights found.`
      ).trim();
    }

    // Calculate scores based on insight content for dynamic analysis
    let riskScore = 5;
    let complianceScore = 7;
    
    if (rawData.analysis_method === 'dynamic_workflow') {
      // Calculate scores based on insights
      const riskInsights = insights.filter(i => i.type === 'Risk');
      const complianceInsights = insights.filter(i => i.type === 'Compliance');
      const highIntensityCount = insights.filter(i => i.level === 'High').length;
      
      // Risk score: higher number of risks and high-intensity items = lower score
      riskScore = Math.max(1, 10 - (riskInsights.length * 2) - (highIntensityCount * 1.5));
      
      // Compliance score: compliance issues reduce score
      complianceScore = Math.max(1, 10 - (complianceInsights.length * 1.5) - (highIntensityCount * 1));
    } else {
      // Fallback to extracting scores from raw data
      riskScore = normalizeScore(
        rawData.riskScore || rawData.risk_score || rawData.risk || 5
      );
      
      complianceScore = normalizeScore(
        rawData.complianceScore || rawData.compliance_score || rawData.compliance || 7
      );
    }

    return {
      insights,
      summary,
      riskScore,
      complianceScore
    };
  } catch (error) {
    console.error('Error normalizing analysis:', error, rawData);
    return createFallbackAnalysis('Failed to process analysis results');
  }
};

/**
 * Normalize type string to standard categories
 */
const normalizeType = (type: any): NormalizedInsight['type'] => {
  const typeStr = String(type).toLowerCase().trim();
  
  if (typeStr.includes('risk') || typeStr.includes('danger') || typeStr.includes('threat')) {
    return 'Risk';
  }
  if (typeStr.includes('compliance') || typeStr.includes('regulation') || typeStr.includes('legal')) {
    return 'Compliance';
  }
  if (typeStr.includes('suggest') || typeStr.includes('recommend') || typeStr.includes('improve')) {
    return 'Suggestion';
  }
  if (typeStr.includes('standard') || typeStr.includes('normal') || typeStr.includes('typical')) {
    return 'Standard';
  }
  if (typeStr.includes('legal') || typeStr.includes('law') || typeStr.includes('statute')) {
    return 'Legal';
  }
  
  return 'Info';
};

/**
 * Normalize level string to standard levels
 */
const normalizeLevel = (level: any): NormalizedInsight['level'] => {
  const levelStr = String(level).toLowerCase().trim();
  
  if (levelStr.includes('high') || levelStr.includes('critical') || levelStr.includes('severe') || 
      levelStr.includes('major') || levelStr.includes('urgent') || levelStr.includes('important')) {
    return 'High';
  }
  if (levelStr.includes('low') || levelStr.includes('minor') || levelStr.includes('mild') || 
      levelStr.includes('small') || levelStr.includes('insignificant')) {
    return 'Low';
  }
  
  return 'Medium';
};

/**
 * Assign color based on type and level
 */
const assignColor = (type: NormalizedInsight['type'], level: NormalizedInsight['level']): NormalizedInsight['color'] => {
  if (type === 'Risk') {
    return level === 'High' ? 'red' : level === 'Medium' ? 'yellow' : 'yellow';
  }
  if (type === 'Compliance' || type === 'Legal') {
    return level === 'High' ? 'red' : 'yellow';
  }
  if (type === 'Suggestion') {
    return 'blue';
  }
  if (type === 'Standard') {
    return 'green';
  }
  
  return 'gray'; // Info and fallback
};

/**
 * Normalize score to 0-10 range
 */
const normalizeScore = (score: any): number => {
  const numScore = parseFloat(String(score));
  if (isNaN(numScore)) return 5; // Default neutral score
  
  // Clamp to 0-10 range
  return Math.min(10, Math.max(0, numScore));
};

/**
 * Create a fallback insight when normalization fails
 */
const createFallbackInsight = (message: string): NormalizedInsight => ({
  type: 'Info',
  level: 'Medium',
  text: message,
  color: 'gray'
});

/**
 * Create fallback analysis when normalization fails
 */
const createFallbackAnalysis = (message: string): NormalizedAnalysis => ({
  insights: [createFallbackInsight(message)],
  summary: 'Analysis completed with basic processing',
  riskScore: 5,
  complianceScore: 7
});

/**
 * Validate and clean text content
 */
export const sanitizeText = (text: any): string => {
  if (typeof text !== 'string') {
    text = String(text || '');
  }
  
  return text
    .trim()
    .replace(/\*\*([^*]+)\*\*/g, '$1')    // Remove **bold**
    .replace(/\*([^*]+)\*/g, '$1')        // Remove *italic*
    .replace(/__([^_]+)__/g, '$1')        // Remove __bold__
    .replace(/_([^_]+)_/g, '$1')          // Remove _italic_
    .replace(/^\*\*\s*/, '')              // Remove leading **
    .replace(/\s*\*\*$/, '')              // Remove trailing **
    .replace(/\s+/g, ' ')                 // Replace multiple whitespace with single space
    .substring(0, 500);                   // Limit length to prevent UI issues
};

/**
 * Helper to check if analysis response seems valid
 */
export const isValidAnalysisResponse = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  // Check if it has any recognizable analysis structure
  return !!(
    data.insights || 
    data.analysis || 
    data.findings || 
    data.results ||
    data.summary ||
    Array.isArray(data)
  );
};