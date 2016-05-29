const chai     = require('chai');
const maktabah = require('..');

chai.use(require('chai-things'));
chai.Should();

describe('maktabah', () => {

  describe('schema', () => {

    it('dumps schema', () => {
      const result = maktabah.schema();
      result.should.be.a('string');
    });

    it('creates schema', () => {
      const config = {
        client: 'sqlite3',
        connection: {
          filename: ':memory:'
        },
        useNullAsDefault: true
      };
      return maktabah.schema({ config, dump: false })
        .then((knex) => knex('sqlite_master').select('name'))
        .then((res) => {
          res.should.contain.an.item.with.property('name', 'category');
          res.should.contain.an.item.with.property('name', 'kitab');
          res.should.contain.an.item.with.property('name', 'author');
          res.should.contain.an.item.with.property('name', 'kitab_author');
          res.should.contain.an.item.with.property('name', 'nash');
          res.should.contain.an.item.with.property('name', 'part');
        });
    });

  });

  describe('installation', () => {

    const book = __dirname + '/data/jurumiyyah.bok';

    it('dumps kitab installation', () => {
      return maktabah.install(book)
        .then((result) => {
          result.should.be.a('string');
        });
    });

    it('installs kitab', () => {
      const config = {
        client: 'sqlite3',
        connection: {
          filename: ':memory:'
        },
        useNullAsDefault: true
      };

      const knex = require('knex')(config);

      return maktabah.schema({ knex, dump: false })
        .then(() => maktabah.install(book, { knex, dump: false, category: true }))
        .then(() => knex('kitab').first())
        .then((kitab) => {
          kitab.name.should.equal('الآجرومية');
        })
    });

  });

});
