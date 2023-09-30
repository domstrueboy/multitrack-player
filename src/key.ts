export function initKeyEvents(store) {
  document.addEventListener('keyup', event => {
    const payload = {
      type: 'key',
      value: event.key
    };
    if (store.controlEditMode) {
      store.setControlEdit(payload);
    }  else {
      store.triggerControlAction(payload)
    }
  });
}
