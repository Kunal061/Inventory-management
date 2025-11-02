#!/bin/bash

echo "=== Application Diagnostic Script ==="
echo "Date: $(date)"
echo "Server IP: $(hostname -I)"
echo ""

echo "=== 1. Checking if port 5200 is listening ==="
if sudo netstat -tlnp | grep -q :5200; then
    echo "✅ Port 5200 is LISTENING"
    echo "Details:"
    sudo netstat -tlnp | grep :5200
else
    echo "❌ Port 5200 is NOT LISTENING"
fi
echo ""

echo "=== 2. Checking Nginx service status ==="
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx service is RUNNING"
else
    echo "❌ Nginx service is NOT RUNNING"
    echo "Trying to get Nginx status:"
    sudo systemctl status nginx --no-pager | head -5
fi
echo ""

echo "=== 3. Checking Nginx configuration ==="
if sudo nginx -t; then
    echo "✅ Nginx configuration is VALID"
else
    echo "❌ Nginx configuration has ERRORS"
fi
echo ""

echo "=== 4. Checking application files ==="
if [ -d "/var/www/laxmi-app/dist" ] && [ -n "$(ls -A /var/www/laxmi-app/dist)" ]; then
    echo "✅ Application files are DEPLOYED"
    echo "File count: $(ls -1 /var/www/laxmi-app/dist | wc -l)"
else
    echo "❌ Application files are MISSING"
fi
echo ""

echo "=== 5. Testing local access ==="
if curl -f http://localhost:5200 >/dev/null 2>&1; then
    status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5200)
    echo "✅ Local access SUCCESSFUL (HTTP $status_code)"
else
    status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5200)
    echo "❌ Local access FAILED (HTTP $status_code)"
    echo "Error details:"
    curl -v http://localhost:5200 2>&1 | head -5
fi
echo ""

echo "=== 6. Checking firewall ==="
if command -v ufw >/dev/null 2>&1; then
    echo "UFW status:"
    sudo ufw status | head -5
else
    echo "UFW not installed"
fi
echo ""

echo "=== 7. Quick connectivity test ==="
echo "Testing connection to port 5200 from localhost:"
if timeout 5 bash -c "echo >/dev/tcp/localhost/5200" 2>/dev/null; then
    echo "✅ Port 5200 is reachable from localhost"
else
    echo "❌ Port 5200 is NOT reachable from localhost"
fi
echo ""

echo "=== Diagnostic Summary ==="
echo "To access your application externally, ensure:"
echo "1. Security Group allows inbound traffic on port 5200"
echo "2. Application files are in /var/www/laxmi-app/dist"
echo "3. Nginx is running with correct configuration"
echo "4. No firewall is blocking the port"
echo ""
echo "If all checks above pass but you still can't access externally:"
echo "   Check AWS Security Groups for your EC2 instance"
echo "   Make sure port 5200 has an inbound rule allowing your IP"