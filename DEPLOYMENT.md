## Local Deployment

1. On your local machine, open a terminal window, and go to desired directory.

```bash
cd /path/to/directory
```

2. Clone the repository.

```bash
git clone https://github.com/lexach91/CI-PP5.git
```

3. Go to the cloned repository directory.

```bash
cd CI-PP5
```
4. Install dependencies.

```bash
pip install -r requirements.txt
```

5. Go to backend directory.

```bash
cd backend
```

6. Create file `env.py`.

```bash
touch env.py
```

7. Open file `env.py` in your text editor.

```bash
code env.py
```

8. Add the following lines to the file:

```python
os.environ['SECRET_KEY'] = # your secret key
os.environ['DEBUG'] = 'True'
os.environ['DEVELOPMENT'] = 'True'
os.environ["CLOUDINARY_CLOUD_NAME"] = # your cloudinary cloud name if it already exists or `null` temporarily otherwise.
os.environ["CLOUDINARY_API_KEY"] = # your cloudinary api key if it already exists or `null` temporarily otherwise.
os.environ["CLOUDINARY_API_SECRET"] = # your cloudinary api secret if it already exists or `null` temporarily otherwise.
os.environ["DATABASE_URL"] = # your database url if it already existsor `null` temporarily otherwise. Or don't add it at all if you want to use the default SQLite database.
os.environ["STRIPE_SECRET_KEY"] = # your stripe secret key if it already exists or `null` temporarily otherwise.
os.environ["STRIPE_PUBLISHABLE_KEY"] = # your stripe publishable key if it already exists or `null` temporarily otherwise.
os.environ["STRIPE_WEBHOOK_KEY"] = # your stripe webhook key if it already exists or `null` temporarily otherwise.
os.environ["BASE_URL"] = # your local url and port on which the Django server is going to be running.
```


9. Go to /subscriptions directory.

```bash
cd subscriptions
```

10. Open the file `models.py` with your text editor.

For example, I'm going to use VS Code.

```bash
code models.py
```

11. Find the model `Membership` and make the following changes:

```python
class Membership(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="membership"
    )
    is_active = models.BooleanField(default=True)
    type = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.CASCADE,
        related_name="memberships",
        default=SubscriptionPlan.objects.get(name="Free").id, # change this line to blank=True, null=True
    )
    opened_at = models.DateTimeField(auto_now_add=True)
    renewed_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    stripe_id = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.user.
```

12. Go one directory up.

```bash
cd ..
```

13. Run the command to make migrations.

```bash
python manage.py makemigrations
```

14. Run the command to migrate the database.

```bash
python manage.py migrate
```

15. Run the command to create superuser.

```bash
python manage.py createsuperuser
```

16. Go one directory up.

```bash
cd ..
```

17. Go to frontend/ directory.

```bash
cd frontend
```

18. Install dependencies.

```bash
npm install
```

19. Run the command to build the frontend.

```bash
npm run build
```

20. Go one directory up.

```bash
cd ..
```

21. Go to backend/ directory.

```bash
cd backend
```

22. Run the command to start the server.

```bash
python manage.py runserver
```

23. Open the browser and go to http://localhost:8000/admin/. Don't close the terminal window.

24. Login as superuser that you created in step 15.

25. Go to the SubscriptionPlan models page in the admin panel.

26. Add new subscription plans with desired names and prices.

27. Open the terminal window again.

28. Go to backend/subscriptions directory.

```bash
cd backend/subscriptions
```

29. Open the file `models.py` with your text editor.

```bash
code models.py
```

30. Find the model `Membership` and make the following changes:

```python
class Membership(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="membership"
    )
    is_active = models.BooleanField(default=True)
    type = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.CASCADE,
        related_name="memberships",
        blank=True, null=True, # change this line to default=SubscriptionPlan.objects.get(name="Free").id, name could be different, depending on what plans you created in step 22.
    )
    opened_at = models.DateTimeField(auto_now_add=True)
    renewed_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    stripe_id = models.CharField(max_length=255, null=True, blank=True)
```

31. Go one directory up in your terminal.

```bash
cd ..
```

32. Repeat steps 13 and 14 to make migrations and migrate the database.

33. Go to [Stripe](https://dashboard.stripe.com/register) website and create a new account if you haven't done so already.

34. At the Stripe dashboard, go to developer's page.

35. Open API keys tab.

36. Copy the `Secret Key` and `Publishable Key` and paste them in the corresponding fields in the `env.py` file.

37. Download [Stripe CLI](https://github.com/stripe/stripe-cli/releases/latest) for your OS, and install it.

- For Linux, you can use the following command:

```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.11.3/stripe_1.11.3_linux_amd64.deb && sudo gdebi stripe_1.11.3_linux_amd64.deb
```

- For other OS, follow the instructions on the [https://stripe.com/docs/stripe-cli#install](https://stripe.com/docs/stripe-cli#install) page.

38. In the terminal window, login to your Stripe account.

```bash
stripe login
```

39. Run the command to listen for webhooks locally.

```bash
stripe listen --forward-to http://localhost:8000/api/stripe-webhooks/
```

40. Go to [https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local](https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local).

41. At the top right corner, choose 'Python' as the language.

42. Find the line `endpoint_secret` and copy the key to you env.py file as `STRIPE_WEBHOOK_KEY`.

43. Go to [Cloudinary](https://cloudinary.com/) and create a new account if you haven't done so already.

44. Go to [Cloudinary console](https://cloudinary.com/console).

45. Copy the `Cloud Name`, `API Key`, and `API Secret` and paste them in the corresponding fields in the `env.py` file.

46. On your local machine, if the server is not running yet, go to backend/ directory and run the command to start the server.

```bash
python manage.py runserver
```

47. Open the browser and go to http://localhost:8000/. 

48. You can create a new user and test the website functionality now.

---