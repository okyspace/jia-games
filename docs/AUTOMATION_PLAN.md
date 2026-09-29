# Plan: from GitHub issue to working code with Spec Kit

Status: **parked (KIV)**. Nothing here is set up yet. Tracked in the GitHub issue "Automate: issues → Spec Kit → PR".

The goal is to pick an issue (e.g. #1 Travel Journal), have a coding agent write the Spec Kit
spec → plan → tasks → code, and get back a pull request into `ideation` that CI has already
checked (lint, tests, APK).

There are two routes. Both use the Spec Kit commands already in this repo
(`.claude/skills/speckit-*`) and the issues already written for agents (goal, stories, files,
acceptance criteria, open questions).

| | Route A: Emdash | Route B: GitHub Actions (no Emdash) |
| --- | --- | --- |
| Where it runs | Your computer (desktop app) | GitHub's servers |
| How you start a feature | Pick an issue in Emdash | Add a label or comment on the issue |
| Parallel features | Yes, each in its own git worktree | Yes, each run is separate |
| Reviewing | Diffs in Emdash, then a PR | Pull request on GitHub |
| Cost | Your Claude subscription / API key | API key or Claude token, plus Actions minutes |
| Best for | Hands-on sessions, watching agents work | "Fire and forget", then review the PR |

---

## Shared preparation (do these first, for either route)

- [ ] Make decisions in issue #7 (stars, break timings, bedtime days…) so agents don't guess.
- [ ] Put the GitHub Project board in place (see README / session notes) with columns
      **Todo → Spec review → Building → PR review → Done**.
- [ ] Decide the branch rule: every feature branch starts from `ideation`, and PRs target `ideation`.
- [ ] Protect `ideation`: require the CI checks (Quality check, Android) to pass before merging.
- [ ] Add to `CLAUDE.md` an "Agent workflow" section (see the text at the end of this file) so every
      agent follows the same steps.
- [ ] Get Claude access for automation: either an **Anthropic API key** (console.anthropic.com,
      set a monthly spending limit) or a **Claude Code OAuth token** (`claude setup-token` on a
      computer with Claude Code installed, uses your Claude subscription).

---

## Route A: Emdash

Emdash is a desktop app that runs coding agents (Claude Code among them) in parallel, each in
its own git worktree, and can start them from GitHub issues. Check the Emdash docs for exact
menu names; the steps below are the flow.

- [ ] Install Emdash and Claude Code on your computer; sign in to Claude Code (`claude`).
- [ ] Clone `okyspace/jia-games`, check out `ideation`, run `npm install` once.
- [ ] Open the repo in Emdash and connect GitHub so it can list issues.
- [ ] Set the base branch for new worktrees to `ideation`.
- [ ] For one issue (start small, e.g. #3 My Wishes), start a Claude Code agent with the prompt below.
- [ ] Review the spec it writes **before** letting it plan and code (answer its clarify questions).
- [ ] Let it run plan → tasks → implement; check `npm run lint && npm test` passes in the worktree.
- [ ] Open the PR into `ideation`; wait for CI (APK artifact) and try the APK.
- [ ] If that went well, run 2–3 issues in parallel.

Prompt to give the agent (replace `#N`):

```text
Work on GitHub issue #N in okyspace/jia-games. Base branch: ideation.
Follow CLAUDE.md "Agent workflow":
1. /speckit-specify with the issue's goal and user stories.
2. /speckit-clarify, then STOP and show me the questions and the spec.
After I approve: /speckit-plan, /speckit-tasks, /speckit-implement.
Run `npm run lint && npm test` until green, update README "Feature history",
then open a PR into ideation that says "Closes #N".
```

---

## Route B: GitHub issues trigger Spec Kit (no Emdash)

Uses Anthropic's official `anthropics/claude-code-action`. Two stages keep a human in the loop:

1. Label an issue **`spec`** → the action writes `specs/NNN-*/spec.md` (+ clarify questions),
   pushes a branch and opens a **draft PR**. You review and answer in the PR.
2. Label the issue (or comment on the PR) **`build`** → the action runs plan → tasks → implement
   on that branch and marks the PR ready. CI runs; you review, try the APK and merge.

### To-do

- [ ] Easiest install: run `claude` in the repo on your computer and use `/install-github-app`.
      It installs the Claude GitHub App on the repo and adds the secret for you.
      Or do it by hand: add repo secret `ANTHROPIC_API_KEY` (or `CLAUDE_CODE_OAUTH_TOKEN`) in
      **Settings → Secrets and variables → Actions**.
- [ ] Create labels `spec` and `build`.
- [ ] Add `.github/workflows/speckit-agent.yml` (draft below) to `ideation`.
- [ ] Allow Actions to create PRs: **Settings → Actions → General → Workflow permissions →
      "Allow GitHub Actions to create and approve pull requests"**.
- [ ] Try it on one small issue; tune `--max-turns` and the prompts.
- [ ] Add a monthly spend limit on the API key.
- [ ] Optional: a comment trigger (`@claude …`) for small fixes on PRs.

### Draft workflow (not installed yet)

Check the action's README for the current input names before using this.

```yaml
# .github/workflows/speckit-agent.yml  (DRAFT)
name: Spec Kit agent

on:
  issues:
    types: [labeled]

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

jobs:
  spec:
    if: github.event.label.name == 'spec'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { ref: ideation, fetch-depth: 0 }
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_args: --max-turns 30
          prompt: |
            Issue #${{ github.event.issue.number }}: ${{ github.event.issue.title }}
            ${{ github.event.issue.body }}

            Follow CLAUDE.md "Agent workflow", stage 1 only:
            create branch feature/issue-${{ github.event.issue.number }} from ideation,
            run /speckit-specify and /speckit-clarify, commit specs/, push,
            and open a DRAFT pull request into ideation titled "Spec: <feature>"
            that lists the clarify questions. Do not write app code.

  build:
    if: github.event.label.name == 'build'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { ref: 'feature/issue-${{ github.event.issue.number }}', fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci && npx playwright install --with-deps chromium
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_args: --max-turns 80
          prompt: |
            Issue #${{ github.event.issue.number }}. The spec on this branch is approved
            (read the PR comments for answers to the clarify questions).
            Follow CLAUDE.md "Agent workflow", stage 2: /speckit-plan, /speckit-tasks,
            /speckit-implement. Run `npm run lint && npm test` until green, add a README
            "Feature history" row, push, and mark the PR ready for review with "Closes #N".
```

---

## Text to add to CLAUDE.md ("Agent workflow")

```markdown
## Agent workflow (issues → Spec Kit → PR)

- Branch from `ideation` as `feature/issue-<N>`; PRs target `ideation` and say "Closes #<N>".
- Stage 1 (spec): `/speckit-specify` from the issue, then `/speckit-clarify`. Stop and ask for review.
- Stage 2 (build, after approval): `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`.
- Keep to the issue's scope; put new ideas in a new issue instead.
- Done means: `npm run lint && npm test` pass, tasks.md ticked, README "Feature history" row added.
```

## Risks to keep in mind

- **Cost:** long implement runs use many tokens. Start with small issues and a spend limit.
- **Skipping review:** don't auto-merge. The spec review and the PR review are the quality gates.
- **Conflicts:** parallel features touching the same files (`tabs.js`, `app.css`, README history)
  will conflict; merge one PR at a time and let the next one rebase/merge `ideation`.
- **Secrets:** API keys only in GitHub secrets or local config, never in issues, PRs or code.
