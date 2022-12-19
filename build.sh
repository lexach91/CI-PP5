set -o errexit
pip install -r requirements.txt
python backend/manage.py collectstatic --noinput
python backend/manage.py makemigrations && python backend/manage.py migrate
cd frontend && npm install && npm run build && npm run postbuild && npm run sitemap && cd ..