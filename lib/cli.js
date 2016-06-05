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

function transform(books, options) {

  if (options.mode === 'split') {
    return Promise.map(books, (book) => {
      const { name, ext } = path.parse(book);
      if (ext === '.json') {
        const json = require(path.resolve(book));
        json.name = path.parse(book).name;
        return json;
      } else if (ext === '.bok') {
        return dumpJson(book).then((json) => {
          json.name = path.parse(book).name;
          return json;
        })
      } else {
        throw new Error('unrecognized file extension');
      }
    })
      .map((data) => {
        const kitab = Object.assign(data.Main[0], {
          _id: 'kitab:' + data.Main[0].BkId,
          type: 'kitab',
          name: data.name
        });
        const nash = data['b' + data.Main[0].BkId].map((nash) => {
          return Object.assign(nash, {
            type: 'nash',
            _id: `nash:${data.Main[0].BkId}:${nash.id}`,
            kitab_id: 'kitab:' + data.Main[0].BkId
          })
        });
        const titles = data['t' + data.Main[0].BkId].map((title) => {
          return Object.assign(title, {
            type: 'title',
            _id: `title:${data.Main[0].BkId}:${title.id}`,
            kitab_id: 'kitab:' + data.Main[0].BkId
          })
        });
        return [kitab, ...nash, ...titles];
      })
      .reduce((prev, curr) => prev.concat(curr), [])
      .then((docs) => ({ docs }));

  } else if (options.mode === 'single') {
    return Promise.map(books, (book) => {
      const { name, ext } = path.parse(book);
      if (ext === '.json') {
        const json = require(path.resolve(book));
        json.name = path.parse(book).name;
        return json;
      } else if (ext === '.bok') {
        return dumpJson(book).then((json) => {
          json.name = path.parse(book).name;
          return json;
        })
      } else {
        throw new Error('unrecognized file extension');
      }
    })
    // return Promise.map(books, dumpJson)
      .map((data) => {
        const { BkId } = data.Main[0];
        data._id  = `${BkId}`;
        data = Object.assign(data, data.Main[0]);
        data.nash = data['b' + BkId];
        data.titles = data['t' + BkId];
        delete data['b' + BkId];
        delete data['t' + BkId];
        delete data.Main;
        return data;
      })
      .then((docs) => ({ docs }));
  } else {
    return Promise.reject(new Error('unrecognized transform mode: ' + options.mode));
  }

}

module.exports = {
  dump: dumpJson,
  schema,
  kitab,
  transform
};
