
export const typeDefs = `
  type User {
    id: Int!
    type: UserType!
  }

  input UserInput {
    type: UserType!
  }

  input UserFilters {
    type: UserType
  }

  type Query {
    user: User!
    users (filters: UserFilters = {}): [User!]!
  }
  type Mutation {
    userCreate (input: UserInput!): User!
  }
`;

export const resolvers = {
  Query: {
    async user () {
      return { id: 1, type: 'MEMBER' };
    },
    async users () {
      return [];
    },
  },
  Mutation: {
    async userCreate () {
      return { id: 1, type: 'MEMBER' };
    },
  },
};
