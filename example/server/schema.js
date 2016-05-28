const {
  GraphQLInt,
  GraphQLList,
  GraphQLSchema,
  GraphQLString,
  GraphQLObjectType
} = require('graphql');

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: __dirname + '/db.sqlite3'
  },
  useNullAsDefault: true
});

const Category = new GraphQLObjectType({
  name: 'Category',
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: ({ name }) => name
    },
    id: {
      type: GraphQLInt,
      resolve: ({ id }) => id
    },
    kutub: {
      type: new GraphQLList(Kitab),
      resolve: ({ id }) => knex('kitab').where({ category_id: id })
    }
  })
});

const Kitab = new GraphQLObjectType({
  name: 'Kitab',
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: ({ id }) => id
    },
    category: {
      type: Category,
      resolve: ({ category_id }) => knex('category').where({ id: category_id }).first()
    },
    name: {
      type: GraphQLString,
      resolve: ({ name }) => name
    },
    publishing: {
      type: GraphQLString,
      resolve: ({ publishing }) => publishing
    },
    parts: {
      type: new GraphQLList(Part),
      resolve: ({ id }) => knex('part').where({ kitab_id: id })
    }
  })
});

const Part = new GraphQLObjectType({
  name: 'Part',
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: ({ id }) => id
    },
    title: {
      type: GraphQLString,
      resolve: ({ title }) => title
    },
    level: {
      type: GraphQLInt,
      resolve: ({ level }) => level
    },
    sub: {
      type: GraphQLInt,
      resolve: ({ sub }) => sub
    },
    conn: {
      type: GraphQLInt,
      resolve: ({ conn }) => conn
    },
    kitab_id: {
      type: GraphQLInt,
      resolve: ({ kitab_id }) => kitab_id
    },
    nushush: {
      type: new GraphQLList(Nash),
      resolve: ({ conn, kitab_id }) => knex('nash').where({ conn, kitab_id }).orderBy('page')
    }
  })
});

const Nash = new GraphQLObjectType({
  name: 'Nash',
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: ({ id }) => id
    },
    content: {
      type: GraphQLString,
      resolve: ({ content }) => content
    },
    page: {
      type: GraphQLInt,
      resolve: ({ page }) => page
    },
    conn: {
      type: GraphQLInt,
      resolve: ({ conn }) => conn
    },
    kitab_id: {
      type: GraphQLInt,
      resolve: ({ kitab_id }) => kitab_id
    }
  })
});

const query = new GraphQLObjectType({
  name: 'Root',
  fields: () => ({
    categories: {
      type: new GraphQLList(Category),
      args: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString }
      },
      resolve: (root, args) => {
        return knex('category').where(args);
      }
    },
    category: {
      type: Category,
      args: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString }
      },
      resolve: (root, args) => knex('category').where(args).first()
    },
    kutub: {
      type: new GraphQLList(Kitab),
      args: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        category_id: { type: GraphQLInt }
      },
      resolve: (root, args) => knex('kitab').where(args)
    },
    kitab: {
      type: Kitab,
      args: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        category_id: { type: GraphQLInt }
      },
      resolve: (root, args) => knex('kitab').where(args).first()
    },
    part: {
      type: Part,
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (root, args) => knex('part').where(args).first()
    }
  })
});

const schema = new GraphQLSchema({ query });

module.exports = schema;
