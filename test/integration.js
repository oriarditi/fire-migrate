import Promise from 'bluebird';
import sinon from 'sinon';
import Firebase from 'firebase';
import FirebaseServer from 'firebase-server';
import fireMigrate from '../src'

const url = 'ws://localhost.firebaseio.test:5000';
let server;

describe('Fire Migrate', () => {
  beforeEach(done => {
    if (!server) {
      server = new FirebaseServer(5000, 'localhost.firebaseio.test');
    }
    done();
  });

  afterEach(done => {
    new Firebase(url).set(null).then(done);
  });

  it('simple scripts', done => {
    fireMigrate.migrate(url, [a,b], 'd').then(done);
  });

  it('concurrent runs', done => {
    new Promise.all([
      fireMigrate.migrate(url, [a,b], 'd'),
      fireMigrate.migrate(url, [a,b], 'd')
    ]).then(() => done());
  });

  it('consecutive runs', done => {
    fireMigrate.migrate(url, [a], 'd').then(() => {
      fireMigrate.migrate(url, [a,b], 'd').then(done);
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
