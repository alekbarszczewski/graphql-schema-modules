
export const typeDefs = `
  type Post {
    id: Int!
    title: String!
  }

  input PostInput {
    title: String!
  }

  type Mutation {
    postCreate (input: PostInput!): Post!
  }

  type Query {
    posts: [Post!]!
  }
`;

export const resolvers = {
  Mutation: {
    async postCreate () {
      return { id: 1, title: 'Post1' };
    },
  },
  Query: {
    async posts () {
      return [];
    },
  },
};
