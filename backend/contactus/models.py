from django.db import models
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings


class ContactUs(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=100)
    message = models.TextField()
    
    def __str__(self):
        return self.name + ' - ' + self.subject
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Send email to the user
        subject = 'Thank you for contacting us'
        html_message = render_to_string('contactus/contactus_email.html', {'name': self.name, 'subject': self.subject})
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email="dr.meetings@hotmail.com",
            recipient_list=[self.email],
            html_message=html_message,
        )


class NewsletterSubscription(models.Model):
    email = models.EmailField()
    
    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Send email to the user
        subject = 'Thank you for subscribing to our newsletter'
        unsubscribe_url = settings.BASE_URL + '/unsubscribe/' + self.email
        html_message = render_to_string('contactus/newsletter_email.html', {'link': unsubscribe_url})
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email="dr.meetings@hotmail.com",
            recipient_list=[self.email],
            html_message=html_message,
        )
        
    def delete(self, *args, **kwargs):
        # Send email to the user
        subject = 'You have been unsubscribed from our newsletter'
        html_message = render_to_string('contactus/unsubscribe_email.html')
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email="dr.meetings@hotmail.com",
            recipient_list=[self.email],
            html_message=html_message,
        )
        super().delete(*args, **kwargs)