
import 'babel-polyfill';
import { makeExecutableSchema } from 'graphql-tools';
import { graphql } from 'graphql';
import { expect } from 'chai';
import { mergeModules, loadModules } from './../dist/graphql-schema-modules';

const buildSchema = (modules) => {
  const { typeDefs, resolvers } = mergeModules(modules);
  const executableSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  const runQuery = async function runQuery (query, variables = {}) {
    return graphql(executableSchema, query, {}, {}, variables)
  };
  return { runQuery, typeDefs, resolvers };
};

describe('graphql-schema-modules', function () {

  it('should merge modules', async function () {
    const moduleA = {
      typeDefs: 'type Query { a: Int! }',
      resolvers: {
        Query: {
          async a () { return 1; },
        },
      },
    };
    const moduleB = {
      typeDefs: 'type Query { b: Int! }',
      resolvers: {
        Query: {
          async b () { return 2; },
        },
      },
    };
    const moduleC = {
      typeDefs: 'type Mutation { c: Int! }',
      resolvers: {
        Mutation: {
          async c () { return 3; },
        },
      },
    };
    const moduleD = {
      typeDefs: 'type Mutation { d: Int! }',
      resolvers: {
        Mutation: {
          async e () { return 5; },
        },
      },
    };
    const moduleE = {
      typeDefs: 'type Mutation { e: Int! }',
      resolvers: {
        Mutation: {
          async d () { return 4; },
        },
      },
    };
    const moduleF = {
      typeDefs: 'type Mutation { f: Int! }',
    };
    const moduleG = {
      resolvers: {
        Mutation: {
          async f () { return 6; },
        },
      },
    };
    const moduleH = {
      typeDefs: 'type User { id: Int!, name: String! }',
      resolvers: {
        User: {
          async id () {
            return 99;
          },
        },
      },
    };
    const moduleI = {
      typeDefs: `
        type Mutation { user: User! }
      `,
      resolvers: {
        User: {
          async name () {
            return 'John';
          },
        },
        Mutation: {
          user () { return {}; },
        },
      },
    };
    const moduleJ = {
      typeDefs: [
        'type Mutation { g: Int! }',
        'type Mutation { h: Int! }',
      ],
    };
    const moduleK = {
      typeDefs () {
        return [
          'type Mutation { i: Int! }',
          'type Mutation { j: Int! }',
        ];
      },
    };
    const moduleL = {
      typeDefs () {
        return [
          'type Mutation { k: Int! }',
          function () {
            return ['type Mutation { l: Int! }'];
          },
        ];
      },
    };
    const moduleM = {
      resolvers: {
        Mutation: {
          g () { return 123; },
          h () { return 123; },
          i () { return 123; },
          j () { return 123; },
          k () { return 123; },
          l () { return 123; },
        },
      },
    };
    const schema = {
      typeDefs: `
        type schema {
          query: Query
          mutation: Mutation
        }
      `,
    };
    const testModules = async function (modules) {
      const { runQuery, typeDefs, resolvers } = buildSchema(modules);
      const r1 = await runQuery('query { a, b }');
      expect(r1).to.eql({ data: { a: 1, b: 2 } });
      const r2 = await runQuery('mutation { c, d, e, f }');
      expect(r2).to.eql({ data: { c: 3, d: 4, e: 5, f: 6 } });
      const r3 = await runQuery(`mutation { user { id, name } }`);
      expect(r3).to.eql({ data: { user: { id: 99, name: 'John' } } });
      const r4 = await runQuery(`mutation { g, h, i, j, k, l }`);
      expect(r4).to.eql({ data: { g: 123, h: 123, i: 123, j: 123, k: 123, l: 123 } });
    };

    const modules = [ moduleA, moduleB, moduleC, moduleD, moduleE, moduleF, moduleG, moduleH, moduleI, moduleJ, moduleK, moduleL, moduleM, {}, schema ];

    await testModules(modules);
    modules.reverse();
    await testModules(modules);
  });

  it('should load modules from directory', async function () {
    const { typeDefs, resolvers } = loadModules(__dirname + '/graphql');
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const query = await graphql(schema, `
      query {
        posts { id, title }
        user { id, type }
        users (filters: { type: MEMBER }) { id, type }
      }
    `, {}, {}, {});
    expect(query).to.eql({ data: { posts: [], user: { id: 1, type: 'MEMBER' }, users: [] } });
    const mutation = await graphql(schema, `
      mutation {
        postCreate(input: { title: "title" }) { id, title }
        userCreate(input: { type: MEMBER }) { id, type }
      }
    `, {}, {}, {});
    expect(mutation).to.eql({ data: { postCreate: { id: 1, title: 'Post1' }, userCreate: { id: 1, type: 'MEMBER' } } });
  });

});
