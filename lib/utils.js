const fs = require('fs');
const cp = require('child_process');
const { promisify } = require('bluebird');
const { Converter } = require('csvtojson');

const exec = promisify(cp.exec);
const stat = promisify(fs.stat);

function size(file) {
  return stat(file).then(stats => stats.size);
}

function schema(bookfile, backend) {
  backend = backend || 'sqlite';
  const env = Object.assign({}, process.env, { MDB_JET3_CHARSET: 'cp1256' });
  const cmd = `mdb-schema ${bookfile} ${backend}`;

  return size(bookfile).then(maxBuffer => exec(cmd, { env, maxBuffer }));
};

function tables(bookfile, backend) {
  backend = backend || 'sqlite';
  const env = Object.assign({}, process.env, { MDB_JET3_CHARSET: 'cp1256' });
  const cmd = `mdb-tables -1 ${bookfile}`;

  return size(bookfile)
    .then(maxBuffer => exec(cmd, { env, maxBuffer }))
    .then(tables => tables.split('\n').filter(line => line));
}

// export is reserved keyword
function extract(bookfile, table, backend) {
  backend = backend || 'sqlite';
  const env = Object.assign({}, process.env, { MDB_JET3_CHARSET: 'cp1256' });
  let cmd;
  if (backend === 'csv') {
    cmd = `mdb-export ${bookfile} ${table}`;
  } else {
    cmd = `mdb-export -I ${backend} ${bookfile} ${table}`;
  }
  return size(bookfile)
    .then(maxBuffer => exec(cmd, { env, maxBuffer }));
}

function extractAll(bookfile, backend) {
  backend = backend || 'sqlite';
  return tables(bookfile, backend)
    .map((table) => extract(bookfile, table, backend));
}

function extractJson(bookfile, table) {
  const env = Object.assign({}, process.env, { MDB_JET3_CHARSET: 'cp1256' });
  return new Promise((resolve, reject) => {
    const child = cp.spawn('mdb-export', [bookfile, table], { env });
    const converter = new Converter({});
    converter.on('end_parsed', resolve);
    converter.on('error', reject);
    child.stdout.pipe(converter);
  });
}

function dumpJson(bookfile) {
  return tables(bookfile)
    .reduce((acc, table) => {
      return utils.extractJson(bookfile, table)
        .then((content) => acc[table] = content)
        .then(() => acc);
    }, {});
}

module.exports = {
  schema, tables, extract, extractAll, extractJson, dumpJson
};
