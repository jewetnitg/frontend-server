import _ from 'lodash';
import {connections} from 'frontend-connection';

import RESTRequest from './RESTRequest';
import ModelInstance from './ModelInstance';
import Schema from './Schema';
import eventMixinFactory from '../mixins/events';

function Model(options = {}) {
  _.defaults(options, Model.defaults, {
    event: options.name
  });

  const data = [];
  const byId = {};
  const model = {
    options,

    get connection() {
      return connections[options.connection.name || options.connection] || options.server.connection
    },

    get data() {
      return data;
    },

    get byId() {
      return byId;
    },

    get server() {
      return this.connection.server[options.name];
    },

    id(model = {}) {
      const type = typeof model;
      return type === 'string' || type === 'number' ? model : model[options.idAttribute];
    },

    isNew(model) {
      return !this.id(model);
    },

    get(modelOrId) {
      const id = this.id(modelOrId);
      return id ? this.byId[id] : _.find(this.data, modelOrId);
    },

    subscribe() {
      this.connection.subscribe(options.event, handleServerEvent.bind(this))
      return this.fetch();
    },

    save(model) {
      validateRestForMethod(options, 'save');

      if (!model) {
        return forAll('changed', this.data, this.save.bind(this));
      }

      if (this.isNew(model)) {
        return this.server.create(model);
      } else {
        return this.server.update(this.id(model), model);
      }
    },

    destroy(model) {
      validateRestForMethod(options, 'destroy');

      if (!model) {
        return forAll('destroyed', this.data, this.destroy.bind(this));
      }

      if (this.isNew(model)) {
        // wrap in a Promise so this method always returns a Promise
        return Promise.resolve(this.remove(model));
      } else {
        return this.server.delete(this.id(model), model);
      }
    },

    fetch(model) {
      validateRestForMethod(options, 'fetch');

      if (!model) {
        return this.server.findAll();
      } else {
        return this.server.findById(this.id(model));
      }
    },

    sync() {
      validateRestForMethod(options, 'sync');

      return Promise.all([
          this.destroy(),
          this.save()
        ])
        .then(this.fetch.bind(this, null));
    },

    add(models = []) {
      if (Array.isArray(models)) {
        return _.map(models, this.add.bind(this));
      } else if (typeof models === 'object') {
        let model = this.get(models);

        if (model) {
          updateExistingModel(model, models);
        } else {
          model = createNewModel.bind(this)(models);
        }

        return addToById(this.byId, model, options);
      }
    },

    remove(models = []) {
      if (Array.isArray(models)) {
        return _.map(models, this.remove.bind(this));
      } else if (typeof models === 'object') {
        removeFromById(this.byId, models, options);
        return removeFromData(this.data, models);
      }
    }

  };

  eventMixinFactory(model);
  constructRestRequests(options, model);
  constructMethods(options, model.connection);
  Schema(options.schema, model);

  autoSubscribe(options, model);

  return options.server.models[options.name] = model;
}

Model.defaults = {
  idAttribute: 'id',
  autoSubscribe: true
};

function constructRestRequests(options, model) {
  if (options.rest) {
    RESTRequest.model(model);
  }
}

function autoSubscribe(options, model) {
  if (options.autoSubscribe) {
    return model.subscribe();
  }
}

function constructMethods(options, connection) {
  _.each(options.methods, (requestOptions, requestName) => {
    requestOptions.name =  options.name + '.' + (requestOptions.name || requestName)
    requestOptions.connection = requestOptions.connection || connection;

    connection.Request(requestOptions);
  });
}

function forAll(property, models, fn) {
  return Promise.all(
    _.map(models, (model) => {
      return model && model[property] ? fn(model) : null;
    })
  );
}

function addToById(byId, model, options) {
  if (model[options.idAttribute]) {
    byId[model[options.idAttribute]] = model;
  }

  return model;
}

function addToData(data, model) {
  data.push(model);
  return model;
}

function removeFromById(byId, model, options) {
  if (model[options.idAttribute]) {
    delete byId[model[options.idAttribute]];
  }
}

function removeFromData(data, model) {
  const index = data.indexOf(model);

  if (index !== -1) {
    data.splice(index, 1);
  }
}

function createNewModel(properties) {
  const model = ModelInstance(this, properties);

  model.on('change', this.trigger.bind(this, `change`, model));

  return addToData(this.data, model);
}

function updateExistingModel(model, newProperties) {
  _.each(model, (v, key) => {
    delete model[key];
  });

  return Object.assign(model, newProperties);
}

function validateRestForMethod(options, methodName) {
  if (!options.rest) {
    throw new Error(`Can't ${methodName} model, rest not enabled.`);
  }
}

function handleServerEvent(event) {
  //noinspection JSUnresolvedVariable
  const ev = event.verb;

  if (ev === 'updated' || ev === 'created') {
    const model = this.add(event.data);
    model.trigger('change', model);
  } else if (ev === 'destroyed') {
    const model = this.remove(event.id);
    model.trigger('remove', model);
  }
}

export default Model;