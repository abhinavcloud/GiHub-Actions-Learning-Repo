# GitHub Actions – Artifacts, Outputs & Caching

---

## Overview

This repository demonstrates a **production‑grade GitHub Actions workflow** focused on understanding and practicing **core GitHub Actions concepts** using a realistic CI/CD pipeline.

The workflow is intentionally verbose and heavily commented to act as **learning material** rather than a minimal example.

### Primary Learning Goals

* Artifacts (file‑based data sharing between jobs)
* Outputs (value‑based data sharing between jobs)
* Job isolation and runner lifecycle
* Sequential vs parallel execution
* Dependency caching for performance optimization
* Event filters and workflow triggers

---

## High‑Level Workflow Flow

```
Push Event (main | project2 | dummy)
                │
                ▼
        ┌───────────────────┐
        │   LINT            │
        │ npm ci            │
        │ npm run lint      |
        │ cache: ~/.npm     |
        └───────────────────┘
                │
                ▼
        ┌───────────────────────┐
        │   TEST                │
        │ npm test              |
        │ test.log → Artifact   |
        │ cache: ~/.npm         |
        └───────────────────────┘
                │
                ▼
        ┌──────────────────┐
        │   BUILD          │
        │ npm run build    |
        │ dist/ → Artifact |
        │ JS files → Output|
        │ cache: ~/.npm    |
        └──────────────────┘
                │
                ▼
        ┌─────────────────────┐
        │  DEPLOY             │
        │ Download artifacts  |
        │ Consume outputs     |
        │ cache: ~/.npm       |
        └─────────────────────┘
```

---

## Workflow Trigger

```yaml
on:
  push:
    branches:
      - main
      - project2
      - dummy
```

### Explanation

* **push** → Workflow runs on Git push events
* **branches filter** → Workflow executes only when pushes occur on the listed branches
* Prevents unnecessary workflow runs on feature or experimental branches

---

## Key GitHub Actions Concepts Explained

### 1. Events

Events define **when** a workflow runs.

Common events:

* `push`
* `pull_request`
* `workflow_dispatch`
* `schedule`

---

### 2. Event Filters

Event filters reduce unnecessary executions.

Examples:

* Branch filters
* Path filters
* Tag filters

---

### 3. Jobs

* A job runs on a **fresh runner (VM)**
* Jobs are **isolated** from each other
* Data is **not shared automatically** between jobs

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
```

---

### 4. Steps

* Steps run **inside a job**
* Steps **share the same filesystem**
* Can be shell commands or reusable actions

```yaml
steps:
  - run: npm ci
  - run: npm run lint
```

---

### 5. Sequential vs Parallel Execution

#### Parallel (Default)

```yaml
jobs:
  job-a:
  job-b:
```

#### Sequential

```yaml
jobs:
  job-b:
    needs: job-a
```

This workflow uses **strict sequential execution**:

```
lint → test → build → deploy
```

---

## Dependency Caching

This workflow uses **GitHub Actions Cache** to speed up execution.

### Why Caching?

* Avoid downloading dependencies on every job
* Reduce execution time
* Improve CI efficiency

### Cache Configuration

```yaml
- name: Caching Dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: node-module-dependencies-${{ hashFiles('**/package-lock.json') }}
```

### Cache Behavior

* First run → Cache miss → Dependencies downloaded
* Subsequent runs → Cache hit → Dependencies reused
* Dependency change → Cache invalidated automatically

---

## Artifacts

Artifacts are **files** uploaded from a runner to GitHub storage.

### Characteristics

* Persist after job completion
* Can be downloaded by other jobs
* Stored as compressed archives

### Artifact Example

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-files
    path: dist
```

---

## Outputs

Outputs are **values**, not files.

### Characteristics

* Stored in GitHub context
* Lightweight (strings, numbers)
* Passed between jobs via `needs`

### Step Output

```bash
echo "js-file=app.js" >> $GITHUB_OUTPUT
```

### Job Output

```yaml
outputs:
  script-file: ${{ steps.publish-js-filenames.outputs.js-file }}
```

### Consuming Output

```yaml
echo "${{ needs.build.outputs.script-file }}"
```

---

## Artifacts vs Outputs

| Feature   | Artifacts             | Outputs             |
| --------- | --------------------- | ------------------- |
| Data type | Files                 | Values              |
| Storage   | GitHub artifact store | GitHub context      |
| Size      | Large                 | Small               |
| Use case  | Build results, logs   | Metadata, filenames |

---

## Mandatory YAML Keys

| Key       | Description     |
| --------- | --------------- |
| `name`    | Workflow name   |
| `on`      | Trigger event   |
| `jobs`    | Job definitions |
| `runs-on` | Runner type     |
| `steps`   | Job steps       |

---

## Key Takeaways

* Each job runs on a clean runner
* Artifacts are required for file sharing
* Outputs are required for value sharing
* Caching dramatically improves CI speed
* `needs` controls execution order

---

## Use Cases

* CI pipelines
* Multi‑stage builds
* Artifact promotion
* Interview preparation
* GitHub Actions training material

---

**Author:** Abhinav Kumar
**Purpose:** GitHub Actions learning & best‑practice reference
