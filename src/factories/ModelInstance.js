import eventsMixinFactory from '../mixins/events';

// @todo don't mix prototype and properties / attributes, do it backbone style
function ModelInstance(model, dataObject) {
  let changed = false;
  let destroyed = false;

  const prototype = Object.assign({}, model.options.api, {
    get changed() {
      return changed;
    },
    get destroyed() {
      return destroyed;
    },
    save(properties = {}) {
      dataObject.set(properties);

      return model.save(dataObject)
        .then((data) => {
          changed = false;
          return data;
        });
    },
    set(attr, val) {
      if (typeof attr === 'object') {
        Object.assign(dataObject, attr);
      } else if (typeof attr === 'string' || typeof attr === 'number') {
        dataObject[attr] = val;
      }

      changed = true;

      dataObject.trigger('change', dataObject);
    },
    remove() {
      destroyed = true;
      return model.remove(dataObject);
    },
    destroy() {
      destroyed = true;
      return model.destroy(dataObject);
    },
    validate(attribute) {
      return model.schema.validate(dataObject, attribute);
    },
    toString() {
      return JSON.stringify(dataObject);
    },
    toJSON() {
      return JSON.parse(this.toString());
    }
  });

  eventsMixinFactory(prototype);

  Object.setPrototypeOf(dataObject, prototype);

  return dataObject;
}


export default ModelInstance;