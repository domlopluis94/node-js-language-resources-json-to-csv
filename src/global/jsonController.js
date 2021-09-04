const chalk = require('chalk');
const fs = require('fs');
const converter = require('json-2-csv');
const csv=require('csvtojson')

module.exports ={
    async unifyFilesIntoJson(filesNames,workingDir){
        return new Promise(async(Resolve,Rejects)=>{
            //mirar primero si description esta lleno
            var fullJson = await this.getJsonFromFile("Description.json", workingDir);
            //si esta lleno lo validamos con los ficheros , sino usamos EN como base
            let ENjson = await this.getJsonFromFile("EN.json", workingDir);
            fullJson = await this.mixJson(fullJson,ENjson,"EN");
            //mirar para el resto de ficheros
            for (const file of filesNames) {
                if (!file.includes("EN.json") && !file.includes("Description.json")) {
                    let filejson = await this.getJsonFromFile(file, workingDir);
                    fullJson = await this.mixJson(fullJson,filejson,file.replace(".json",""));
                }
            }
            Resolve(fullJson);
        });
    
    },
    async getJsonFromFile(file,workingDir){
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
    },

    async mixJson(jsonFather,jsonSon,filename){
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
        
    },

    json2csv(json,workingDir){
        let finalJson =[];
        Object.keys(json).forEach(function(key) {
            json[key]["key"] = key;
            finalJson.push(json[key]);
        });
        this.writecsv(finalJson,workingDir+"/resources.csv");
    },

    writecsv(json,filename){
        // print CSV string
      converter.json2csv(json, (err, csv) => {
          if (err) {
              throw err;
          }
          fs.writeFileSync(filename, csv);
      });
    },

    validateFiles(workingDir){
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
    },

    async readCsvAsJson(workingDir){
        const jsonArray=await csv().fromFile(workingDir);
        return jsonArray;
    },

    async jsonToFile(fullJson,fileName){
        let data = JSON.stringify(fullJson, null, 4);
        fs.writeFileSync(fileName, data);
    },

    async splitJsonCsvInJsonFiles(fullJson){
        return new Promise((Resolve,Rejects)=>{
            let nOfKeys = Object.keys(fullJson[0]).length;
            let jsonSplited = [];
            fullJson.forEach((element) =>{
                Object.keys(element).forEach(function(key) {
                    if (key != "key") {
                        let fileName = `${key}.json`
                        if (jsonSplited[fileName] == undefined) {
                            jsonSplited[fileName] = {};
                            jsonSplited[fileName][element.key] = element[key];
                        } else {
                            jsonSplited[fileName][element.key] = element[key];
                        }   
                    }
                });
            })
            Resolve(jsonSplited);
        });
    }

}









