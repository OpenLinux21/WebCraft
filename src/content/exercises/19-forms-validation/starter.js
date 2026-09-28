// Lesson 19 - Forms and client-side validation.
// Goal: on submit, validate every field with the Constraint Validation
// API and show one specific inline error message per invalid field.

const form = document.querySelector('#signup');
const successMessage = document.querySelector('#success');

// The three fields, in the order they appear on screen.
const fields = ['name', 'email', 'password'].map((id) => document.getElementById(id));

// TODO 1: write a helper getErrorMessage(field) that inspects
// field.validity and returns a human sentence:
//   - validity.valueMissing  -> "Please enter your name." (per field)
//   - validity.typeMismatch  -> email format message
//   - validity.tooShort      -> a message that mentions the 8-character
//                               minimum (field.getAttribute("minlength"))
//   - otherwise              -> a generic "Please check this field."

// TODO 2: write two small helpers:
//   showError(field, message) - find the .field-error element inside the
//     same .field wrapper (field.closest(".field")), set its textContent,
//     and remove its hidden attribute.
//   clearError(field) - empty that element's text and hide it again.

// TODO 3: listen for "submit" on the form. Call event.preventDefault(),
// then loop over the fields in order: show or clear each error, and
// remember the first invalid field. After the loop, focus that field
// so keyboard users land where the problem is.

// TODO 4: when every field is valid, hide all errors and unhide
// successMessage. If the user submits again with errors, hide the
// success message first.

// Stretch: on each field's "input" event, clear its error as soon as
// the value becomes valid again.
