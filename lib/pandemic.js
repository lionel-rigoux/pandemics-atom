'use babel';

import { CompositeDisposable } from 'atom';
import { publishAsync } from 'pandemic';

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that publishes this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pandemic:publish': () => this.publish()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
    };
  },

  publish() {
    console.log('entering publish')

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

    atom.notifications.addInfo(`Publishing ${filePath}...`);
    publishAsync({source: filePath})
    .then((val) => {
      atom.notifications.addSuccess(`Published successfully!`);
    })
    .catch((err) => {
      atom.notifications.addError(`Publishing failed (${err.message})`);
    })

  }

};
