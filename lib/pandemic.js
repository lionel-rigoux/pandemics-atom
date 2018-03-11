'use babel';

import { CompositeDisposable } from 'atom';
import { extname, resolve } from 'path';
const cp = require('child_process');

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
    const editor = atom.workspace.getActiveTextEditor();

    // no opened file on focus
    if (!editor){
      console.log('pandemic: can not find an open editor.')
      return;
    }

    // get path to current file
    const filePath = atom.workspace.getActiveTextEditor().getPath();

    // check that we're working on a markdown file
    if (extname(filePath) !== '.md') {
      atom.notifications.addWarning('Pandemic can only publish markdown files.')
      console.log('pandemic: not a markdown file.')
      return;
    }
    // Save the bugger before compiling?
    if (editor.isModified()) {
      const cancel = atom.confirm({
        message: 'You have unsaved changes. Save before publishing?',
        buttons: ['Yes','Cancel']
      })

      if (cancel) {
        return;
      } else {
        editor.save()
        atom.notifications.addInfo('The document has beend saved');
      }
    }

    // start publishing
    atom.notifications.addInfo(`Publishing ${filePath}...`);

    // + call pandemic in separate thread to avoid blocking
    const worker = cp.fork(
      __dirname + '/publish-worker.js',
      [filePath]
    );
    worker.send(filePath);
    // + catch child errors
    worker.on('message', (err) => {
      console.log(`worker failed: ${err}`);
      atom.notifications.addError(
        `Publishing failed`,
        {detail: err}
      );
    });
    // + catch child exit
    worker.on('exit', (code, signal) => {
      if (code === 0) {
        atom.notifications.addSuccess(`Published successfully!`);
      }
    });


  }

};
