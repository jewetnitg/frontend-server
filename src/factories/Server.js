import _ from 'lodash';
import {Connection, Adapter, connections, servers, adapters} from 'frontend-connection';

import Model from './Model';
import eventsMixinFactory from '../mixins/events';

import sailsIoClient from 'sails.io.js';
import socketIoClient from 'socket.io-client';

const Server = function (options = {}) {
  options = _.merge({}, Server.defaults, options);

  const models = {};
  const data = {};
  const byId = {};
  let server = null;

  // the SAILS_IO and XHR adapters are added by default,
  // pass the sailsIo and socketIo libraries to the adapter so only one instance of the library is used
  adapters.SAILS_IO.sailsIoClient = options.libraries.sailsIo;
  adapters.SAILS_IO.socketIoClient = options.libraries.socketIo;

  server = {

    get options() {
      return options
    },

    get server() {
      return server.connection.server;
    },

    get models() {
      return models;
    },

    get data() {
      return data;
    },

    get byId() {
      return byId;
    },

    connect() {
      return server.connection.connect();
    },

    disconnect() {
      return server.connection.disconnect();
    },

    get(url, data) {
      return server.connection.get(url, data);
    },

    post(url, data) {
      return server.connection.post(url, data);
    },

    put(url, data) {
      return server.connection.put(url, data);
    },

    delete(url, data) {
      return server.connection.delete(url, data);
    },

    upload(files, data, progress) {
      return server.connection.upload(files, data, progress);
    },

    add: {
      method(methodOptions = {}) {
        methodOptions.connection = connections[methodOptions.connection] || server.connection;
        return server.connection.Request(methodOptions);
      },
      model(modelOptions = {}) {
        modelOptions.server = server;
        modelOptions.connection = connections[modelOptions.connection] || server.connection;

        const model = Model(modelOptions);

        server.data[modelOptions.name] = model.data;
        server.byId[modelOptions.name] = model.byId;

        return model;
      }
    }
  };

  eventsMixinFactory(server);

  server.connection = constructConnection(options);

  constructHashMap(options.models, server.add.model);
  constructHashMap(options.methods, server.add.method);

  return server;
};

function constructConnection(options) {
  const connectionOptions = Object.assign({
    name: options.name
  }, options.connection);

  return Connection(connectionOptions);
}

function constructHashMap(hashmap, factory) {
  _.each(hashmap, (options, name) => {
    options.name = options.name || name;
    factory(options);
  });
}

Server.defaults = {
  connection: {
    adapter: 'XHR',
    cache: 6000
  },
  libraries: {
    sailsIo: sailsIoClient,
    socketIo: socketIoClient
  }
};

Server.Adapter = Adapter;

export default Server;