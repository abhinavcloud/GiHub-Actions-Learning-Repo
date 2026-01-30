const core = require('@actions/core');
// const github = require('@actions/github');
const exec = require('@actions/exec');

function run() {

    //Get Input Values
    core.notice('Hello from my custom java script action')
    const bucket = core.getInput('bucket', {required: true});
    const region = core.getInput('region', {required: true});
    const dist_folder = core.getInput('dist_folder', {required: true});
    const s3url = `s3://${bucket}`
    
    //Upload the files
    
    exec.exec(`aws s3 sync ${dist_folder} ${s3url} --region ${region}`)
}

run();