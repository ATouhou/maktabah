const Promise = require('bluebird');
const utils   = require('./utils');

function dumpSql(bookfile, backend = 'sqlite', charset) {
  return Promise.all([
    utils.schema(bookfile, backend, charset),
    utils.extractAll(bookfile, backend, charset)
  ]).spread((schema, tables) => [
    schema, 'BEGIN;', tables.join('\n'), 'COMMIT;'
  ].join('\n'));
}

function dumpJson(bookfile, charset) {
  return utils.tables(bookfile)
    .reduce((acc, table) => {
      return utils.extractJson(bookfile, table)
        .then((content) => acc[table] = content)
        .then(() => acc);
    }, {});
}

function schema(dialect = 'sqlite3', uninstall) {
  const knex = require('knex')({ dialect, useNullAsDefault: true });
  let query;
  if (!uninstall) {
    query =  [
      knex.schema.createTable('category', (table) => {
        table.increments('id').primary();
        table.string('name', 255).unique().notNullable();
      }),
      knex.schema.createTable('kitab', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('publishing');
        table.integer('category_id').notNullable().references('id').inTable('category').onDelete('cascade');
        table.unique(['name', 'category_id']);
      }),
      knex.schema.createTable('author', (table) => {
        table.increments('id').primary();
        table.string('name', 255).unique().notNullable();
        table.text('bio');
      }),
      knex.schema.createTable('kitab_author', (table) => {
        table.integer('kitab_id').notNullable().references('id').inTable('kitab').onDelete('cascade');
        table.integer('author_id').notNullable().references('id').inTable('author').onDelete('cascade');
        table.primary(['kitab_id', 'author_id']);
      }),
      knex.schema.createTable('nash', (table) => {
        table.increments('id').primary();
        table.text('content').notNullable();
        table.integer('page').notNullable();
        table.integer('conn').notNullable();
        table.integer('kitab_id').notNullable().references('id').inTable('kitab').onDelete('cascade');
      }),
      knex.schema.createTable('part', (table) => {
        table.increments('id').primary();
        table.string('title', 255).notNullable();
        table.integer('level').notNullable();
        table.integer('sub').notNullable();
        table.integer('conn').notNullable();
        table.integer('kitab_id').notNullable().references('id').inTable('kitab').onDelete('cascade');
      })
    ].map(schema => schema.toString()).join(';\n');
  } else {
    query = ['kitab_author', 'part', 'nash', 'author', 'kitab', 'category']
      .map(table => knex.schema.dropTable(table))
      .map(table => table.toString())
      .join(';\n');
  }

  return ['BEGIN', query, 'COMMIT'].join(';\n') + ';';
}

function wrap(queries, tr) {
  if (tr) {
    return ['BEGIN', ...queries, 'COMMIT'].join(';\n') + ';';
  } else {
    return queries.join(';\n') + ';';
  }
}

function install(book, dialect = 'sqlite3', insertCategory, uninstall) {
  const knex = require('knex')({ dialect, useNullAsDefault: true });
  return dumpJson(book)
    .then((data) => {
      const main = data.Main[0];

      const nash = data['b' + main.BkId];
      const part = data['t' + main.BkId];

      const author     = main.Auth;
      const category   = main.cat;
      const bookName   = main.Bk;
      const authorBio  = main.AuthInf;
      const publishing = main.Betaka;

      const categorySelect = knex('category')
        .where({ name: category }).select('id');

      const kitabSelect = knex('kitab')
        .where({ name: bookName, category_id: categorySelect }).select('id');

      const categoryInsert = knex('category')
        .insert({ name: category });

      const kitabInsert = knex('kitab')
        .insert({ name: bookName, category_id: categorySelect , publishing });

      const authorInsert = knex('author')
        .insert({ name: author, bio: authorBio });

      const kitabAuthorInsert = knex('kitab_author').insert({
        author_id: knex('author').where({ name: author }).select('id'),
        kitab_id: kitabSelect
      });

      const nashInserts = nash.map(n => knex('nash').insert({
        kitab_id: kitabSelect,
        content: n.nass,
        page: n.page,
        conn: n.id
      }).toString());

      const partInserts = part.map(p => knex('part').insert({
        kitab_id: kitabSelect,
        title: p.tit,
        level: p.lvl,
        sub: p.sub,
        conn: p.id
      }).toString());

      if (insertCategory) {
        return wrap([
          categoryInsert.toString(),
          kitabInsert.toString(),
          authorInsert.toString(),
          kitabAuthorInsert.toString(),
          wrap(nashInserts),
          wrap(partInserts)
        ], true);
      } else {
        return wrap([
          kitabInsert.toString(),
          authorInsert.toString(),
          kitabAuthorInsert.toString(),
          wrap(nashInserts),
          wrap(partInserts)
        ], true);
      }
    });
}

module.exports = { dumpSql, dumpJson, schema, install };
