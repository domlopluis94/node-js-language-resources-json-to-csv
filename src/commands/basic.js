const chalk = require('chalk');
const fs = require('fs');
const global = require('./../global/jsonController.js')


async function basic (dirName){
    if (dirName.includes(".csv")) {
        basicCsvToJson(dirName);
    }else{
        basicJsonToCsv(dirName);
    }
}


async function basicJsonToCsv(dirName){
    const workingDir = `${process.cwd()}/${dirName}`;
    console.log(chalk.green.bold(`Searching ${workingDir}`));

    // detectar ficheros para su uso basico
    let files =[]
    try {
        files = await global.validateFiles(workingDir);
    } catch (error) {
        console.log(chalk.redBright.bold(`Create EN.json and Description.json to continue`));
        console.error(error);
    }
    // unificar en un unico json
    let fullJson;
    try {
        fullJson = await global.unifyFilesIntoJson(files,workingDir);
    } catch (error) {
        console.log(chalk.redBright.bold(`${error}`));
        console.error(error);
    }
    // pasar json a csv
    console.log(fullJson)
    global.json2csv(fullJson,workingDir);
}


async function basicCsvToJson(dirName){
    const workingDir = `${process.cwd()}/${dirName}`;
    console.log(chalk.green.bold(`Searching ${workingDir}`));

    // detectar ficheros para su uso basico
    let fullJson;
    try {
        fullJson = await global.readCsvAsJson(workingDir);
    } catch (error) {
        console.log(chalk.redBright.bold(error));
    }

    if (fullJson != undefined) {
        global.jsonToFile(fullJson,`FullLang.json`);
        let jsonSplitedByFile = await global.splitJsonCsvInJsonFiles(fullJson);
        if (jsonSplitedByFile != undefined) {
            Object.keys(jsonSplitedByFile).forEach(function(key) {
                global.jsonToFile(jsonSplitedByFile[key],key);
            });
        }

    }
}
module.exports = basic