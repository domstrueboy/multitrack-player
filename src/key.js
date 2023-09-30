export function initKeyEvents(store) {
  document.addEventListener('keyup', event => {
    store[store.controlEditMode ? 'setControlEdit' : 'triggerControlAction']({
      type: 'key',
      value: event.key
    });
  });
}
