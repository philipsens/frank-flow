import ToBeautifulSyntax from '../View/codeView/ToBeautifulSyntax.js';
import JSZip from '../../node_modules/jszip/dist/jszip.js';


export default class CodeService {
    constructor(codeView, ibisdocModel, xsdModel, mainController) {
        this.ibisdocModel = ibisdocModel;
        this.xsdModel = xsdModel;
        this.codeView = codeView;
        this.mainController = mainController;
        this.toBeautiful = new ToBeautifulSyntax();

        this.getXsd();
        this.getIbisdoc();
        this.getConfigurations();
    }

    getIbisdoc() {
        let cur = this;
        fetch('../rest/ibisdoc/ibisdoc.json', {
            method: 'GET'
        })
            .then(response => {
                console.log("get the docs!")
                return response.json()
            })
            .then(data => {
                cur.codeView.ibisdocJson = data;
                cur.ibisdocModel.setIbisdoc(data);
                cur.mainController.setPipes(data);
            })
            .catch(err => {
                console.log("couldn't load ibisdoc, now switching to default ibisdoc", err);
                this.getDefaultIbisdoc();
            })

    }

    getDefaultIbisdoc() {
        let cur = this;
        fetch('https://cors-anywhere.herokuapp.com/https://ibis4example.ibissource.org/rest/ibisdoc/ibisdoc.json', {
            method: 'GET'
        })
            .then(response => {
                console.log(response)
                return response.json()
            })
            .then(data => {
                console.log(data)
                cur.codeView.ibisdocJson = data;
                cur.ibisdocModel.setIbisdoc(data);
                cur.mainController.setPipes(data);
            })
            .catch(err => {
                alert("couldn't load pipe palette");
                console.log(err);

            })
    }

    getXsd() {
        fetch('../rest/ibisdoc/ibisdoc.xsd', {
            method: 'GET'
        })
            .then(response => {
                return response.text()
            })
            .then(data => {
                this.xsdModel.xsd = data;
                console.log("xsd is loaded!, here");
            })
            .catch(err => {
                console.log("couldn't load xsd, now loading deafult xsd", err);
                this.getDefaultXsd();
            })
    }

    getDefaultXsd() {
        fetch('https://cors-anywhere.herokuapp.com/https://ibis4example.ibissource.org/rest/ibisdoc/ibisdoc.xsd', {
            method: 'GET'
        })
            .then(response => {
                return response.text()
            })
            .then(data => {
                this.xsdModel.xsd = data;
                console.log("xsd is loaded!, here");
            })
            .catch(err => {
                console.log("not loaded xsd", err);
            })
    }

    getConfigurations(secondTry) {
        let cur = this,
            path = '../iaf/api/configurations';
        if (secondTry) {
            path = '../' + path;
        }
        fetch(path, {
            method: 'GET'
        })
            .then(response => {
                return response.text();
            })
            .then(response => {
                let configurations = [],
                    dom, obj;
                response.match(/<[cC]onfiguration[^]*?>[^]*?<\/[cC]onfiguration>|<IOS-Adaptering[^]*?>[^]*?<\/IOS-Adaptering>/g).forEach(function (item, index) {
                    if (item != null) {
                        configurations.push(item);
                    } else {
                        console.log('unknown configuration encountered');
                    }
                })

                return configurations;
            })
            .then(response => {
                response.forEach(function (item, index) {
                    if (item.match(/<Configuration/g) == null) {
                        if (item.match(/IOS-Adaptering/g) != null) {
                            item = item.replace(/IOS-Adaptering/g, 'Configuration');
                        }
                        response[index] = cur.toBeautiful.toBeautifulSyntax(item);
                    } else {
                        //localStorage.setItem(index, item);
                    }

                });
                return response;
            })
            .then(data => {
                name = data[3].match(/<Configuration[^]*?name=".*?"/g);
                cur.loadZip(name);
                //cur.codeView.addOptions(data);
            })
            .catch(err => {
                if (secondTry) {
                    console.log('couldnt load configurations', err)
                } else {
                    console.log("configurations path was incorrect, trying other path now...", err);
                    //cur.getConfigurations(true);
                }
            })
    }

    loadZip(configurationName) {
        configurationName = configurationName.match(/".*?"/g)[0].replace(/"/g, '');
        console.log(configurationName)
        const versionPath = 'http://localhost/iaf/api/configurations/' + configurationName + '/versions';
        const options = {
            headers: {
                'Content-disposition': 'attachment; filename="filename.jpg"'
            },
            method: 'GET'
        }
        fetch(versionPath, options)
        .then(response => {
            return response.json();
        })
        .then(data => {
            if(data) {
                let version = prompt('please enter a version number');
                let ver = data[0].version;

                data.forEach(function(item, i) {               
                    if(item.version.match(version + '(?=_)')) {
                        ver = item.version;
                    }
                })
                let zipPath = 'http://localhost/iaf/api/configurations/' + configurationName + '/versions/' + ver + '/download';
                fetch(zipPath, {method: 'GET'}).then(response => {
                    return response.blob();
                })
                .then(zipFile => {
                    this.mainController.codeController.fileTreeView.makeTree(zipFile);                    
                })
            }
        })
    }
}