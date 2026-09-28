/**
 * Thin wrapper around @material/web.
 *
 * This module is the ONLY place allowed to import the component library
 * directly (enforced by ESLint). Business code imports this module (or uses
 * the `md-*` elements in markup after importing it once).
 *
 * Icons are intentionally NOT from @material/web: inline SVG keeps the site
 * free of third-party font requests.
 */
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/select/select-option.js';
import '@material/web/select/outlined-select.js';
import '@material/web/switch/switch.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/textfield/outlined-text-field.js';

export type MdFilledButton = HTMLElement & { disabled?: boolean };
export type MdOutlinedButton = HTMLElement & { disabled?: boolean };
export type MdTextButton = HTMLElement & { disabled?: boolean };
export type MdFilledTonalButton = HTMLElement & { disabled?: boolean };
export type MdIconButton = HTMLElement & { disabled?: boolean; selected?: boolean };
export type MdCheckbox = HTMLElement & { checked: boolean; disabled?: boolean };
export type MdSwitch = HTMLElement & { selected: boolean; disabled?: boolean };
export type MdOutlinedSelect = HTMLElement & { value: string; disabled?: boolean };
export type MdOutlinedTextField = HTMLElement & {
  value: string;
  type?: string;
  label?: string;
  required?: boolean;
  error?: boolean;
  errorText?: string;
  disabled?: boolean;
  helper?: string;
};
export type MdFilledTextField = MdOutlinedTextField;
