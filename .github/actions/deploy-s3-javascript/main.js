const core = require('@actions/core');
// const github = require('@actions/github');
const exec = require('@actions/exec');

async function run() {
  try {
    core.notice('Hello from my custom javascript action');

    const bucket = core.getInput('bucket', { required: true });
    const region = core.getInput('region', { required: true });
    const dist_folder = core.getInput('dist_folder', { required: true });

    const s3url = `s3://${bucket}`;

    await exec.exec(
      `aws s3 sync ${dist_folder} ${s3url} --region ${region}`
    );

    core.notice('S3 sync completed successfully');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();