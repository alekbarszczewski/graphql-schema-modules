
export const typeDefs = `
  type Query {
    b: Int!
  }
`;

export const resolvers = {
  Query: {
    async b (root, args, context, info) {
      return 2;
    },
  },
};
