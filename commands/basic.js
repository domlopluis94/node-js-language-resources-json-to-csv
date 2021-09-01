const chalk = require('chalk');
const fs = require('fs');
const converter = require('json-2-csv');


async function basic (dirName){
    const workingDir = `${process.cwd()}/${dirName}`;
    console.log(chalk.green.bold(`Searching ${workingDir}`));

    // detectar ficheros para su uso basico
    let files =[]
    try {
        files = await validateFiles(workingDir);
    } catch (error) {
        console.log(chalk.redBright.bold(`Create EN.json and Description.json to continue`));
        console.error(error);
    }
    // unificar en un unico json
    let fullJson;
    try {
        fullJson = await unifyFilesIntoJsaon(files,workingDir);
    } catch (error) {
        console.log(chalk.redBright.bold(`${error}`));
        console.error(error);
    }
    // pasar json a csv
    console.log(fullJson)
    json2csv(fullJson,workingDir);
}

function validateFiles(workingDir){
    return new Promise((Resolve,Rejects)=>{
        let filesNames = [];
        fs.readdir(workingDir, (err, files) => {
            let nFilestotransform = 0;
            let stringOfallNames = "";

            files.forEach(file => {
              if (file.includes(".json")) {
                  filesNames[nFilestotransform] = file;
                  nFilestotransform++;
                  stringOfallNames += ` ${file}`;
              }
            });
            console.log(chalk.green.bold(`Files detected ${stringOfallNames}`));

            if (stringOfallNames.includes("EN.json") && stringOfallNames.includes("Description.json")) {
                
                Resolve(filesNames);
            }else{
                Rejects("You dont have the basics files");
            }
        });
    })
}

async function unifyFilesIntoJsaon(filesNames,workingDir){
    return new Promise(async(Resolve,Rejects)=>{
        //mirar primero si description esta lleno
        var fullJson = await getJsonFromFile("Description.json", workingDir);
        //si esta lleno lo validamos con los ficheros , sino usamos EN como base
        let ENjson = await getJsonFromFile("EN.json", workingDir);
        fullJson = await mixJson(fullJson,ENjson,"EN");
        //mirar para el resto de ficheros
        for (const file of filesNames) {
            if (!file.includes("EN.json") && !file.includes("Description.json")) {
                let filejson = await getJsonFromFile(file, workingDir);
                fullJson = await mixJson(fullJson,filejson,file.replace(".json",""));
            }
        }
        Resolve(fullJson);
    });

}

async function getJsonFromFile(file,workingDir){
    return new Promise((Resolve,Rejects)=>{
        let rawdata = fs.readFileSync(`${workingDir}/${file}`);
        let json = null;
        try {
            json = JSON.parse(rawdata);
        } catch (error) {
            console.error(error);
            json = {};
        }
        Resolve(json);
    });
}

async function mixJson(jsonFather,jsonSon,filename){
    return new Promise((Resolve,Rejects)=>{
        console.log(jsonFather);
        Object.keys(jsonSon).forEach(function(key) {
            if (jsonFather[key] != undefined ) {
                if (jsonFather[key][filename] != undefined) {
                    jsonFather[key][filename] = jsonSon[key];
                }else{
                    jsonFather[key][filename] = jsonSon[key];
                }   
            }else{
    
                jsonFather[key] = {
                    'description':''
                };
                jsonFather[key][filename] = jsonSon[key];
            }
        });
        Object.keys(jsonFather).forEach(function(key) {
            if (jsonFather[key][filename] == undefined) {
                jsonFather[key][filename] = ""
            }
        });
        Resolve(jsonFather);
    });
    
}

function json2csv(json,workingDir){
    let finalJson =[];
    Object.keys(json).forEach(function(key) {
        json[key]["key"] = key;
        finalJson.push(json[key]);
    });
    writecsv(finalJson,workingDir+"/resources.csv");
}

function writecsv(json,filename){
      // print CSV string
    converter.json2csv(json, (err, csv) => {
        if (err) {
            throw err;
        }
        fs.writeFileSync(filename, csv);
    });
}

module.exports = basic