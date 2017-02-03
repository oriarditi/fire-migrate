import Promise from 'bluebird';
import sinon from 'sinon';
import Firebase from 'firebase';
import FirebaseServer from 'firebase-server';
import fireMigrate from '../src'

let server;
let databaseRef;

describe('Fire Migrate', () => {
  beforeEach(done => {
    if (!server) {
      server = new FirebaseServer(5000, 'localhost.firebaseio.test');
      databaseRef = Firebase.initializeApp({
        apiKey: 'AnyKey',
        databaseURL: 'ws://localhost.firebaseio.test:5000'
      }).database().ref();
    }
    done();
  });

  afterEach(done => {
    databaseRef.set(null).then(done);
  });

  it('simple scripts', done => {
    fireMigrate.migrate(databaseRef, [a,b], 'd').then(done);
  });

  it('concurrent runs', done => {
    new Promise.all([
      fireMigrate.migrate(databaseRef, [a,b], 'd'),
      fireMigrate.migrate(databaseRef, [a,b], 'd')
    ]).then(() => done());
  });

  it('consecutive runs', done => {
    fireMigrate.migrate(databaseRef, [a], 'd').then(() => {
      fireMigrate.migrate(databaseRef, [a,b], 'd').then(done);
    });
  });

  function a(resolve) {
    console.log('a');
    setTimeout(resolve, 50);
  }

  function b(resolve) {
    console.log('b');
    setTimeout(resolve, 50);
  }
});
