const {
  GraphQLList,
  GraphQLString,
  GraphQLObjectType
} = require('graphql');

const Kitab = require('./kitab');

const Query = new GraphQLObjectType({
  name: 'Maktabah',
  fields: () => ({
    kutub: {
      type: new GraphQLList(Kitab),
      args: {
        name: {
          type: GraphQLString
        }
      },
      resolve: (knex) => knex('master')
    }
  })
});

module.exports = Query;
