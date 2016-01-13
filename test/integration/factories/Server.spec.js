import _ from 'lodash';

describe(`Server`, () => {
  let baseOptions;
  let optionsWithMethods;
  let optionsWithModels;
  let optionsWithAdapters;

  function resetMocks() {
    baseOptions = {

      // the (transport) adapter this server should use (XHR is provided by default)
      adapter: 'XHR',

      // the url of this server
      url: 'http://localhost:1337',

      // the default lifetime of a cache of a request, requests are cached based on their path variables and request body
      cache: 6000

    };
    optionsWithAdapters = Object.assign({}, baseOptions, {
      adapters: {
        TEST: {
          disconnect: Promise.resolve.bind(Promise),
          connect: Promise.resolve.bind(Promise),
          request: Promise.resolve.bind(Promise),
        }
      }
    });
    optionsWithMethods = Object.assign({}, baseOptions, {
      // (server controller) methods that don't belong to a model
      methods: {
        // name of the method, may be deep through the usage of dots
        'application.init': {
          // name of the method, may be deep through the usage of dots
          name: 'application.init',
          // route, relative to server url
          route: '/init',
          // request method
          method: 'get',
          // lifetime of the cache of this request, requests are cached based on their path variables and request body
          cache: 2000
        }
      }
    });
    optionsWithModels = Object.assign({}, baseOptions, {
      models: {
        // name of the model
        user: {
          // name of the model, defaults to the key of the object (user as well in this case)
          name: 'user',
          // the property the id resides on
          idAttribute: 'id',
          // tells us this model has a RESTful api
          rest: true,
          // the (rest) base url
          url: '/user',
          // tells us the models MUST be according to the schema, and only properties in the schema will be read and written
          strict: true,
          // properties that become available on the prototype of models (the actual data objects, model = {firstName: 'bob'} for example)
          api: {
            // assume aforementioned model: model.isOfLegalAge();
            isOfLegalAge() {
              return this.age && this.age > 18;
            }
          },

          // the schema of the model, describing it's properties
          schema: {
            // name of the property
            firstName: {
              // name of the property, defaults to the key
              name: 'firstName',
              // datatype of the property,
              type: 'string',
              // this attribute is required
              required: false,
              // attribute must be unique across all models
              unique: false,
              // default value
              defaultsTo: 'joe',
              // custom logic to validate the property, return true for valid and false for invalid
              validate: function (model) {
                return true;
              }
            }
          },

          // (server controller) methods for this model
          methods: {
            // name of the method
            'login': {
              // relative to model url
              route: '/login',
              // request method, defaults to get
              method: 'get',
              // method that gets called after the request has been successfully executed,
              // it is passed the data the server returned, and may return a transformed value
              // or a Promise that resolves with one
              // it is also allowed to return a rejecting Promise, when the data returned by the server isn't satisfying for example
              resolve(responseBody, requestBody) {
                // a successful login happened, set the user to a client session for example
                return responseBody;
              },
              // same as resolve, but for rejections, unsuccessful server requests
              reject(responseBody, requestBody) {
                return Promise.reject('Incorrect credentials');
              }
            }
          }

        }
      }
    });
  }

  beforeEach(done => {
    resetMocks();
    done();
  });

  it(`should be a function`, done => {
    //expect(Server).to.be.a('function');
    done();
  });

});