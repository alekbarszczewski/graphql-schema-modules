
import { makeExecutableSchema } from 'graphql-tools';
import { loadModules } from './../src/graphql-schema-modules';

const { typeDefs, resolvers } = loadModules(__dirname + '/graphql');

console.log(typeDefs[0]); // -> merged schema
// resolvers will be merged resolvers

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
