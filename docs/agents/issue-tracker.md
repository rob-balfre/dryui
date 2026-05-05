# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues in `rob-balfre/dryui`. Use `gh-axi` for GitHub operations in this repository.

## Conventions

- **Create an issue**: `gh-axi issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh-axi issue view <number> --comments`, including labels and relevant comments.
- **List issues**: `gh-axi issue list --state open` with appropriate label and state filters.
- **Comment on an issue**: `gh-axi issue comment <number> --body "..."`
- **Apply / remove labels**: `gh-axi issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh-axi issue close <number> --comment "..."`

Infer the repo from `git remote -v`. The canonical remote is `https://github.com/rob-balfre/dryui.git`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh-axi issue view <number> --comments`.
