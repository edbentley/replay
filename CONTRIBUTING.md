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

# Publish to npm
npx lerna publish from-git

# Push to remote with tag
git push
git push origin v0.x.0

# Replay Swift clone
cd ../replay-swift
git rm -r .
cp -a ../replay/packages/replay-swift/Replay/. .
git add .
git commit -m "v0.x.0"
git tag 0.x.0 # note: no v
git push
git push origin 0.x.0

# Replay Text Input clone
cd ../replay-text-input-swift
git rm -r .
cp -a ../replay/packages/replay-text-input/ReplayTextInput/. .
git add .
git commit -m "v0.x.0"
git tag 0.x.0 # note: no v
git push
git push origin 0.x.0

# replay-starter-ts clone
cd ../replay-starter-ts
git rm -r .
rsync -av ../replay/packages/replay-starter-ts/ . --exclude node_modules
git add .
git commit -m "v0.x.0"
git tag v0.x.0
git push
git push origin v0.x.0

# replay-starter-js clone
cd ../replay-starter-js
git rm -r .
rsync -av ../replay/packages/replay-starter-js/ . --exclude node_modules
git add .
git commit -m "v0.x.0"
git tag v0.x.0
git push
git push origin v0.x.0

# Publish website
cd ../replay/website
GIT_USER=<Your GitHub username> USE_SSH=true npm run deploy
```

#### Note

- The file [ReplayCore.swift](./packages/replay-swift/Replay/Sources/Replay/ReplayCore.swift) needs to be manually updated for now.
