const _      = require('lodash');
const utils  = require('./utils');
const schema = require('./schema');

function dumpJson(bookfile) {
  return utils.tables(bookfile)
    .reduce((acc, table) => {
      return utils.extractJson(bookfile, table)
        .then((content) => acc[table] = content)
        .then(() => acc);
    }, {});
}

function installSchema(knex) {
  return [
    knex.schema.createTable('master', (table) => {
      table.integer('BkId').primary(); // main id
      table.text('Bk').unique().notNullable(); // book name
      table.text('Betaka');   // publisher
      table.text('Inf');
      table.text('Auth');     // author
      table.text('AuthInf');  // author info
      table.text('TafseerNam');
      table.integer('IslamShort');
      table.integer('oNum');
      table.integer('oVer');
      table.string('seal', 8);
      table.integer('oAuth');
      table.integer('bVer');
      table.integer('Pdf');
      table.integer('oAuthVer');
      table.string('verName');
      table.string('cat');
      table.string('Lng');
      table.string('HigriD'); // hijriyyah date
      table.integer('AD');
      table.string('aSeal', 8);
      table.string('bLnk');
      table.integer('PdfCs');
    }),
    knex.schema.createTable('titles', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.text('tit');
      table.integer('lvl');
      table.integer('sub');
      table.integer('id');
    }),
    knex.schema.createTable('nash', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.text('nass');
      table.string('seal', 8);
      table.integer('id');
      table.integer('part');
      table.integer('page');
    }),
    knex.schema.createTable('sPdf', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.integer('oNum');
      table.string('part');
      table.string('sFileName');
    }),
    knex.schema.createTable('Shrooh', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.string('Matn', 10);
      table.string('Sharh', 10);
      table.string('MatnId', 10);
      table.string('SharhId', 10);
    }),
    knex.schema.createTable('Shorts', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.integer('Bk');
      table.string('ramz', 10);
      table.text('nass');
    }),
    knex.schema.createTable('oShrooh', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.integer('Matn');
      table.integer('Sharh');
      table.integer('MatnVer');
      table.integer('SharhVer');
    }),
    knex.schema.createTable('oShr', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.integer('Matn');
      table.integer('Sharh');
      table.integer('MatnId');
      table.integer('SharhId');
    }),
    knex.schema.createTable('nBound', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.integer('B');
      table.integer('bVer');
      table.integer('D');
      table.integer('dVer');
      table.integer('bCode');
    }),
    knex.schema.createTable('men_u', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.integer('Bk');
      table.integer('Id');
    }),
    knex.schema.createTable('men_h', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.string('Name');
      table.integer('Id');
      table.integer('upG');
    }),
    knex.schema.createTable('men_b', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.string('Name');
      table.integer('Bk');
      table.integer('Id');
      table.integer('ManId');
    }),
    knex.schema.createTable('com', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.string('com');
      table.integer('bk');
      table.integer('id');
    }),
    knex.schema.createTable('avPdf', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.string('verName');
      table.integer('oNum');
      table.integer('Def');
      table.integer('PdfVer');
      table.integer('Cs');
    }),
    knex.schema.createTable('abc', (table) => {
      table.integer('owner').notNullable().references('BkId').inTable('master').onDelete('CASCADE');
      table.integer('a');
      table.integer('b');
      table.integer('c');
    })
  ];
}

function dropSchema(knex) {
  return [
    'master', 'titles', 'nash', 'sPdf', 'Shrooh', 'Shorts', 'oShrooh',
    'oShr', 'nBound', 'men_u', 'men_h', 'men_b', 'com', 'avPdf', 'abc'
  ].map((table) => knex.schema.dropTable(table));
}

function installKitab(knex, data) {
  const { BkId } = data.Main[0];
  const master = knex('master').insert(data.Main[0]);
  data = _.assign({}, _.omit(data, ['Main', 'b' + BkId, 't' + BkId]), {
    nash: data['b' + BkId],
    titles: data['t' + BkId]
  });
  data = _.mapValues(data, (rows, key) => rows.map(row => knex(key).insert(_.assign({}, row, { owner: BkId }))));
  data = _.values(data);

  return _.concat(master, _.flattenDeep(data));
}

function dropKitab(knex, BkId) {
  return knex('master').where({ BkId }).del();
}

module.exports = {
  installSchema, dropSchema, installKitab, dropKitab, dumpJson,
  schema
};
