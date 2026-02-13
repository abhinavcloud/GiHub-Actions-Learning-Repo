# 🚀 Build and Deploy Static Website via AWS S3 using GitHub Actions

This repository demonstrates a **complete CI/CD pipeline** for building, testing, and deploying a static website to **Amazon S3** using **GitHub Actions**.

We are not just deploying a website — we are learning:

- ✅ How to structure multi-job workflows  
- ✅ How to enforce quality gates (lint → test → build → deploy)  
- ✅ How to use reusable workflows  
- ✅ How to build a custom JavaScript GitHub Action  
- ✅ How to deploy static assets to  S3  
- ✅ How to manage secrets securely  
- ✅ How to pass artifacts between jobs  
- ✅ How to expose outputs across workflows  

---

# 📌 Architecture Overview

Push to main / project2 / dummy branch  
↓  
Lint  
↓  
Test  
↓  
Build  
↓  
Reusable Deploy Workflow  
↓  
Upload to AWS S3  
↓  
Print Static Website URL  

---

# 🧠 What We Are Building

We are creating a **production-grade CI/CD pipeline** that:

1. Runs lint checks  
2. Runs automated tests  
3. Builds the project  
4. Uploads build artifacts  
5. Calls a reusable workflow  
6. Authenticates with AWS  
7. Deploys files to an S3 bucket  
8. Prints the live static website URL  


---

# ⚙️ Workflow 1: Main CI/CD Pipeline

```yaml
name: Build and deploy Static Website via AWS S3

on:
  push:
    branches:
      - main
      - project2
      - dummy
```

Triggered on push to:

- `main`  
- `project2`  
- `dummy`  

---

# 🏗 Job 1: Lint

## Purpose:
Ensure code quality before anything else runs.

## What Happens:

1. Prints job-level secret (`ENV_OWNER`)  
2. Checks out repository  
3. Installs dependencies (with caching)  
4. Runs lint  

## What We Learn:

- How job-level secrets work  
- Using `actions/checkout`  
- Creating reusable local composite actions  
- Dependency caching using `hashFiles()`  
- Enforcing quality gates early  

## Why It Matters:

Fail fast → Save build minutes → Improve code standards  

---

# 🧪 Job 2: Test

```yaml
needs: lint
```

## Purpose:
Run automated tests only if lint passes.

## What Happens:

1. Checkout code  
2. Install dependencies  
3. Run `npm run test`  
4. Upload `test.json` if tests fail  

## Key Feature:

```yaml
if: failure() && steps.test-code-step.outcome == 'failure'
```

This condition ensures test reports upload **only when tests fail**.

## What We Learn:

- Job dependencies (`needs`)  
- Step IDs  
- Conditional execution  
- Uploading artifacts (`actions/upload-artifact`)  
- Failure-aware pipelines  

---

# 🏗 Job 3: Build

```yaml
needs: test
if: always() && (failure() || needs.test.result == 'success')
```

## Purpose:
Build project even if test fails — useful for debugging artifacts.

## What Happens:

1. Checkout  
2. Install dependencies  
3. Run `npm run build`  
4. Upload `dist/*` as artifact (`dist-files`)  

## What We Learn:

- Advanced conditional expressions  
- Using `always()`  
- Artifact persistence between jobs  
- Ensuring build output exists (`if-no-files-found: error`)  

---

# 🚀 Job 4: Deploy (Reusable Workflow)

Instead of writing deployment logic again, we use:

```yaml
uses: ./.github/workflows/reusable_workflow.yml
```

## Why Reusable Workflows?

- DRY principle  
- Share deployment logic across repositories  
- Clean separation of CI and CD  

## Inputs Passed:

- Cache path  
- Cache key  
- Artifact name  
- Artifact path  
- S3 bucket  
- AWS region  

## Secrets:

```yaml
secrets: inherit
```

Allows secure access to:

- `AWS_ACCESS_KEY_ID`  
- `AWS_SECRET_ACCESS_KEY`  

---

# 📦 Workflow 2: Reusable Deployment Workflow

```yaml
name: reusable-workflow-deploy

on:
  workflow_call:
```

This workflow:

- Accepts inputs  
- Exposes outputs  
- Deploys to AWS  

---

# 🔁 Reusable Job: reusbale-deploy

## Step 1 — Checkout Code

Standard repo checkout.

---

## Step 2 — Install Cached Dependencies

Reuses local composite caching action.

---

## Step 3 — Download Build Artifacts

```yaml
uses: actions/download-artifact@v4
```

Downloads `dist-files` into deployment folder.

---

## Step 4 — Configure AWS Credentials

```yaml
uses: aws-actions/configure-aws-credentials@v4
```

Authenticates securely with AWS.

This allows use of:

- AWS CLI  
- S3 commands  
- Infrastructure tools  

---

## Step 5 — Custom JavaScript Action (Advanced)

```yaml
uses: ./.github/actions/deploy-s3-javascript
```

