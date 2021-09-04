#! /usr/bin/env node
const { program } = require('commander');
const basic = require('./src/commands/basic');

program
    .command('basic <DirName>')
    .description('Case 1 -> 1 argument set de Dir with the json files \n Case 2 -> 1 argument set de csv file of the resources')
    .action(basic);

program.parse()