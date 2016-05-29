const chai     = require('chai');
const Promise  = require('bluebird');
const maktabah = require('..');

chai.use(require('chai-things'));
const should = chai.Should();

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
          tables.map(table => table.name).should.include.members([
            'master', 'titles', 'nash', 'sPdf', 'Shrooh', 'Shorts', 'oShrooh',
            'oShr', 'nBound', 'men_u', 'men_h', 'men_b', 'com', 'avPdf', 'abc'
          ]);
        })
    });

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

  });

  describe('api', () => {

    const { graphql } = require('graphql');
    const { schema } = require('..');

    const knex = require('knex')(config);

    before(() => Promise.reduce(maktabah.installSchema(knex), p => p)
      .then(() => Promise.reduce(maktabah.installKitab(knex, require('./data/jurumiyyah')), p => p)));

    it('query kitab', () => {
      const query = '{ kutub { name nushush(limit: 1) { content id page } } }';
      return graphql(schema, query, knex)
        .then(({ data, errors }) => {
          should.not.exist(errors, (errors || []).join('\n'));
          const kitab = data.kutub[0];
          kitab.name.should.equal('الآجرومية', 'wew');
          kitab.nushush.should.have.length(1);
          const nash = kitab.nushush[0];
          nash.id.should.equal(1);
          nash.page.should.equal(5);
        });
    });

  });

});
