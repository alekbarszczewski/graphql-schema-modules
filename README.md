
# graphql-modules [![Build Status](https://travis-ci.org/alekbarszczewski/graphql-modules.svg?branch=master)](https://travis-ci.org/alekbarszczewski/graphql-modules)

Modularize and decouple GraphQL schema and resolvers.

## Installation

```sh
$ npm install --save graphql-modules
```

## Features

* Keep different query/mutation/subscription definitions in separate files
* Keep resolvers and GraphQL definitions modularized
* Load GraphQL from directory

## Usage

graphql/shared.js
```js
export const typeDefs = `
  enum UserType { MEMBER, ADMIN }

  type schema {
    query: Query
    mutation: Mutation
  }
`;
```

graphql/users.js
```js
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

```

graphql/posts.js
```js
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
```

buildSchema.js
```js
import { mergeModules, loadModules } from 'graphql-modules';
import { makeExecutableSchema } from 'graphql-tools';
import * as shared from './graphql/shared.js';
import * as posts from './graphql/posts.js';
import * as users from './graphql/users.js';

const { typeDefs, resolvers } = mergeModules([ shared, posts, users ]);
// OR
// const { typeDefs, resolvers } = loadModules(__dirname + '/graphql');

console.log(typeDefs[0]);

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
```

The output will be:

```graphql
type Post {
  id: Int!
  title: String!
}

input PostInput {
  title: String!
}

# This is where magic happens - mutations are merged
type Mutation {
  postCreate(input: PostInput!): Post!
  userCreate(inut: UserInput!): User!
}

# This is where magic happens - queries are merged
type Query {
  posts: [Post!]!
  user: User!
  users(filters: UserFilters = {}): [User!]!
}

enum UserType {
  MEMBER
  ADMIN
}

type schema {
  query: Query
  mutation: Mutation
}

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
```
