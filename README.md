<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

</p>

## Description

Coding challenge for MediaPark.
<br>

## API documentation
https://my-api-001.herokuapp.com/api/

## Deployment instructions
<p>
  <a href="http://heroku.com/" target="blank"><img src="https://blackdeerdev.com/wp-content/uploads/2021/02/Heroku.png" width="160" alt="Heroku Logo" /></a>
</p>
<i>Hosting provider - heroku.com</i>

1) If Procfile does not exist, create it in the api folder (root directory).
2) In Procfile add - ```web: npm run start:prod ```
3) In Heroku main dashboard, create a new app.
4) Go to app 'Overview' -> '<u>Configure Add-ons</u>'.
5) Search for 'Heroku Postgres' and attach it as the database.
6) In the app dashboard go to 'Deploy'.
7) Connect to your Github account and search for the repository. (if the repo is not yours, fork it on your own account)
8) Scroll down to 'Manual deploy', choose the branch you want to deploy and click 'Deploy Branch'.
<p>App should be deployed and woking!</p>
