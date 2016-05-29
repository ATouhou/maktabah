const {
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLObjectType
} = require('graphql');

const _    = require('lodash');
const Nash = require('./nash');

const Kitab = new GraphQLObjectType({
  name: 'Kitab',
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: ({ Bk }) => Bk
    },
    nushush: {
      type: new GraphQLList(Nash),
      args: {
        id: {
          type: GraphQLInt
        },
        page: {
          type: GraphQLInt
        },
        limit: {
          type: GraphQLInt
        }
      },
      resolve({ BkId }, args, ctx, info) {
        const knex  = info.rootValue;
        const limit = args.limit || 100;
        const query = _.assign({ owner: BkId }, _.omit(args, 'limit'));
        return knex('nash').where(query).orderBy('id').limit(limit);
      }
    }
  })
});

module.exports = Kitab;
