var Firebase = require('firebase');

module.exports = function(url, migrations) {
  var fireMigrateRef = new Firebase(url).child('_fire-migrate').child('scripts');
  fireMigrateRef.child('fireMigrateInit').update({
    status: 'DONE'
  });
  for (var i=0; i < migrations.length; i++) {
    var migration = migrations[i];
    if (i === 0) {
      migrateOne(fireMigrateRef, fireMigrateInit, migration);
    } else {
      migrateOne(fireMigrateRef, migrations[i-1], migration);
    }
  }
}

function migrateOne(fireMigrateRef, dependsOn, migration) {
  fireMigrateRef.child(dependsOn.name).once('value', function(dataSnapshot) {
    if (dataSnapshot.exists() && dataSnapshot.val().status === 'DONE') {
      fireMigrateRef.child(migration.name).transaction(function(currentData) {
        if (currentData === null) {
          return {
            status: 'MIGRATING',
            startTime: new Date().getTime()
          };
        }
      }, function(error, committed, snapshot) {
        if (error) {
          console.log('Transaction failed abnormally!', error);
        } else if (committed) {
          console.log('Starting migration ' + migration.name);
          migration(function() {
            console.log('Completed migration ' + migration.name);
            fireMigrateRef.child(migration.name).update({
              status: 'DONE',
              completionTime: new Date().getTime()
            });
          });
        } else {
          if (snapshot.val().status === 'DONE') {
            console.log(migration.name + ' was already migrated at ' + new Date(snapshot.val().completionTime).toString());
          } else {
            console.log(migration.name + ' is running. Started at ' + new Date(snapshot.val().startTime).toString());
          }
        }
      });
    } else {
      console.log('Waiting for script ' + dependsOn.name);
      setTimeout(function() {
        migrateOne(fireMigrateRef, dependsOn, migration);
      }, 1000);
    }
  });
}

function fireMigrateInit() { }
