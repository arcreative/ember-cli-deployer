#!/usr/bin/env node

require('colors');

// Parse command line
var argv = require('yargs')
             .usage('Usage: app-name [branch-name]')
             .demand(1)
             .argv;

var nodegit = require('nodegit'),
    clone = nodegit.Clone.clone,
    Cred = nodegit.Cred,
    rimraf = require('rimraf');

var appName = argv._[0],
    appBranch = argv._[1] || 'master';

// Get all app configs
try {
  var appsConfig = require('./apps.json');
} catch (e) {
  console.log('Error reading apps.json'.red);
  process.exit(1);
}

// Get individual app config
var appConfig = appsConfig[appName];
if (!appConfig) {
  console.log(('No configuration found for `' + appName + '`').red);
  process.exit(1);
}

// Clone options
var options = {
  checkoutBranch: appBranch,
  remoteCallbacks: {
    credentials: function(url, userName) {
      console.log(('Authorizing with SSH key for user `' + userName + '`...').cyan);
      return Cred.sshKeyFromAgent(userName);
    }
  }
};

// Remove old directory
rimraf.sync('./tmp/' + appName);

// Clone
console.log(('Attempting to clone into `tmp/' + appName + '`').cyan);
clone(appConfig.repository_url, './tmp/' + appName, options)
    .then(function() {
      console.log('Clone successful.'.green);
    }, function(errors) {
      console.log('Failed to clone app:'.red);
      console.log(errors);
      process.exit(1);
    });
