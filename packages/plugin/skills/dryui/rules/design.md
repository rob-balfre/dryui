# Clean Code Standards

## Core Principle

Write the minimum correct code. Every line must earn its place.

## Rules

### No Premature Abstraction

- Three similar lines > one premature helper
- Only extract when you have 3+ real call sites
- No "just in case" configurability, feature flags, or extension points
- Delete code you don't need -- don't comment it out

### No Noise

- No comments that restate what code does
- Comments only where the _why_ is non-obvious
- No empty catch blocks -- handle or rethrow
- No unused imports, variables, or parameters
- No `console.log` left in production code
- No commented-out code -- use git history

### Names Are Documentation

- Functions: verb + noun (`getUser`, `handleClick`, `parseDate`)
- Booleans: `is`/`has`/`should` prefix (`isOpen`, `hasError`)
- Collections: plural (`users`, `items`)
- Callbacks: `on` + event (`onClose`, `onChange`)
- Constants: UPPER_SNAKE only for true compile-time constants

### Functions

- One job per function
- Max 3 parameters -- use an options object for more
- Return early to avoid nesting
- Pure functions where possible -- side effects at the edges

### Error Handling

- Only validate at system boundaries (user input, API responses, file reads)
- Trust internal code -- don't null-check values you just created
- Use specific error types, not generic strings
- Handle errors at the level that can meaningfully respond

### File Organization

- One concept per file
- Keep files under 300 lines -- split if growing
- Colocate related code (component + styles + tests in same directory)
- Index files only for re-exports, never for logic

## Anti-Patterns -- Stop and Fix

| If you're about to...                   | Instead...                                                   |
| --------------------------------------- | ------------------------------------------------------------ |
| Add a "utils" file                      | Put it where it's used (shared module only at 3+ call sites) |
| Create a base class                     | Use composition                                              |
| Add a config option nobody asked for    | Don't                                                        |
| Write a comment explaining _what_       | Rename so it's obvious                                       |
| Add error handling for impossible cases | Trust internal code                                          |
| Create a wrapper around a simple API    | Use the API directly                                         |

## 5 Rules of Programming

1. You can't tell where a program is going to spend its time. Bottlenecks occur in surprising places.
2. Measure. Don't tune for speed until you've measured.
3. Fancy algorithms are slow when n is small, and n is usually small.
4. Fancy algorithms are buggier than simple ones. Use simple algorithms and simple data structures.
5. Data dominates. If you've chosen the right data structures, the algorithms will be self-evident.
