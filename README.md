# GitHub Actions – Complete Workflow & Concepts Guide

This repository demonstrates a **professional, end-to-end GitHub Actions workflow** while also serving as a **conceptual reference** for GitHub Actions fundamentals.

It is designed for:

* Learning GitHub Actions from first principles
* Interview preparation
* Team onboarding and internal documentation

---

## 1. What is GitHub Actions?

GitHub Actions is GitHub’s native **CI/CD and automation platform** that allows you to:

* Build
* Test
* Lint
* Package
* Deploy
* Automate operational tasks

All automation is defined using **YAML workflows** stored in:

```
.github/workflows/*.yml
```

---

## 2. Workflow File Structure

A GitHub Actions workflow is composed of **mandatory and optional top-level keys**.

### Mandatory Top-Level Keys

| Key    | Description                                 |
| ------ | ------------------------------------------- |
| `name` | Name of the workflow (visible in GitHub UI) |
| `on`   | Event(s) that trigger the workflow          |
| `jobs` | One or more jobs executed by the workflow   |

---

## 3. Full YAML Workflow Example

```yaml
name: artifacts and outputs workflow

on:
  push:
    branches:
      - main
      - project2
      - dummy

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test > test_output.log
      - uses: actions/upload-artifact@v4
        with:
          name: test-logs
          path: test_output.log

  build:
    runs-on: ubuntu-latest
    needs: test
    outputs:
      script-file: ${{ steps.publish-js.outputs.js-file }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: dist
      - id: publish-js
        run: find dist/assets/*.js -type f -execdir echo "js-file={}" >> $GITHUB_OUTPUT ';'

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-files
          path: dist
      - run: echo "${{ needs.build.outputs.script-file }}" > JS_FILE.txt
      - run: echo "Deploying (simulated)..."
```

---

## 4. Events and Event Filters

### Events (`on`)

Events define **when** a workflow runs.

Common events:

* `push`
* `pull_request`
* `workflow_dispatch` (manual trigger)
* `schedule`

### Event Filters

Filters restrict when an event triggers the workflow.

Example:

```yaml
on:
  push:
    branches:
      - main
```

This ensures the workflow runs **only** for pushes to `main`.

---

## 5. Jobs

A **job**:

* Is a collection of steps
* Runs on a single runner
* Executes in isolation from other jobs

### Mandatory Job Keys

| Key       | Description                      |
| --------- | -------------------------------- |
| `runs-on` | Runner type (e.g. ubuntu-latest) |
| `steps`   | Ordered list of steps            |

---

## 6. Steps

Steps are executed **sequentially inside a job**.

Two step types:

### 1. Action Steps

```yaml
- uses: actions/checkout@v3
```

Uses a reusable action.

### 2. Run Steps

```yaml
- run: npm test
```

Executes shell commands on the runner.

---

## 7. Action Types

| Type               | Description                  |
| ------------------ | ---------------------------- |
| JavaScript Actions | Node.js based actions        |
| Docker Actions     | Run inside Docker containers |
| Composite Actions  | Combine multiple steps       |

Examples used in this workflow:

* `actions/checkout`
* `actions/setup-node`
* `actions/upload-artifact`
* `actions/download-artifact`

---

## 8. Sequential vs Parallel Execution

### Parallel Jobs (Default)

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
  job2:
    runs-on: ubuntu-latest
```

Both jobs run **in parallel**.

---

### Sequential Jobs (`needs`)

```yaml
job2:
  needs: job1
```

Ensures `job2` runs **only after** `job1` succeeds.

This workflow uses:

```
lint → test → build → deploy
```

---

## 9. Runner Isolation

Each job:

* Runs on a **fresh VM**
* Has no access to files from other jobs

This is why:

* Artifacts are required for files
* Outputs are required for values

---

## 10. Artifacts

Artifacts are **files or directories** uploaded from a job.

### When to Use Artifacts

* Build outputs
* Logs
* Reports

### Artifact Lifecycle

```
Runner → Upload → GitHub Storage → Download → New Runner
```

---

## 11. Outputs

Outputs are **values**, not files.

### Output Flow

```
Step Output → Job Output → Downstream Job
```

### Why Outputs Exist

* Share metadata
* Avoid unnecessary artifacts
* Faster and cleaner pipelines

---

## 12. Artifacts vs Outputs

| Feature         | Artifacts             | Outputs        |
| --------------- | --------------------- | -------------- |
| Data type       | Files                 | Values         |
| Stored in       | GitHub artifact store | GitHub context |
| Download needed | Yes                   | No             |
| Typical use     | Builds, logs          | Metadata       |

---

## 13. Visual Workflow Diagram

```
Push Event
   │
   ▼
Lint ──▶ Test ──▶ Build ──▶ Deploy
           │        │        │
           │        │        ├─ Uses output values
           │        │
           │        └─ Upload build artifacts
           │
           └─ Upload test logs
```

---

## 14. Key Takeaways

* Jobs are isolated
* Steps are sequential
* Jobs are parallel by default
* `needs` enforces order
* Artifacts move files
* Outputs move values

---

## 15. References

* [https://docs.github.com/en/actions](https://docs.github.com/en/actions)
* [https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
* [https://github.com/actions/upload-artifact](https://github.com/actions/upload-artifact)
* [https://github.com/actions/download-artifact](https://github.com/actions/download-artifact)

---

**This document intentionally prioritizes clarity and correctness over optimization.**
