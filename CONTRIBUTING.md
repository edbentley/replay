# Contributing

## Setup

```bash
npm install
npx lerna bootstrap
```

## Type Checking

```bash
npm run types
```

## Linting

```bash
npm run lint
```

## Testing

```bash
npm run test
# or watch mode
npm run test:watch
```

## Publish

All packages should be published at the same version. Public APIs should follow
SemVer.

```bash
# Bump versions
npx lerna version --no-push --exact --no-git-tag-version

# Need to manually update peer dependencies since lerna can't do that
# You can grep for "@replay/core": "~0.1.0"

# Then amend the commit
git add .
git commit --amend

# Add the tag
git tag v0.1.0

# Push to remote
git push
git push origin --tags

# Publish to npm
npx lerna publish from-git
```