Instead of directly running AWS CLI in YAML, we built a **custom GitHub Action using Node.js**.

---

# 🛠 Custom GitHub Action

## action.yml

```yaml
name: Deploy to AWS S3
description: Deploy a Static Website via AWS S3

runs:
  using: node20
  main: dist/index.js
```

This tells GitHub:

- Use Node 20 runtime  
- Execute compiled JavaScript  

---

## main.js Logic

```js
const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  try {
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
```

## What It Does:

- Takes inputs  
- Runs `aws s3 sync`  
- Syncs local build folder with S3 bucket  

## What We Learn:

- Creating JavaScript-based actions  
- Using `@actions/core`  
- Using `@actions/exec`  
- Running shell commands programmatically  
- Error handling with `core.setFailed()`  
- Writing production-ready reusable actions  

---

# 🌍 Deployment Target: Amazon S3 Static Hosting

We deploy to:

```
http://<bucket>.s3-website.ap-south-1.amazonaws.com
```

S3 is used as:

- Object storage  
- Static hosting platform  
- Global content delivery base  

## Why S3?

- Highly scalable  
- Low cost  
- Reliable  
- Perfect for static sites  

---

# 🔗 Passing Outputs Between Workflows

Reusable workflow exposes:

```yaml
outputs:
  site-url:
```

Main workflow prints it:

```yaml
${{needs.deploy.outputs.site-url}}
```

## What We Learn:

- Job outputs  
- Workflow outputs  
- Cross-workflow communication  
- Pipeline orchestration  

---

# 🔐 Secrets & Security

Stored in GitHub:

- `AWS_ACCESS_KEY_ID`  
- `AWS_SECRET_ACCESS_KEY`  

Accessed via:

```yaml
${{secrets.AWS_ACCESS_KEY_ID}}
```

## Security Concepts Learned:

- Secret inheritance  
- Environment variables  
- Avoiding credential leaks  
- Secure authentication patterns  

---

# 🧩 Caching Strategy

We cache:

```
~/.npm
```

Using:

```yaml
hashFiles('**/package-lock.json')
```

## Why?

- Faster builds  
- Reduced CI time  
- Efficient dependency restoration  

---

# 📦 Artifact Strategy

We upload:

- Test reports (on failure)  
- Build files (`dist-files`)  

Artifacts allow:

- Debugging  
- Cross-job data transfer  
- Deployment separation  

---

# 🧠 Advanced CI/CD Concepts Covered

| Concept | Implemented? |
|----------|--------------|
| Multi-Job Workflow | ✅ |
| Job Dependencies | ✅ |
| Conditional Execution | ✅ |
| Failure Handling | ✅ |
| Reusable Workflows | ✅ |
| Custom GitHub Actions | ✅ |
| Artifact Sharing | ✅ |
| Secure Secrets | ✅ |
| AWS Deployment | ✅ |
| Output Propagation | ✅ |

---

# 🎓 What We Learn By Doing This Project

1️⃣ Real-world CI/CD structure  
2️⃣ Enterprise-grade deployment patterns  
3️⃣ Clean separation of CI and CD  
4️⃣ Reusable workflow architecture  
5️⃣ Custom GitHub Action development  
6️⃣ Secure cloud deployment  
7️⃣ Automation-first mindset  

---

# 🔄 End-to-End Flow Summary

1. Developer pushes code  
2. Lint ensures quality  
3. Tests ensure correctness  
4. Build creates production assets  
5. Artifacts are stored  
6. Reusable workflow is triggered  
7. AWS authentication happens  
8. Custom JS action syncs S3  
9. Static website becomes live  
10. URL is printed  

---

# 🌟 Why This Project Is Powerful

This is not just automation.

It demonstrates:

- Professional CI/CD engineering  
- Modular architecture  
- Secure cloud integration  
- Custom automation tooling  

You now understand how platforms like:

- Vercel  
- Netlify  
- AWS Amplify  

Internally orchestrate deployments — but here, you built it yourself using **:contentReference[oaicite:5]{index=5}** and **:contentReference[oaicite:6]{index=6}**.

---

# 🏁 Final Result

Every push to selected branches:

✔️ Validates code  
✔️ Runs tests  
✔️ Builds production bundle  
✔️ Deploys to S3  
✔️ Publishes live website  
✔️ Prints the public URL  

Fully automated. Fully reproducible. Fully scalable.

---

# 🚀 Next Possible Improvements

- Add CloudFront CDN  
- Add cache invalidation  
- Add environment-based deployments  
- Add Terraform for infrastructure  
- Add Slack notifications  
- Add PR preview deployments  

---

# 📚 Conclusion

This repository demonstrates a complete DevOps lifecycle:

From commit → to cloud → to live production URL.

By building this, you have learned:

- CI/CD fundamentals  
- Workflow orchestration  
- GitHub Actions internals  
- AWS S3 deployment  
- Custom automation tooling  

This is production-level DevOps engineering.
