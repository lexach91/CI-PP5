set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py makemigrations && python manage.py migrate
cd frontend && npm install && npm run build && npm run postbuild && npm run sitemap && cd ..