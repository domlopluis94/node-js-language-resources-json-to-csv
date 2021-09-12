const chalk = require('chalk');
const fs = require('fs');
const converter = require('json-2-csv');
const csv=require('csvtojson')

module.exports ={
    async unifyFilesIntoJson(filesNames,workingDir){
        return new Promise(async(Resolve,Rejects)=>{
            //mirar primero si description esta lleno
            var DescJson = await this.getJsonFromFile("Description.json", workingDir);
            var fullJson = {};
            fullJson = await this.mixJson(fullJson,DescJson,"Description");
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
            var $this = this;
            Object.keys(jsonSon).forEach(function(key) {
                console.log(typeof jsonSon[key]);
                switch(typeof jsonSon[key]){
                    case "string":
                        jsonFather = $this.insertKeyValue(jsonFather,filename,key,jsonSon[key]);
                        break;
                    case "object":
                        jsonFather = $this.insertSons(jsonFather,filename,key,jsonSon[key]);
                        break;
                    case "array":
                        jsonFather = $this.insertArray(jsonFather,filename,key,jsonSon[key]);
                        break;
                    default:
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

    insertKeyValue(jsonFather,filename,key,value ){
        if (jsonFather[key] != undefined ) {
            if (jsonFather[key][filename] != undefined) {
                jsonFather[key][filename] = value;
            }else{
                jsonFather[key][filename] = {};
                jsonFather[key][filename] = value;
            }   
        }else{
            if (filename == "Description") {
                jsonFather[key] = {};
            }else{
                jsonFather[key] = {
                    'description':''
                };
            }
            jsonFather[key][filename] = value;
        }
        return jsonFather;
    },

    insertSons(jsonFather,filename,key,jsonSon){
        var $this = this;
        Object.keys(jsonSon).forEach(function(secondkey) {
            switch(typeof jsonSon[secondkey]){
                case "string":
                    jsonFather = $this.insertKeyValue(jsonFather,filename,`${key}.${secondkey}`,jsonSon[secondkey]);
                    break;
                case "object":
                    jsonFather = $this.insertSons(jsonFather,filename,`${key}.${secondkey}`,jsonSon[secondkey]);
                    break;
                case "array":
                    jsonFather = $this.insertArray(jsonFather,filename,`${key}.${secondkey}`,jsonSon[secondkey]);
                    break;
                default:
                    console.log(typeof jsonSon[secondkey]);
            }
        });
        return jsonFather;
    },

    insertArray(jsonFather,filename,key,jsonSon){
        if (jsonFather[key] != undefined ) {
            if (jsonFather[key][filename] != undefined) {
                jsonFather[key][filename] = value;
            }else{
                jsonFather[key][filename] = value;
            }   
        }else{

            jsonFather[key] = {
                'description':''
            };
            jsonFather[key][filename] = jsonSon[key];
        }
        return jsonFather;
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


    /**
     * 
     * @param {*} fullJson 
     * @returns 
     */
    async splitJsonCsvInJsonFiles(fullJson){
        var $this = this;
        return new Promise((Resolve,Rejects)=>{
            let nOfKeys = Object.keys(fullJson[0]).length;
            let jsonSplited = [];
            fullJson.forEach((element) =>{
                Object.keys(element).forEach( async function(key) {
                    if (key != "key") {
                        let fileName = `${key}.json`
                        if (jsonSplited[fileName] == undefined) {
                            jsonSplited[fileName] = {};
                        }
                        if (element.key.includes(".")) {
                            try {
                                jsonSplited[fileName] = await $this.insertSonsonJson(jsonSplited[fileName],element.key,element[key]);
                            } catch (error) {
                                console.error(error);
                            }
                            
                        } else {
                            jsonSplited[fileName][element.key] = element[key];
                        }   
                    }
                });
            })
            Resolve(jsonSplited);
        });
    },

    async insertSonsonJson(fullJson,sonsNames,value){
        return new Promise(async (Resolve,Rejects)=>{
            let sons = sonsNames.split(".");
            if (sons.length > 1) {
                if (fullJson[sons[0]] == undefined) {
                    if (!isNaN(sons[1])) {
                        fullJson[sons[0]] = [];
                    } else {
                        fullJson[sons[0]] = {};
                    }     
                }
                sonsNames = sonsNames.replace(`${sons[0]}.`,"");
                fullJson[sons[0]] = await this.insertSonsonJson(fullJson[sons[0]],sonsNames,value); 
            }else{
                fullJson[sons[0]] = value;
            }
            Resolve(fullJson);
        });
    }

}









