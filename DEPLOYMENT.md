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

## Render Deployment

### Create Database on ElephantSQL

1. Go to [ElephantSQL](https://www.elephantsql.com/) and create a new account.

2. Create a new instance of the database.

3. Select a name for your database and select the free plan.

4. Click "Select Region"

5. Select a region close to you.

6. Click "Review"

7. Click "Create Instance"

8. Click on the name of your database to open the dashboard.

9. You will see the dashboard of your database. You will need the URL of your database to connect it to your Django project.

### Create a new app on Render

Link to the deployed application on Render: [Cool School](https://cool-school.onrender.com/)

1. Create a new Render account if you don't already have one here [Render](https://render.com/).

2. Create a new application on the following page here [New Render App](https://dashboard.render.com/), choose **Webserver**:

3. Select the GitHub option and connect the application to the repository you created.

4. Search for the repository you created and click "Connect."

5. Create name for the application

6. Select the region where you want to deploy the application.

7. Select branch to deploy.

8. Select environment.

9. Render build command: `./build.sh`

10. Render start command: `daphne <NAME OF YOUR APP>.asgi:application --port $PORT --bind 0.0.0.0 -v2` + You can delete `Procfile` from your repository.

11. Select Free plan.

12. Click on "Advanced" settings.

13. Add the following environment variables:

    | Key      | Value          |
    |-------------|-------------|
    | WEB_CONCURRENCY | 4 |
    | DATABASE_URL | ************* |
    | SECRET_KEY | ************* |
    | DEBUG | False |
    | EMAIL_HOST_USER | ************* |
    | EMAIL_HOST_PASSWORD | ************* |
    | DISABLE_COLLECTSTATIC | 1 |
    | CLOUDINARY_URL | ************* |
    | CLOUDINARY_CLOUD_NAME | ************* |
    | CLOUDINARY_API_KEY | ************* |
    | CLOUDINARY_API_SECRET | ************* |
    | STRIPE_CURRENCY | ************* |
    | STRIPE_PUBLIC_KEY | ************* |
    | STRIPE_SECRET_KEY | ************* |
    | STRIPE_ENDPOINT_SECRET | ************* |

    *DATABASE_URL value is takes from ElephantSQL dashboard, SECRET_KEY value is takes from your local env.py file, DEBUG value is set to False, EMAIL_HOST_USER and EMAIL_HOST_PASSWORD values are takes from your Gmail account. STRIPE_CURRENCY, STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, STRIPE_ENDPOINT_SECRET values are takes from your Stripe account. CLOUDINARY_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET values are takes from your Cloudinary account.*


14. Open VS Code and create a new file called `build.sh` in the root directory of your project.

15. Copy the following code into the `build.sh` file:

    ```bash
    set -o errexit
    npm run heroku-prebuild
    pip install -r requirements.txt
    python backend/manage.py collectstatic --noinput
    python backend/manage.py makemigrations && python backend/manage.py migrate
    ```

    -*pip install -r requirements.txt installs the packages detailed in your requirements.txt file.*
    - *python manage.py collectstatic collects all static files to allow them to be served in the production environment.*
    - *The –noinput flag allows the command to run with no additional input from the deploying developer.*
    - *python manage.py makemigrations && python manage.py migrate are run to ensure all migrations are made to your production database.*

16. Save the file `build.sh`.

17. Go to `settings.py` file and add the following code to add Render.com to allowed hosts:

    ```python
        RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
        if RENDER_EXTERNAL_HOSTNAME:
            ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)
    ```

   *If you have heroku in your allowed hosts, delete it*

18. Save the file `settings.py`.

19. Go to `env.py` and change to DATEBASE_URL value to the one you got from ElephantSQL.

    ```python
        os.environ["DATABASE_URL"] = '*************'
    ```

20. Create a superuser for your database.

    ```bash
        python manage.py createsuperuser
    ```

21. Commit and push the changes to GitHub.

22. Go back to Render and click "Create Web Service."


23. Wait for the completion of the deployment.