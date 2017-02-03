# fire-migrate
[![CircleCI](https://circleci.com/gh/oriarditi/fire-migrate.svg?style=svg)](https://circleci.com/gh/oriarditi/fire-migrate)

fire-migrate is a tool to source control your migrations for firebase. It's the equivalent of [liquibase](http://www.liquibase.org/) for firebase.

fire-migrate verifies consecutive migrations and cross process locks.

To use call fireMigrate with the URL of your firebase application and an array of functions containing your firebase migrations. Each of the functions must call their first argument ```resolve()``` once the migration is complete.

fire-migrate matches the migrations by the name of the functions so if the name changes it will be reran.

Currently fire-migrate works with firebase 2.4.2 and **NOT** 3.x until [react-native integration is restored](https://groups.google.com/forum/#!topic/firebase-talk/fvpjeYEg8L8).

```npm install --save fire-migrate```

Example:
```
var fireMigrate = require('fire-migrate');
var databaseRef = Firebase.initializeApp({
  apiKey: 'apiKey',
  authDomain: 'projectId.firebaseapp.com',
  databaseURL: 'https://example.firebaseio.com'
}).database().ref();

fireMigrate.migrate(databaseRef, [migration1, migration2]).then(() => {
  // continue with the rest of the application   
});

function migration1(resolve) {
  firebaseRef.push({
    //some data
  },resolve);
}

function migration2(resolve) {
  firebaseRef.push({
    //some data
  },resolve);
}
```
