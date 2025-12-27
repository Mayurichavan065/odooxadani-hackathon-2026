"""
Comprehensive API endpoint tester for GearGuard
Tests all endpoints and reports detailed results
"""
import urllib.request
import json
import sys

def test_endpoint(url, method='GET', data=None):
    """Test a single endpoint and return status"""
    try:
        if data:
            data = json.dumps(data).encode('utf-8')
            req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method=method)
        else:
            req = urllib.request.Request(url, method=method)
        
        response = urllib.request.urlopen(req, timeout=5)
        content = response.read().decode('utf-8')
        
        return {
            'status': 'OK',
            'code': response.getcode(),
            'content_length': len(content),
            'response': content[:200] if len(content) > 200 else content
        }
    except urllib.error.HTTPError as e:
        return {
            'status': 'HTTP_ERROR',
            'code': e.code,
            'error': str(e)
        }
    except Exception as e:
        return {
            'status': 'ERROR',
            'error': str(e)
        }

print("="*60)
print("GearGuard API Endpoint Test")
print("="*60)

# Base URL
base = 'http://127.0.0.1:8000'

# Test endpoints
endpoints = [
    ('API Root', f'{base}/api/', 'GET'),
    ('Equipment List', f'{base}/api/equipment/', 'GET'),
    ('Teams List', f'{base}/api/teams/', 'GET'),
    ('Requests List', f'{base}/api/requests/', 'GET'),
    ('Calendar', f'{base}/api/calendar/', 'GET'),
]

results = []
for name, url, method in endpoints:
    print(f"\nTesting: {name}")
    print(f"URL: {url}")
    result = test_endpoint(url, method)
    results.append((name, result))
    
    if result['status'] == 'OK':
        print(f"✅ SUCCESS - HTTP {result['code']}")
        print(f"Response length: {result['content_length']} bytes")
        if result['content_length'] < 500:
            print(f"Response: {result['response']}")
    else:
        print(f"❌ FAILED - {result['status']}")
        print(f"Error: {result.get('error', 'Unknown')}")

# Summary
print("\n" + "="*60)
print("SUMMARY")
print("="*60)
success_count = sum(1 for _, r in results if r['status'] == 'OK')
total_count = len(results)
print(f"Passed: {success_count}/{total_count}")

if success_count == total_count:
    print("\n✅ All APIs are working! Frontend can connect.")
    sys.exit(0)
else:
    print("\n❌ Some APIs failed. Check errors above.")
    sys.exit(1)
