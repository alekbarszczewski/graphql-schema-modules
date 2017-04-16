
export const typeDefs = `
  type Mutation {
    c: Int!
  }
`;

export const resolvers = {
  Mutation: {
    async c (root, args, context, info) {
      return 3;
    },
  },
};
