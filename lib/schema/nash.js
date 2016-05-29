const {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType
} = require('graphql');

const Nash = new GraphQLObjectType({
  name: 'Nash',
  fields: () => ({
    content: {
      type: GraphQLString,
      resolve: ({ nass }) => nass
    },
    id: {
      type: GraphQLInt,
      resolve: ({ id }) => id
    },
    page: {
      type: GraphQLInt,
      resolve: ({ page }) => page
    }
  })
});

module.exports = Nash;
