import jwt, datetime
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from profiles.models import User


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth = get_authorization_header(request).split()
        
        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            id = decode_access_token(token)
            
            user = User.objects.get(pk=id)
            
            return user            
            
        
        raise exceptions.AuthenticationFailed('Unauthenticated')
            


def create_access_token(user_id):
    """
    Creates an access token for a user.
    """    
    return jwt.encode({
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=5),
        'iat': datetime.datetime.utcnow()
    }, 'access_secret', algorithm='HS256')
    
    
def create_refresh_token(user_id):
    """
    Creates a refresh token for a user.
    """
    return jwt.encode({
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow()
    }, 'refresh_secret', algorithm='HS256')
    
    
def decode_access_token(token):
    """
    Decodes an access token.
    """
    try:
        payload = jwt.decode(token, 'access_secret', algorithms=['HS256'])
        return payload['user_id']
    except:
        raise exceptions.AuthenticationFailed('Unauthenticated')
    
    
def decode_refresh_token(token):
    """
    Decodes a refresh token.
    """
    try:
        payload = jwt.decode(token, 'refresh_secret', algorithms=['HS256'])
        return payload['user_id']
    except:
        raise exceptions.AuthenticationFailed('Unauthenticated')
