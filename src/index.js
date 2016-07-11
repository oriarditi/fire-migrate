import Promise from 'bluebird';
import Firebase from 'firebase';

class FireMigrate {
  migrate(url, migrations, domain) {
    let fireMigrateRef = new Firebase(url).child('_fire-migrate').child('scripts');
    if (domain) {
      fireMigrateRef = fireMigrateRef.child(domain);
    }
    return new Promise(fulfill => {
      fireMigrateRef.child('fireMigrateInit').update({
        status: 'DONE'
      }, () => this._migrateOne(migrations, 0, fireMigrateRef, fulfill));
    });
  }

  _migrateOne(migrations, index, fireMigrateRef, fulfill) {
    if (index === migrations.length) {
      fulfill();
    } else {
      const migration = migrations[index];
      fireMigrateRef.child(migrations[index].name).transaction(currentData => {
        if (currentData === null) {
          return {
            status: 'MIGRATING',
            startTime: new Date().getTime()
          };
        }
      }, (error, committed, snapshot) => {
        if (error) {
          console.log('Transaction failed abnormally!', error);
        } else if (committed) {
          console.log('Starting migration ' + migration.name);
          migration(() => {
            console.log('Completed migration ' + migration.name);
            fireMigrateRef.child(migration.name).update({
              status: 'DONE',
              completionTime: new Date().getTime()
            }).then(this._migrateOne(migrations, ++index, fireMigrateRef, fulfill));
          });
        } else {
          if (snapshot.val().status === 'DONE') {
            console.log(migration.name + ' was already migrated at ' + new Date(snapshot.val().completionTime).toString());
            this._migrateOne(migrations, ++index, fireMigrateRef, fulfill);
          } else {
            console.log(migration.name + ' is running. Started at ' + new Date(snapshot.val().startTime).toString());
            setTimeout(() => this._migrateOne(migrations, index, fireMigrateRef, fulfill), 100);
          }
        }
      });
    }
  }

  fireMigrateInit() {}
}

export default new FireMigrate();
