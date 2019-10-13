'use babel';

import { CompositeDisposable } from 'atom';
const path = require('path');
const cp = require('child_process');
const pandemics = require('pandemics');

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that publishes this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pandemics:publish': () => this.publish()
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
      console.log('pandemics: can not find an open editor.')
      return;
    }

    // get path to current file
    const filePath = atom.workspace.getActiveTextEditor().getPath();

    // check that we're working on a markdown file
    if (path.extname(filePath) !== '.md') {
      atom.notifications.addWarning('Pandemics can only publish markdown files.')
      console.log('pandemics: not a markdown file.')
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

    // + add path to node in the env
    const env = process.env;
    env.PATH += path.delimiter + path.join(process.resourcesPath, 'app', 'apm', 'bin');

    // + call pandemics in separate thread to avoid blocking
    const worker = cp.fork(
      __dirname + '/publish-worker.js',
      [filePath],
      {env, stdio: 'inherit'}
    );

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
