import { ref, computed, watch } from 'vue';

export function useFormValidation(schema) {
  const formData = ref({});
  const errors = ref({});
  const touched = ref({});
  const isValid = ref(false);

  // Validation rules
  const validationRules = {
    required: (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return value !== null && value !== undefined && value !== '';
    },
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value || emailRegex.test(value);
    },
    number: (value) => {
      return !value || !isNaN(Number(value));
    },
    min: (value, min) => {
      return !value || Number(value) >= min;
    },
    max: (value, max) => {
      return !value || Number(value) <= max;
    },
    minLength: (value, min) => {
      return !value || value.length >= min;
    },
    maxLength: (value, max) => {
      return !value || value.length <= max;
    },
    pattern: (value, pattern) => {
      if (!value) return true;
      const regex = new RegExp(pattern);
      return regex.test(value);
    }
  };

  // Validate a single field
  const validateField = (fieldName, value) => {
    const fieldSchema = schema[fieldName];
    if (!fieldSchema) return true;

    const fieldRules = Array.isArray(fieldSchema.rules) ? fieldSchema.rules : [];
    const fieldErrors = [];

    for (const rule of fieldRules) {
      if (typeof rule === 'string') {
        // Simple rule like 'required'
        if (!validationRules[rule](value)) {
          fieldErrors.push(`${fieldSchema.label || fieldName} es requerido`);
        }
      } else if (typeof rule === 'object') {
        // Rule with parameters like { type: 'min', value: 5 }
        const { type, value: ruleValue, message } = rule;
        if (!validationRules[type](value, ruleValue)) {
          fieldErrors.push(message || `${fieldSchema.label || fieldName} inválido`);
        }
      }
    }

    if (fieldErrors.length > 0) {
      errors.value[fieldName] = fieldErrors;
      return false;
    } else {
      delete errors.value[fieldName];
      return true;
    }
  };

  // Validate all fields
  const validateForm = () => {
    let isFormValid = true;

    for (const fieldName in schema) {
      const fieldValue = formData.value[fieldName];
      const isFieldValid = validateField(fieldName, fieldValue);
      if (!isFieldValid) {
        isFormValid = false;
      }
    }

    isValid.value = isFormValid;
    return isFormValid;
  };

  // Mark field as touched
  const touchField = (fieldName) => {
    touched.value[fieldName] = true;
    validateField(fieldName, formData.value[fieldName]);
  };

  // Reset validation
  const resetValidation = () => {
    errors.value = {};
    touched.value = {};
    isValid.value = false;
  };

  // Watch for form data changes
  watch(formData, (newFormData) => {
    for (const fieldName in newFormData) {
      if (touched.value[fieldName]) {
        validateField(fieldName, newFormData[fieldName]);
      }
    }
    validateForm();
  }, { deep: true });

  // Computed properties
  const hasErrors = computed(() => Object.keys(errors.value).length > 0);
  const firstError = computed(() => {
    const errorKeys = Object.keys(errors.value);
    return errorKeys.length > 0 ? errors.value[errorKeys[0]][0] : null;
  });

  return {
    formData,
    errors,
    touched,
    isValid,
    hasErrors,
    firstError,
    validateField,
    validateForm,
    touchField,
    resetValidation
  };
}
