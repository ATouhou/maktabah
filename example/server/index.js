const koa        = require('koa');
const route      = require('koa-route');
const views      = require('koa-views');
const morgan     = require('koa-morgan');
const schema     = require('./schema');
const bodyparser = require('koa-bodyparser');

const { graphql } = require('graphql');
const app = new koa();

app.use(morgan('dev'));
app.use(views(__dirname + '/views', { extension: 'pug' }));
app.use(bodyparser());

app.use(route.get('/', ctx => {
  const query = '{ categories { name id kutub { name id } } }';
  return graphql(schema, query).then(({ data }) => ctx.render('index', data));
}));

app.use(route.get('/category/:id', (ctx, id) => {
  const query = `{ kutub(category_id: ${id}) { name id category { id } } }`;
  return graphql(schema, query).then(({ data }) => ctx.render('category', data));
}));

app.use(route.get('/kitab/:id', (ctx, id) => {
  const query = `{ kitab(id: ${id}) { id name parts { title id } } }`;
  return graphql(schema, query).then(({ data }) => ctx.render('kitab', data));
}));

app.use(route.get('/kitab/:kitab_id/part/:id', (ctx, kitab_id, id) => {
  const query = `{ part(id: ${id}) { title, nushush { content page } } }`;
  return graphql(schema, query).then(({ data, errors }) => {
    if (errors) {
      return ctx.render('error', { errors: errors.map(err => err.message) });
    } else {
      return ctx.render('part', data);
    }
  });
}));

if (module === require.main) {
  app.listen(5000);
}
