release: cd backend && python3 manage.py migrate && cd ../frontend && npm run build
web: daphne backend.backend.asgi:application --port $PORT --bind 0.0.0.0 -v2
worker: python3 backend/manage.py runworker -v2 channel_layer