
export function activateFormatListeners(html) {
  html.on('input', '.input-sizer-input', (event) => _onUpdateInputSize(event));

  const sheet = html[0].closest('.window-content');
  sheet.querySelectorAll('.input-sizer-input').forEach((input) => _updateInputSize(input));
}

function _updateInputSize(input) {
  const parent = input.parentNode;

  if (input.value) {
    parent.dataset.value = input.value;
  }
  else if (parent.dataset.defaultValue) {
    parent.dataset.value = parent.dataset.defaultValue;
  }
  else {
    parent.dataset.value = '_';
  }
}

function _onUpdateInputSize(event) {
  event.preventDefault();

  _updateInputSize(event.currentTarget);
}