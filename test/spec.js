const chai     = require('chai');
const Promise  = require('bluebird');
const maktabah = require('..');

chai.use(require('chai-things'));
chai.Should();

describe('maktabah', () => {

  const config = {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    pool: {
      afterCreate(conn, cb) {
        // ensure foreign key constraint
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    },
    useNullAsDefault: true  // suppress warning
  };

  describe('schema', () => {

    const knex = require('knex')(config);

    it('install schema', () => {
      return Promise.reduce(maktabah.installSchema(knex), p => p)
        .then(() => knex('sqlite_master').select('name'))
        .then((tables) => {
          tables.map(table => table.name).should.deep.equal([
            'master', 'titles', 'nash', 'sPdf', 'Shrooh', 'Shorts', 'oShrooh',
            'oShr', 'nBound', 'men_u', 'men_h', 'men_b', 'com', 'avPdf', 'abc'
          ]);
        })
    });

    it('drop schema');

  });

  describe('kitab', () => {

    const knex = require('knex')(config);

    it('install kitab', () => {
      return Promise.reduce(maktabah.installSchema(knex), p => p)
        .then(() => Promise.reduce(maktabah.installKitab(knex, require('./data/jurumiyyah')), p => p))
        .then(() => knex('master').select().first())
        .then((master) => {
          master.BkId.should.equal(11371);
          master.Bk.should.equal('الآجرومية');
        });
    });

    it('drop kitab');

  });

});
