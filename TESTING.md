# TESTING

## Manual Testing

Testing was done throughout site development, for each feature before it was merged into the master file.

Usability was tested with the below user acceptance testing to ensure testing from different users, on different devices and browsers to ensure issues were caught and where possible fixed during development. However, it was noticed that in Chinese browsers (Breeno, QQ, etc) there was some difficulty with the testing, as the browser would not be able to display React components correctly.

| Page    | User Actions           | Expected Results | Y/N | Comments    |
|-------------|------------------------|------------------|------|-------------|
| Sign Up     |                        |                  |      |             |
| 1 | Click Register button in nav bar | Redirect to register page | Y   |             |
| 2 | Click login in "Already have an account?" section | Redirect to login page | Y   |             |
| 3 | Click login in "Don't have an account?" section | Redirect to login page | Y   |             |
| 4 | Fill in all fields in the register page | Successfully register, email notification, redirect to login | Y   |             |
| Login      |                        |                  |      |             |
| 1 | Click Login button in nav bar | Redirect to login page | Y   |             |
| 2 | Fill in all fields in the login page | Successfully login, redirect to home page | Y   |             |
| 3 | Click logout in nav bar | Redirect to login page | Y   |             |
| 4 | Click forgot password in nav bar | Redirect to forgot password page | Y   |             |
| 5 | Fill in all fields in the forgot password page | Alert email be sent, and email with confirmation link, redirect to login page | Y   |             |
| 6 | User confirms link in email | Redirect to reset password page | Y   |             |