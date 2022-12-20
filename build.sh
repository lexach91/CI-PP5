set -o errexit
npm run heroku-prebuild
pip install -r requirements.txt
python backend/manage.py collectstatic --noinput
python backend/manage.py makemigrations && python backend/manage.py migrate