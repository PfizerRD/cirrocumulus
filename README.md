# cirrocumulus

## Local Usage
- Launch via the command line using the command `cirro <path to dataset>` 

## Deployment Instructions
- Create or use an existing GCP project
- Create OAuth client id 
    - In Google Console, navigate to APIs and Services > OAuth consent screen. Set the OAuth consent screen application name and add 
    PROJECT.appspot.com to the list of "Authorized domains"
    - Go to Credentials and click "Create Credentials > OAuth client ID". Enter "Web application" for "Application Type" 
    and https://PROJECT.appspot.com for "Authorized JavaScript origins". Click "Create" to create the credentials.
    - Copy OAuth client id into cumulus/config.json.
- Create App Engine by navigating to App Engine > Dashboard. You may choose the region where your application is hosted. Select the Python 3 Standard Environment.
- Install the [Google Cloud SDK](https://cloud.google.com/sdk/install)
    Type ``gcloud init`` if this is your first time using the Google Cloud SDK
- Deploy the application using the command below. Remember to replace PROJECT with your project ID.
    ``gcloud app deploy app.yaml --project=PROJECT``
    Your project is available at https://PROJECT.appspot.com
- Go to https://PROJECT.appspot.com in your web browser and login.
    - By default, no one is allowed to add datasets to your application.
    - In Google Console, navigate to Data Store > Entities and click on your email address. Add the property ``importer`` of type boolean and set to true. 
    - Import datasets into your application.
- Read more about [App Engine](https://cloud.google.com/appengine/docs/), such as how you can limit spending.


## Developer Instructions
- Install JavaScript dependencies
    ``npm i``
- Build the client
    ``npm run-script build``
- Install Python dependencies
    ``pip install -r requirements.txt``
- Add http://localhost:5000 to your Web application Outh client ID authorized JavaScript origins
- Download the App Engine service account JSON key (DO NOT SHARE THIS!) and set the environment variable GOOGLE_APPLICATION_CREDENTIALS
export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json" 


