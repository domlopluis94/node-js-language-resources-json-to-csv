const chalk = require('chalk');
const fs = require('fs');
const jsoncontroler = require('./../global/jsonController.js')


async function init (){
    await CreateFiles();
}


async function CreateFiles(){
    return new Promise((resolve, reject) => {
        console.log(chalk.green.bold("Creating Files"));
        let en = {
            hi:"Welcome"
        }
        jsoncontroler.jsonToFile(en,"EN.json");
        console.log(chalk.green.bold("Creating EN.json Files"));
        en.hi = "Bienvenido";
        jsoncontroler.jsonToFile(en,"ES.json");
        console.log(chalk.green.bold("Creating ES.json Files"));
        en.hi = "Welcome Message";
        jsoncontroler.jsonToFile(en,"Description.json");
        console.log(chalk.green.bold("Creating Description.json Files"));
        
    });
}
module.exports = init