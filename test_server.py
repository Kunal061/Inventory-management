#!/usr/bin/env python3

import socket
import subprocess
import sys

def check_port(host, port):
    """Check if a port is open on the given host"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(5)
    result = sock.connect_ex((host, port))
    sock.close()
    return result == 0

def run_command(command):
    """Run a shell command and return the output"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except Exception as e:
        return "", str(e), 1

def main():
    print("=== Server Diagnostic Tool ===")
    print()
    
    # Get server IP
    stdout, stderr, code = run_command("hostname -I")
    if code == 0:
        ip = stdout.strip().split()[0]
        print(f"Server IP: {ip}")
    else:
        print("Could not determine server IP")
        return
    
    print()
    
    # Check if port 5200 is open locally
    print("Checking if port 5200 is listening locally...")
    stdout, stderr, code = run_command("sudo netstat -tlnp | grep :5200")
    if code == 0 and stdout:
        print("✅ Port 5200 is listening:")
        print(stdout)
    else:
        print("❌ Port 5200 is NOT listening")
        if stderr:
            print(f"Error: {stderr}")
    
    print()
    
    # Check Nginx status
    print("Checking Nginx status...")
    stdout, stderr, code = run_command("sudo systemctl is-active nginx")
    if code == 0 and stdout.strip() == "active":
        print("✅ Nginx is running")
    else:
        print("❌ Nginx is NOT running")
        # Try to get more details
        stdout, stderr, code = run_command("sudo systemctl status nginx --no-pager | head -10")
        if code == 0:
            print("Nginx status details:")
            print(stdout)
    
    print()
    
    # Check local access
    print("Testing local access to port 5200...")
    stdout, stderr, code = run_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5200")
    if code == 0:
        status_code = stdout.strip()
        if status_code.startswith('2') or status_code.startswith('3'):
            print(f"✅ Local access successful (HTTP {status_code})")
        else:
            print(f"⚠️  Local access returned HTTP {status_code}")
    else:
        print("❌ Local access failed")
        if stderr:
            print(f"Error: {stderr}")
    
    print()
    
    # Check firewall
    print("Checking firewall status...")
    stdout, stderr, code = run_command("command -v ufw && sudo ufw status")
    if code == 0 and stdout:
        print("Firewall status:")
        print(stdout)
    else:
        print("UFW firewall not found or not active")
    
    print()
    print("=== End Diagnostic ===")

if __name__ == "__main__":
    main()