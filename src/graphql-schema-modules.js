
import 'babel-polyfill';
import gql from 'graphql-tag';
import { print } from 'graphql/language/printer';
import deepExtend from 'deep-extend';
import requireAll from 'require-all';
import shim from 'core-js/fn/object/values';

export function mergeModules(modules = []) {
  const typeDefs = mergeTypeDefs(
    modules
    .filter(({ typeDefs }) => (!!typeDefs))
    .map(({ typeDefs }) => (typeDefs))
  );
  const resolvers = mergeResolvers(
    modules
    .filter(({ resolvers }) => (!!resolvers))
    .map(({ resolvers }) => (resolvers))
  );
  return {
    typeDefs: [typeDefs],
    resolvers,
  };
};

export function loadModules (directory) {
  const modules = [];
  requireAll({
    dirname: directory,
    recursive: true,
    resolve (mod) {
      modules.push(mod);
    },
  });
  return mergeModules(modules);
};

const typeDefsToStr = (typeDefs = []) => {
  if (typeof typeDefs === 'string') {
    return typeDefs;
  } else if (typeof typeDefs === 'function') {
    return typeDefsToStr(typeDefs());
  } else {
    return typeDefs.map(typeDef => (typeDefsToStr(typeDef))).join('\n');
  }
};

const mergeTypeDefs = (typeDefs = []) => {
  typeDefs = typeDefs.map(typeDefs => (gql`${typeDefsToStr(typeDefs)}`));
  const rootTypes = {};
  typeDefs.forEach(graphql => {
    graphql.definitions.forEach(def => {
      const name = def.name.value;
      if (rootTypes[name]) {
        rootTypes[name].fields = rootTypes[name].fields.concat(def.fields);
      } else {
        rootTypes[name] = def;
      }
    });
  });
  return print({
    kind: 'Document',
    definitions: Object.values(rootTypes),
  });
};

const mergeResolvers = (resolvers = []) => {
  const rootResolvers = {};
  resolvers.forEach(_resolvers => {
    deepExtend(rootResolvers, _resolvers);
  });
  return rootResolvers;
};
