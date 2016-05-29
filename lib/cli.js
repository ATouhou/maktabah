const path    = require('path');
const Promise = require('bluebird');
const {
  dumpJson, installSchema, dropSchema, installKitab, dropKitab
} = require('.');

function schema({ config, uninstall, dump }) {
  if (!config && !dump) {
    process.exit(1);
  }

  if (!config) {
    config = { dialect: 'pg' };
  } else {
    config = require(path.resolve(config));
  }

  const knex = require('knex')(config);

  if (dump) {
    let queries = installSchema(knex).map(query => query.toString());
    queries = queries.join(';\n') + ';\n';
    process.stdout.write(queries, () => process.exit(0));
  } else {
    knex.transaction((trx) => Promise.reduce(installSchema(trx), p => p))
      .then(() => process.stdout.write('done.\n', () => process.exit(0)))
      .catch((err) => process.stderr.write(err.message + '\n', () => process.exit(1)))
  }

}

function kitab(book, { config, uninstall, dump }) {
  if (!config && !dump) {
    process.exit(1);
  }

  if (!config) {
    config = { dialect: 'pg' };
  } else {
    config = require(path.resolve(config));
  }

  const knex = require('knex')(config);

  if (dump) {
    dumpJson(book)
      .then((data) => {
        const queries = installKitab(knex, data).map(query => query.toString());
        return queries.join(';\n') + ';\n';
      })
      .then((queries) => process.stdout.write(queries, () => process.exit(0)));
  } else {
    dumpJson(book)
      .then((data) => knex.transaction((trx) => Promise.reduce(installKitab(trx, data), p => p)))
      .then(() => process.stdout.write('done.\n', () => process.exit(0)))
      .catch((err) => process.stderr.write(err.message + '\n', () => process.exit(1)))
  }
}

module.exports = {
  dump: dumpJson,
  schema,
  kitab
};
