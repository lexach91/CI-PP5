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
| Footer |                        |                  |      |             |
| 1 | Click email in footer | Opens an email client | Y   |             |
| 2 | Click phone in footer | Opens a phone client | Y   |             |
| 3 | Click contact in footer | Opens a contact form | Y   |             |
| 4 | Click Terms of Use in footer | Opens a Terms of Use page | Y   |             |
| 5 | Click Privacy Policy in footer | Opens a Privacy Policy page | Y   |             |
| 6 | Click on Facebook icon in footer | Opens a Facebook page | Y   |             |
| 7 | Click on Twitter icon in footer | Opens a Twitter page | Y   |             |
| 8 | Click on Instagram icon in footer | Opens a Instagram page | Y   |             |
| 9 | Click on LinkedIn icon in footer | Opens a LinkedIn page | Y   |             |
| 10 | Click on Newsletter in footer | Opens a Newsletter form | Y   | If user logged in, user's email is pre-filled. If user has already subscribed, user is alerted that they have already subscribed. If user subscribes, He/she will receive an email confirmation. |
| Home       |                        |                  |      |             |
| 1 | Click Learn more in the hero section | Scroll to the benefits section | Y   |             |
| 2 | Click Get Started button in the hero section | Redirect to get started page | Y   |             |
| 4 | Click See Pricing button in the hero section | Redirect to pricing page | Y   |             |
| Pricing |                        |                  |      |             |
| 1 | Click Buy now in Basic plan card | Redirect to stripe checkout page | Y   |             |
| 2 | Click Buy now in Premium plan card | Redirect to stripe checkout page | Y   |             |
| 3 | Click Buy now in Enterprise plan card | Redirect to stripe checkout page | Y   |             |
| 4 | Click Register button in the pricing page | Redirect to register page | Y   | If user logged in, this buttons does not appear |
| User Dashboard |                        |                  |      |             |
| 1 | Click on profile page in the dashboard | Redirect to user's profile page | Y   | where user can edit profile             |
| 2 | Click on settings page in the dashboard | Redirect to user's settings page | Y   | where user can edit settings             |
| 3 | Click on see subscriptions page in the dashboard | Redirect to user's subscriptions page | Y   | where user can see subscriptions             |
| 4 | Click on create meeting page in the dashboard | Redirect to create meeting page | Y   | This button is unable only if the user bought a subscription             |
| 5 | Click on the Join meeting in the dashboard | Modal window appears where the user can input the token to be allowed to join the meeting | Y   |             |
| Profile |                        |                  |      |             |
| 1 | Click on the edit button near avatar | "Choose" button will replace avatar | Y   |             |
| 2 | Click on the "Choose" avatar button | Opens a file explorer to select an avatar | Y   |             |
| 3 | Select an avatar from the file explorer | Avatar is replaced | Y   |             |
| 4 | Click on the edit button near First name | The existing First name will be replaced with the input which has a placeholder text with the existing First name | Y   |             |
| 5 | Click on the edit button near Last name | The existing Last name will be replaced with the input which has a placeholder text with the existing Last name | Y   |             |
| 6 | Click on the edit button near Birthday | The existing Birthday will be replaced with the input which has a placeholder text with the existing Birthday | Y   |             |
| 7 | Click on the edit button near country | The existing country will be replaced with the input which has a placeholder text with the existing country | Y   |             |
| 8 | Click on the edit button near password | The existing password will be replaced with the input which has a placeholder text with the existing password | Y   |             |
| 9 | Click on the save button | User's profile is updated | Y   |             |