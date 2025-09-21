"""
Test script for the new dynamic analysis workflow
"""

import asyncio
import json
from ai.dynamic_gemini_client import DynamicGeminiClient

async def test_dynamic_workflow():
    try:
        client = DynamicGeminiClient()
        
        # Sample NDA document
        sample_nda = """
        MUTUAL NON-DISCLOSURE AGREEMENT
        
        This Mutual Non-Disclosure Agreement ("Agreement") is entered into on January 15, 2024, 
        between TechCorp Inc., a Delaware corporation ("First Party"), and StartupCo LLC, 
        a California limited liability company ("Second Party").
        
        1. PURPOSE
        The parties wish to explore a potential business relationship and may need to disclose 
        confidential information to each other.
        
        2. CONFIDENTIAL INFORMATION
        "Confidential Information" means any non-public, proprietary or confidential information 
        disclosed by either party, including but not limited to technical data, trade secrets, 
        business plans, customer lists, and financial information.
        
        3. OBLIGATIONS
        Each party agrees to:
        (a) Hold all Confidential Information in strict confidence
        (b) Not disclose Confidential Information to third parties without written consent
        (c) Use Confidential Information solely for the Purpose stated above
        (d) Take reasonable precautions to protect the confidentiality
        
        4. TERM
        This Agreement shall remain in effect for three (3) years from the date of execution.
        
        5. RETURN OF INFORMATION
        Upon termination, each party shall return or destroy all Confidential Information.
        
        6. GOVERNING LAW
        This Agreement shall be governed by the laws of Delaware.
        """
        
        print("Testing dynamic workflow with sample NDA...")
        print("=" * 60)
        
        # Run dynamic analysis
        result = await client.analyze_document_dynamic("test-nda-001", sample_nda)
        
        print("ANALYSIS RESULTS:")
        print(f"Document ID: {result['doc_id']}")
        print(f"Analysis Method: {result.get('analysis_method', 'unknown')}")
        print(f"Total Insights: {len(result['insights'])}")
        
        if 'document_analysis' in result:
            doc_analysis = result['document_analysis']
            print(f"\nDOCUMENT TYPE ANALYSIS:")
            if 'document_type' in doc_analysis:
                dt = doc_analysis['document_type']
                print(f"  Type: {dt.get('document_type', 'Unknown')}")
                print(f"  Category: {dt.get('category', 'Unknown')}")
                print(f"  Confidence: {dt.get('confidence', 'Unknown')}")
            
            print(f"  Generic Insights: {doc_analysis.get('generic_insights_count', 0)}")
            print(f"  Specific Insights: {doc_analysis.get('specific_insights_count', 0)}")
        
        print(f"\nINSIGHTS BREAKDOWN:")
        insight_types = {}
        intensity_counts = {}
        
        for i, insight in enumerate(result['insights'], 1):
            insight_type = insight.get('type_of_insight', 'unknown')
            intensity = insight.get('intensity', 'unknown')
            
            insight_types[insight_type] = insight_types.get(insight_type, 0) + 1
            intensity_counts[intensity] = intensity_counts.get(intensity, 0) + 1
            
            print(f"\n  {i}. [{insight_type.upper()}] [{intensity.upper()}]")
            print(f"     {insight.get('description', 'No description')}")
            if insight.get('recommendation'):
                print(f"     → {insight['recommendation']}")
        
        print(f"\nSUMMARY STATISTICS:")
        print(f"  Types: {dict(insight_types)}")
        print(f"  Intensities: {dict(intensity_counts)}")
        
        print("\n" + "=" * 60)
        print("DYNAMIC WORKFLOW TEST COMPLETED SUCCESSFULLY!")
        
    except Exception as e:
        print(f"TEST FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_dynamic_workflow())