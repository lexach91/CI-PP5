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
| Navbar |                        |                  |      |             |
| 1 | Click home in nav bar | Redirect to home page | Y   |             |
| 2 | Click pricing in nav bar | Redirect to pricing page | Y   |             |
| 3 | Click contact in nav bar | Redirect to contact form page | Y   |             |
| 4 | Click login in nav bar | Redirect to login page | Y   |             |
| 5 | Click register in nav bar | Redirect to register page | Y   |             |
| Navbar for logged in users |                        |                  |      |             |
| 1 | Click profile with user's name buttons | Sidebar with user's profile | Y   |             |
| 2 | Click logout in nav bar | Redirect to login page | Y   |             |
| Sidebar |                        |                  |      |             |
| 1 | Click home in sidebar | Redirect to user's dashboard home page | Y   |             |
| 2 | Click profile in sidebar | Redirect to user's profile page | Y   |             |
| 3 | click settings in sidebar | Redirect to user's settings page | Y   |             |
| 4 | Click Create room in sidebar | Redirect to create room page | Y   | This button is visible only to users who have purchased a subscription |