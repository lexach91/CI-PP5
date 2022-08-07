import datetime
from datetime import date
from django.db import models
from django.contrib.auth.models import User, AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from cloudinary.models import CloudinaryField


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, birth_date=None, first_name=None, last_name=None, country=None):
        if not email:
            raise ValueError('Users must have an email address')
        if not password:
            raise ValueError('Users must have a password')
        if not birth_date:
            raise ValueError('Users must have a birth date')
        if not first_name:
            raise ValueError('Users must have a first name')
        if not last_name:
            raise ValueError('Users must have a last name')
        if not country:
            raise ValueError('Users must have a country')
        

        user = self.model(
            email=self.normalize_email(email),
            birth_date=birth_date,
            first_name=first_name,
            last_name=last_name,
            country=country,
        )

        user.set_password(password)
        user.is_superuser = False
        user.is_staff = False        
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password, birth_date, first_name, last_name, country):
        print(email, password, birth_date, first_name, last_name, country)
        if not email:
            raise ValueError('Users must have an email address')
        if not password:
            raise ValueError('Users must have a password')
        if not birth_date:
            raise ValueError('Users must have a birth date')
        if not first_name:
            raise ValueError('Users must have a first name')
        if not last_name:
            raise ValueError('Users must have a last name')
        if not country:
            raise ValueError('Users must have a country')
        
        user = self.model(
            email=self.normalize_email(email),
            birth_date=birth_date,
            first_name=first_name,
            last_name=last_name,
            country=country,
        )
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user


class User(AbstractUser):
    avatar = CloudinaryField(
        'avatar',
        folder='cloud_meetings_avatars',
        null=True,
        blank=True,
    )
    email = models.EmailField(max_length=254, unique=True)
    username = None
    birth_date = models.DateField()
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)    
    country = models.CharField(max_length=50)
    camera_id = models.CharField(max_length=100, null=True, blank=True)
    microphone_id = models.CharField(max_length=100, null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['birth_date', 'first_name', 'last_name', 'country']
    
    objects = UserManager()
    
    def __str__(self):
        return f'{self.first_name} {self.last_name}'
    
    def age(self):
        today = date.today()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
    

