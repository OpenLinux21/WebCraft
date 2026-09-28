// Lesson 19 - Forms and client-side validation (solution).
// The native engine detects the problems; this script only decides
// how the problems are communicated.

const form = document.querySelector('#signup');
const successMessage = document.querySelector('#success');

// The three fields, in the order they appear on screen.
const fields = ['name', 'email', 'password'].map((id) => document.getElementById(id));

const labels = { name: 'name', email: 'email address', password: 'password' };

// Translate validity flags into one human sentence per field.
function getErrorMessage(field) {
  const what = labels[field.id];
  const validity = field.validity;

  if (validity.valueMissing) {
    return `Please enter your ${what}.`;
  }
  if (validity.typeMismatch) {
    return `That does not look like a valid ${what}.`;
  }
  if (validity.tooShort) {
    const min = field.getAttribute('minlength');
    return `Your ${what} needs at least ${min} characters.`;
  }
  return `Please check your ${what}.`;
}

function errorElement(field) {
  return field.closest('.field').querySelector('.field-error');
}

function showError(field, message) {
  const error = errorElement(field);
  error.textContent = message;
  error.hidden = false;
}

function clearError(field) {
  const error = errorElement(field);
  error.textContent = '';
  error.hidden = true;
}

function hideAllErrors() {
  fields.forEach(clearError);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  // The success banner is only shown for a fully valid pass.
  successMessage.hidden = true;
  hideAllErrors();

  let firstInvalid = null;

  for (const field of fields) {
    if (field.checkValidity()) {
      clearError(field);
    } else {
      showError(field, getErrorMessage(field));
      if (firstInvalid === null) {
        firstInvalid = field;
      }
    }
  }

  if (firstInvalid) {
    firstInvalid.focus();
  } else {
    successMessage.hidden = false;
  }
});

// Stretch goal: once the user edits a field, clear its error as soon
// as the value becomes valid again. It keeps feedback feeling live.
fields.forEach((field) => {
  field.addEventListener('input', () => {
    if (field.checkValidity()) {
      clearError(field);
    }
  });
});
