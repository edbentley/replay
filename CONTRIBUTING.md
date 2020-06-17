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

# Need to manually update peer dependencies and docs since lerna can't do that
# You can grep for previous version number "0.x.0"

# Then commit
git add .
git commit -m "v0.x.0"

# Add the tag
git tag v0.x.0

# Push to remote
git push
git push origin --tags

# Publish to npm
npx lerna publish from-git
```

#### Note

- The file [ReplayCore.swift](./packages/replay-swift/Replay/Sources/Replay/ReplayCore.swift) needs to be manually updated for now.
- On a new release, the following clone repos need to be updated and released:
  - [replay-swift](https://github.com/edbentley/replay-swift)
  - [replay-starter-ts](https://github.com/edbentley/replay-starter-ts)
  - [replay-starter-js](https://github.com/edbentley/replay-starter-js)
