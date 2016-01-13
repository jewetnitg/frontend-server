import _ from 'lodash';

function RESTRequest(action, model) {
  const options = RESTRequest.actions[action](model);
  options.name = model.options.name + '.' + action;

  return model.connection.Request(options);
}

RESTRequest.model = function (model) {
  const requests = {};

  _.each(RESTRequest.actions, (v, action) => {
    requests[action] = RESTRequest(action, model);
  });

  return requests;
};

RESTRequest.actions = {
  findAll(model) {
    return {
      route: model.options.url,
      method: 'get',
      prepare(data) {
        return data ? _.omit(data, _.keys(Object.getPrototypeOf(data))) : data;
      },
      resolve(data) {
        return model.add(data);
      }
    };
  },
  findById(model) {
    return {
      route: model.options.url + '/:id',
      method: 'get',
      prepare(data) {
        return data ? _.omit(data, _.keys(Object.getPrototypeOf(data))) : data;
      },
      resolve(data) {
        return model.add(data);
      }
    };
  },
  create(model) {
    return {
      route: model.options.url,
      method: 'post',
      prepare(data) {
        return data ? _.omit(data, _.keys(Object.getPrototypeOf(data))) : data;
      },
      resolve(data) {
        return model.add(data);
      }
    };
  },
  update(model) {
    return {
      route: model.options.url + '/:id',
      method: 'put',
      prepare(data) {
        return data ? _.omit(data, _.keys(Object.getPrototypeOf(data))) : data;
      },
      resolve(data) {
        return model.add(data);
      }
    };
  },
  delete(model) {
    return {
      route: model.options.url + '/:id',
      method: 'delete',
      prepare(data) {
        return data ? _.omit(data, _.keys(Object.getPrototypeOf(data))) : data;
      },
      resolve(data) {
        return model.remove(data);
      }
    };
  }
};

export default RESTRequest;