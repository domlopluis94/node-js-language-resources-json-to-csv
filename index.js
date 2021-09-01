#! /usr/bin/env node
const { program } = require('commander');
const basic = require('./commands/basic');

program
    .command('basic <DirName>')
    .description('List all the TODO tasks')
    .action(basic);


program.parse()