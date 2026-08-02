#!/bin/bash
# 프론트엔드 서버 초기 설정 스크립트

set -e

echo "🚀 COMMUNITY_PROJECT 프론트엔드 서버 초기 설정"

# 변수 설정
DEPLOY_USER=${DEPLOY_USER:-"ark1st"}
DEPLOY_PATH=${DEPLOY_PATH:-"/home/$DEPLOY_USER/dpbr_frontend"}
NGINX_CONF="/etc/nginx/sites-available/dpbr"

# 1. 필수 패키지 설치
echo "📦 필수 패키지 설치 중..."
sudo apt-get update
sudo apt-get install -y nginx git curl

# 2. Node.js 설치
echo "📚 Node.js 설치 중..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "Node.js 버전: $(node --version)"
echo "npm 버전: $(npm --version)"

# 3. 프론트엔드 디렉토리 생성
echo "📁 프론트엔드 디렉토리 설정 중..."
sudo mkdir -p "$DEPLOY_PATH"
sudo chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$DEPLOY_PATH"

# 4. Nginx 설정
echo "⚙️  Nginx 설정 중..."

# 백엔드와 프론트엔드를 함께 제공하는 Nginx 설정
sudo tee $NGINX_CONF > /dev/null << EOF
server {
    listen 80;
    server_name _;

    # 백엔드 API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API 문서
    location /docs {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /redoc {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 프론트엔드 정적 파일
    location / {
        root $DEPLOY_PATH;
        try_files \$uri \$uri/ /index.html;

        # 캐싱 설정
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Gzip 압축 설정
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# 5. Nginx 활성화
echo "🔄 Nginx 활성화 중..."
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/dpbr
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ""
echo "🎉 프론트엔드 초기 설정이 완료되었습니다!"
echo ""
echo "배포 경로: $DEPLOY_PATH"
echo ""
echo "유용한 명령어:"
echo "  - Nginx 상태 확인: sudo systemctl status nginx"
echo "  - Nginx 재시작: sudo systemctl restart nginx"
echo "  - Nginx 로그: sudo tail -f /var/log/nginx/error.log"
echo "  - 설정 테스트: sudo nginx -t"
echo ""
echo "웹사이트 접속: http://$(hostname -I | awk '{print $1}')"
