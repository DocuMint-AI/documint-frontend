"""
Text parsing engine for extracting structured insights from LLM free-text responses
"""

import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class ParsedInsight:
    type: str  # risk, compliance, suggestion, analysis
    intensity: str  # high, medium, low
    description: str
    recommendation: str
    confidence: float = 0.8

class InsightTextParser:
    """Robust parser for extracting insights from free-text LLM responses"""
    
    def __init__(self):
        # Regex patterns for different insight components
        self.patterns = {
            'risk': re.compile(r'(?:RISK|Risk):\s*(.+?)(?=\n|INTENSITY|RECOMMENDATION|$)', re.IGNORECASE | re.DOTALL),
            'compliance': re.compile(r'(?:COMPLIANCE|Compliance):\s*(.+?)(?=\n|INTENSITY|RECOMMENDATION|$)', re.IGNORECASE | re.DOTALL),
            'suggestion': re.compile(r'(?:SUGGESTION|Suggestion):\s*(.+?)(?=\n|INTENSITY|RECOMMENDATION|$)', re.IGNORECASE | re.DOTALL),
            'analysis': re.compile(r'(?:ANALYSIS|Analysis):\s*(.+?)(?=\n|INTENSITY|RECOMMENDATION|$)', re.IGNORECASE | re.DOTALL),
            'intensity': re.compile(r'(?:INTENSITY|Intensity):\s*(High|Medium|Low)', re.IGNORECASE),
            'recommendation': re.compile(r'(?:RECOMMENDATION|Recommendation):\s*(.+?)(?=\n(?:RISK|COMPLIANCE|SUGGESTION|ANALYSIS)|$)', re.IGNORECASE | re.DOTALL)
        }
        
        # Fallback patterns for less structured responses
        self.fallback_patterns = {
            'bullet_points': re.compile(r'^\s*[-•*]\s*(.+)', re.MULTILINE),
            'numbered_points': re.compile(r'^\s*\d+\.\s*(.+)', re.MULTILINE),
            'intensity_keywords': re.compile(r'\b(critical|high|significant|major|serious|important|medium|moderate|low|minor|minimal)\b', re.IGNORECASE)
        }
        
        # Keywords for determining insight type
        self.type_keywords = {
            'risk': ['risk', 'danger', 'threat', 'liability', 'exposure', 'vulnerability', 'concern', 'problem', 'issue'],
            'compliance': ['compliance', 'regulatory', 'legal', 'requirement', 'mandate', 'obligation', 'violation', 'breach'],
            'suggestion': ['suggest', 'recommend', 'improve', 'enhance', 'optimize', 'consider', 'should', 'could', 'might']
        }
        
        # Intensity mapping
        self.intensity_mapping = {
            'critical': 'High',
            'high': 'High',
            'significant': 'High',
            'major': 'High',
            'serious': 'High',
            'important': 'Medium',
            'medium': 'Medium',
            'moderate': 'Medium',
            'low': 'Low',
            'minor': 'Low',
            'minimal': 'Low'
        }

    def parse_document_type(self, response_text: str) -> Dict[str, str]:
        """Parse document type detection response"""
        result = {
            'document_type': 'Unknown Document',
            'category': 'Legal',
            'confidence': 'Medium'
        }
        
        # Look for structured format first
        type_match = re.search(r'Document Type:\s*(.+)', response_text, re.IGNORECASE)
        if type_match:
            result['document_type'] = type_match.group(1).strip()
        
        category_match = re.search(r'Category:\s*(.+)', response_text, re.IGNORECASE)
        if category_match:
            result['category'] = category_match.group(1).strip()
            
        confidence_match = re.search(r'Confidence:\s*(High|Medium|Low)', response_text, re.IGNORECASE)
        if confidence_match:
            result['confidence'] = confidence_match.group(1).title()
        
        # Fallback: try to extract document type from first few lines
        if result['document_type'] == 'Unknown Document':
            lines = response_text.split('\n')[:3]
            for line in lines:
                line = line.strip()
                if line and not line.startswith('Based on') and not line.startswith('This document'):
                    # Look for common document types
                    doc_types = ['agreement', 'contract', 'policy', 'terms', 'conditions', 'lease', 'nda', 'employment']
                    for doc_type in doc_types:
                        if doc_type.lower() in line.lower():
                            result['document_type'] = line
                            break
                    break
        
        return result

    def parse_insights_from_text(self, response_text: str, default_type: str = 'suggestion') -> List[ParsedInsight]:
        """Parse insights from free-text response"""
        insights = []
        
        # Try structured parsing first
        structured_insights = self._parse_structured_format(response_text, default_type)
        if structured_insights:
            insights.extend(structured_insights)
        
        # If no structured insights found, try fallback parsing
        if not insights:
            fallback_insights = self._parse_unstructured_format(response_text, default_type)
            insights.extend(fallback_insights)
        
        # Ensure we have at least one insight
        if not insights:
            insights.append(ParsedInsight(
                type=default_type,
                intensity='Medium',
                description=self._extract_main_content(response_text),
                recommendation="Review this analysis and consider the implications for your document.",
                confidence=0.6
            ))
        
        return insights

    def _parse_structured_format(self, text: str, default_type: str) -> List[ParsedInsight]:
        """Parse text with structured RISK/COMPLIANCE/SUGGESTION format"""
        insights = []
        
        # Split text into potential insight blocks
        blocks = self._split_into_blocks(text)
        
        for block in blocks:
            insight = self._parse_single_block(block, default_type)
            if insight:
                insights.append(insight)
        
        return insights

    def _parse_single_block(self, block: str, default_type: str) -> Optional[ParsedInsight]:
        """Parse a single insight block"""
        # Extract type and description
        description = None
        insight_type = default_type
        
        for type_name, pattern in self.patterns.items():
            if type_name in ['risk', 'compliance', 'suggestion', 'analysis']:
                match = pattern.search(block)
                if match:
                    description = match.group(1).strip()
                    insight_type = type_name if type_name != 'analysis' else default_type
                    break
        
        if not description:
            return None
        
        # Clean up description - remove markdown formatting
        description = re.sub(r'\*\*([^*]+)\*\*', r'\1', description)
        description = re.sub(r'\*([^*]+)\*', r'\1', description)
        description = re.sub(r'__([^_]+)__', r'\1', description)
        description = re.sub(r'_([^_]+)_', r'\1', description)
        description = description.strip()
        
        # Extract intensity
        intensity_match = self.patterns['intensity'].search(block)
        intensity = intensity_match.group(1).title() if intensity_match else self._infer_intensity(description)
        
        # Extract recommendation
        rec_match = self.patterns['recommendation'].search(block)
        recommendation = rec_match.group(1).strip() if rec_match else "Consider reviewing this item carefully."
        # Also clean markdown from recommendation
        if recommendation:
            recommendation = re.sub(r'\*\*([^*]+)\*\*', r'\1', recommendation)
            recommendation = re.sub(r'\*([^*]+)\*', r'\1', recommendation)
            recommendation = re.sub(r'__([^_]+)__', r'\1', recommendation)
            recommendation = re.sub(r'_([^_]+)_', r'\1', recommendation)
            recommendation = recommendation.strip()
        
        return ParsedInsight(
            type=insight_type,
            intensity=intensity,
            description=description,
            recommendation=recommendation,
            confidence=0.8
        )

    def _parse_unstructured_format(self, text: str, default_type: str) -> List[ParsedInsight]:
        """Parse unstructured text using fallback methods"""
        insights = []
        
        # Try bullet points
        bullet_matches = self.fallback_patterns['bullet_points'].findall(text)
        for match in bullet_matches[:5]:  # Limit to 5 insights
            insights.append(self._create_insight_from_text(match, default_type))
        
        # Try numbered points if no bullet points
        if not insights:
            numbered_matches = self.fallback_patterns['numbered_points'].findall(text)
            for match in numbered_matches[:5]:
                insights.append(self._create_insight_from_text(match, default_type))
        
        # If still no insights, split by sentences/paragraphs
        if not insights:
            sentences = self._split_into_sentences(text)
            for sentence in sentences[:3]:  # Take first 3 substantial sentences
                if len(sentence.strip()) > 20:  # Minimum length
                    insights.append(self._create_insight_from_text(sentence, default_type))
        
        return insights

    def _create_insight_from_text(self, text: str, default_type: str) -> ParsedInsight:
        """Create an insight from a piece of text"""
        # Infer type from keywords
        insight_type = self._infer_type(text, default_type)
        
        # Infer intensity
        intensity = self._infer_intensity(text)
        
        # Clean up description - remove markdown formatting
        description = text.strip()
        # Remove markdown bold formatting
        description = re.sub(r'\*\*([^*]+)\*\*', r'\1', description)
        # Remove other markdown formatting
        description = re.sub(r'\*([^*]+)\*', r'\1', description)
        description = re.sub(r'__([^_]+)__', r'\1', description)
        description = re.sub(r'_([^_]+)_', r'\1', description)
        
        if description.endswith('.'):
            description = description[:-1]
        
        # Generate basic recommendation
        recommendation = self._generate_recommendation(insight_type, description)
        
        return ParsedInsight(
            type=insight_type,
            intensity=intensity,
            description=description,
            recommendation=recommendation,
            confidence=0.7
        )

    def _infer_type(self, text: str, default_type: str) -> str:
        """Infer insight type from text content"""
        text_lower = text.lower()
        
        for insight_type, keywords in self.type_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return insight_type
        
        return default_type

    def _infer_intensity(self, text: str) -> str:
        """Infer intensity from text content"""
        intensity_matches = self.fallback_patterns['intensity_keywords'].findall(text)
        
        if intensity_matches:
            # Take the highest intensity found
            for intensity in ['critical', 'high', 'significant', 'major', 'serious']:
                if any(match.lower() == intensity for match in intensity_matches):
                    return 'High'
            
            for intensity in ['important', 'medium', 'moderate']:
                if any(match.lower() == intensity for match in intensity_matches):
                    return 'Medium'
            
            return 'Low'
        
        # Default based on content indicators
        text_lower = text.lower()
        if any(word in text_lower for word in ['must', 'required', 'critical', 'essential', 'urgent']):
            return 'High'
        elif any(word in text_lower for word in ['should', 'recommended', 'important', 'consider']):
            return 'Medium'
        else:
            return 'Low'

    def _generate_recommendation(self, insight_type: str, description: str) -> str:
        """Generate a basic recommendation based on insight type"""
        if insight_type == 'risk':
            return "Consider mitigating this risk through contract amendments or additional safeguards."
        elif insight_type == 'compliance':
            return "Ensure compliance by consulting legal counsel and updating relevant clauses."
        else:  # suggestion
            return "Review this recommendation and consider implementing the suggested improvements."

    def _split_into_blocks(self, text: str) -> List[str]:
        """Split text into logical blocks for parsing"""
        # Split by double newlines or by structured markers
        blocks = re.split(r'\n\s*\n|(?=(?:RISK|COMPLIANCE|SUGGESTION|ANALYSIS):|^\s*[-•*]|\d+\.)', text)
        return [block.strip() for block in blocks if block.strip()]

    def _split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        sentences = re.split(r'[.!?]+', text)
        return [sentence.strip() for sentence in sentences if len(sentence.strip()) > 10]

    def _extract_main_content(self, text: str) -> str:
        """Extract the main content from a response for fallback"""
        lines = text.split('\n')
        content_lines = []
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('Based on') and not line.startswith('Document'):
                content_lines.append(line)
        
        main_content = ' '.join(content_lines)
        # Remove markdown formatting
        main_content = re.sub(r'\*\*([^*]+)\*\*', r'\1', main_content)
        main_content = re.sub(r'\*([^*]+)\*', r'\1', main_content)
        main_content = re.sub(r'__([^_]+)__', r'\1', main_content)
        main_content = re.sub(r'_([^_]+)_', r'\1', main_content)
        
        return main_content[:200] + "..." if len(main_content) > 200 else main_content