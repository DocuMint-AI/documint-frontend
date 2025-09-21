"""
Test script to validate the backend setup
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all modules can be imported"""
    print("Testing imports...")
    
    try:
        from config import config
        print("✓ Config imported successfully")
    except Exception as e:
        print(f"✗ Config import failed: {e}")
        return False
    
    try:
        from auth.utils import hash_password, verify_password
        print("✓ Auth utils imported successfully")
    except Exception as e:
        print(f"✗ Auth utils import failed: {e}")
        return False
    
    try:
        from documents.parser import DocumentParser
        print("✓ Document parser imported successfully")
    except Exception as e:
        print(f"✗ Document parser import failed: {e}")
        return False
    
    try:
        from documents.storage import DocumentStorage
        print("✓ Document storage imported successfully")
    except Exception as e:
        print(f"✗ Document storage import failed: {e}")
        return False
    
    try:
        from ai.prompts import get_analysis_prompt, get_qa_prompt
        print("✓ AI prompts imported successfully")
    except Exception as e:
        print(f"✗ AI prompts import failed: {e}")
        return False
    
    return True

def test_auth_utils():
    """Test authentication utilities"""
    print("\nTesting auth utilities...")
    
    try:
        from auth.utils import hash_password, verify_password
        
        password = "test_password"
        hashed = hash_password(password)
        
        if verify_password(password, hashed):
            print("✓ Password hashing and verification works")
        else:
            print("✗ Password verification failed")
            return False
            
        if not verify_password("wrong_password", hashed):
            print("✓ Wrong password correctly rejected")
        else:
            print("✗ Wrong password incorrectly accepted")
            return False
            
    except Exception as e:
        print(f"✗ Auth utils test failed: {e}")
        return False
    
    return True

def test_document_parser():
    """Test document parser validation"""
    print("\nTesting document parser...")
    
    try:
        from documents.parser import DocumentParser
        
        # Test file extension validation
        ext = DocumentParser.get_file_extension("test.pdf")
        if ext == "pdf":
            print("✓ File extension extraction works")
        else:
            print(f"✗ File extension extraction failed: got {ext}")
            return False
        
        # Test file validation with non-existent file
        is_valid, msg = DocumentParser.validate_file("non_existent.pdf")
        if not is_valid and "does not exist" in msg:
            print("✓ File validation correctly rejects non-existent files")
        else:
            print(f"✗ File validation failed: {msg}")
            return False
            
    except Exception as e:
        print(f"✗ Document parser test failed: {e}")
        return False
    
    return True

def test_prompts():
    """Test prompt generation"""
    print("\nTesting prompt generation...")
    
    try:
        from ai.prompts import get_analysis_prompt, get_qa_prompt
        
        doc_text = "This is a test document."
        analysis_prompt = get_analysis_prompt(doc_text, "test_doc_id")
        
        if "test document" in analysis_prompt and "JSON" in analysis_prompt:
            print("✓ Analysis prompt generation works")
        else:
            print("✗ Analysis prompt generation failed")
            print(f"Debug - prompt contains 'test document': {'test document' in analysis_prompt}")
            print(f"Debug - prompt contains 'JSON': {'JSON' in analysis_prompt}")
            print(f"Debug - first 200 chars: {analysis_prompt[:200]}")
            return False
        
        qa_prompt = get_qa_prompt(doc_text, "What is this document about?")
        
        if "test document" in qa_prompt and "What is this document about?" in qa_prompt:
            print("✓ Q&A prompt generation works")
        else:
            print("✗ Q&A prompt generation failed")
            return False
            
    except Exception as e:
        print(f"✗ Prompt generation test failed: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("DocuMint Backend Test Suite")
    print("=" * 30)
    
    tests = [
        test_imports,
        test_auth_utils,
        test_document_parser,
        test_prompts
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"✗ Test {test.__name__} crashed: {e}")
            failed += 1
    
    print(f"\n{'=' * 30}")
    print(f"Test Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("✓ All tests passed! Backend setup looks good.")
        return True
    else:
        print("✗ Some tests failed. Check the setup.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)