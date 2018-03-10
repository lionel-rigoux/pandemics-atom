'use babel';

import { CompositeDisposable } from 'atom';
import Pandemic from 'pandemic';

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pandemic:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
    };
  },

  toggle() {
    console.log('Pandemic was toggled!');

    const curEditor = atom.workspace.getActiveTextEditor();

    if ( curEditor.isModified() ) {
      const cancel = atom.confirm({
        message: 'You have unsaved changes. Save before publishing?',
        buttons: ['Yes','Cancel']
      })

      if (cancel) {
        return;
      } else {
        curEditor.save()
        atom.notifications.addInfo('The document has beend saved');
      }
    }

    const filePath = atom.workspace.getActiveTextEditor().getPath();
    try {
      Pandemic.publish({source: filePath});
      atom.notifications.addSuccess(`Published ${filePath}`);
    } catch (err) {
      atom.notifications.addError(`Publishing failed (${err.message})`);
    }
  }

};
