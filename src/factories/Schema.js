import _ from 'lodash';

// @todo make all properties of ModelInstance illegal model schema attributes/properties
const Schema = function (options = {}, _model = {}) {

  function validateAttribute(model, attribute) {
    let valid = true;

    if (options[attribute]) {
      _.each(options[attribute], (propertyValue, property) => {
        const modelValue = model[property];

        if (!runAttributeProperty(property, propertyValue, modelValue)) {
          return valid = false;
        }
      })
    }

    return valid;
  }

  function runAttributeProperty(property, propertyValue, modelValue) {
    if (attributeProperties[property]) {
      return attributeProperties[property](propertyValue, modelValue);
    }
  }

  return _model.schema = {

    validate(model, attribute) {
      let valid = true;

      if (attribute) {
        valid = validateAttribute(model, attribute);
      } else {
        _.each(model, (v, attr) => {
          if (!validateAttribute(model, attr)) {
            return valid = false;
          }
        });
      }

      return valid;
    },

    coerce(model) {
      // type coerce the model to match the schema
      return model;
    },

    strict(model) {
      return _.omit(model, (v, attr) => {
        return !options[attr];
      });
    }

  };
};

const typeCoercers = {
  // from: {to(){}}
  number: {
    string(val) {
      return '' + val;
    }
  },
  string: {
    number(val) {
      return parseInt(val, 10);
    }
  }
};

const attributeProperties = {
  type(schemaValue, modelValue) {
    if (typeof schemaValue === 'string') {
      return typeof modelValue === schemaValue;
    } else if (typeof schemaValue === 'function') {
      return modelValue instanceof schemaValue;
    }

    return true;
  },
  required(schemaValue, modelValue) {

  },
  validate(schemaValue, modelValue) {
    if (typeof schemaValue === 'function') {
      return schemaValue(modelValue);
    }

    return true;
  },
  unique(schemaValue, modelValue) {

  },
  defaultsTo(schemaValue, modelValue) {

  }
};

export default Schema;