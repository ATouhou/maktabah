const {
  GraphQLSchema
} = require('graphql');

const Query = require('./query');

const Schema = new GraphQLSchema({
  query: Query
});

module.exports = Schema;
