#!/bin/bash

echo "=== Application Diagnostic Script ==="
echo "Server IP: $(hostname -I)"
echo "Date: $(date)"
echo ""

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l
echo ""

echo "=== Listening Ports ==="
sudo netstat -tlnp | grep :5200 || echo "Port 5200 not found in listening ports"
echo ""

echo "=== Firewall Status ==="
if command -v ufw &> /dev/null; then
    echo "UFW Status:"
    sudo ufw status
else
    echo "UFW not installed"
fi
echo ""

echo "=== Nginx Configuration ==="
sudo nginx -T 2>/dev/null | grep -A 20 "listen 5200" || echo "No server block found for port 5200"
echo ""

echo "=== Application Files ==="
if [ -d "/var/www/laxmi-app/dist" ]; then
    echo "Application directory exists:"
    ls -la /var/www/laxmi-app/dist
else
    echo "Application directory does not exist"
fi
echo ""

echo "=== Local Access Test ==="
if curl -f http://localhost:5200 > /dev/null 2>&1; then
    echo "Local access: SUCCESS"
    echo "Response code: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5200)"
else
    echo "Local access: FAILED"
    echo "Error: $(curl -f http://localhost:5200 2>&1)"
fi
echo ""

echo "=== End Diagnostic Script ==="