import taskLib = require('azure-pipelines-task-lib/task');
import toolLib = require('azure-pipelines-tool-lib/tool');
import os = require('os');
import fs = require('fs');
import path = require('path');

const isWindows = os.type().match(/^Win/);
const terragruntToolName = "terragrunt";

async function run() {
    console.log("Starting Download")
    try {
        const versionNumber = getVersion();
        console.log(`Selected version: ${versionNumber}`)
        const extension = os.platform() === 'win32' ? '.exe': '';

        let cached = toolLib.findLocalTool(terragruntToolName, versionNumber);
        if (!cached) {

            const downloadUrl = downloadLink(versionNumber, os.platform(), os.arch(), extension);

            const downloaded: string = await toolLib.downloadTool(downloadUrl);

            cached = await toolLib.cacheFile(downloaded,`terragrunt${extension}`,`terragrunt`, versionNumber);
        }

        let terragruntPath = findTerragruntExecutable(cached);
        if (!terragruntPath) {
            throw new Error(taskLib.loc("TerragruntNotFoundInFolder", cached));
        }

        if (!isWindows) {
            fs.chmodSync(terragruntPath, "777");
        }
        
        toolLib.prependPath(cached);

        taskLib.setResult(taskLib.TaskResult.Succeeded, 'Terragrunt has been installed at ' + terragruntPath);
        
    }
    catch (err: any) {
        taskLib.setResult(taskLib.TaskResult.Failed, err.message);
    }
}

const getVersion = function(): string {
    const versionNumber = taskLib.getInput('terragruntversion', true);
    
    if (versionNumber) {
        return versionNumber;
    } else {
        throw new Error("No version specified")
    }
}

const downloadLink = function(version: string, os: string, arch: string, extension: string): string {
    if (os == 'win32') {
        os = 'windows';
    }

    if (arch == 'x32') {
        arch = '386';
    } else if (arch == 'x64') {
        arch = 'amd64';
    }
        
    // Add linux and MacOS to this.
    return `https://github.com/gruntwork-io/terragrunt/releases/download/v${version}/terragrunt_${os}_${arch}${extension}`;
}

function findTerragruntExecutable(rootFolder: string): string {
    let terragruntPath = path.join(rootFolder, terragruntToolName + getExecutableExtension());
    var allPaths = taskLib.find(rootFolder);
    var matchingResultFiles = taskLib.match(allPaths, terragruntPath);
    return matchingResultFiles[0];
}

function getExecutableExtension(): string {
    if (isWindows) {
        return ".exe";
    }

    return "";

}

run();