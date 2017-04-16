
export const typeDefs = `
  type Query {
    a: Int!
  }
`;

export const resolvers = {
  Query: {
    async a (root, args, context, info) {
      return 1;
    },
  },
};
