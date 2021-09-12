#! /usr/bin/env node
const { program } = require('commander');
const basic = require('./src/commands/basic');
const init = require('./src/commands/init.ts');

program
    .command('basic <DirName>')
    .description('Case 1 -> 1 argument set de Dir with the json files \n Case 2 -> 1 argument set de csv file of the resources')
    .action(basic);

program
    .command('init')
    .description('Case 1 -> Creates de basics files')
    .action(init);



program.parse()
