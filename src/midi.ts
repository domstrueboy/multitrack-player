import {WebMidi} from 'webmidi';

export function initMidi() {
  return new Promise((resolve, reject) => {
    WebMidi.enable(err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function inputs() {
  return WebMidi.inputs;
}

export function getInput(name) {
  return WebMidi.getInputByName(name);
}

export function initMidiEvents(deviceName, store) {
  const input = getInput(deviceName);

  input.removeListener();
  input.addListener('noteon', 'all', event => {
    store.dispatch(
      store.rootState.controlEditMode
        ? 'setControlEdit'
        : 'triggerControlAction',
      { type: 'note', value: event.note.number }
    );
  });
  input.addListener('controlchange', 'all', event => {
    if (event.value !== 127) {
      return;
    }
    store.dispatch(
      store.rootState.controlEditMode
        ? 'setControlEdit'
        : 'triggerControlAction',
      { type: 'controlChange', value: event.controller.number }
    );
  });
}
