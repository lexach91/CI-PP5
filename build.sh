set -o errexit
cd frontend && rm -rf node_modules && rm -rf package-lock.json && npm cache clean --force && npm install && npm run build
cd .. && pip install -r requirements.txt
python backend/manage.py collectstatic --noinput
python backend/manage.py makemigrations && python backend/manage.py migrate