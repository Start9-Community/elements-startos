# Updating the upstream version

This package wraps **Elements Core** ([ElementsProject/elements](https://github.com/ElementsProject/elements)), which we build from the official release tarballs in the multi-stage `Dockerfile`. "Upstream" here means that source repo.

## Determining the upstream version

```sh
gh release view -R ElementsProject/elements --json tagName -q .tagName
```

Release tags look like `elements-23.3.3`; the version is the part after `elements-`.

## Applying the bump

1. Update the `VERSION` build arg in `startos/manifest/index.ts`
   (`images.elements.source.dockerBuild.buildArgs.VERSION`).
2. The `Dockerfile` downloads
   `elements-${VERSION}-{x86_64,aarch64}-linux-gnu.tar.gz` from the GitHub
   release and verifies it against the release `SHA256SUMS`. Confirm both arch
   tarballs exist for the new release.
3. Bump the package version in `startos/versions/current.ts` (format
   `<upstream>:<revision>`, e.g. `23.3.3:1`) and add release notes.
4. Run `make` (requires `start-cli` + Docker); its first step type-checks, lints and format-checks `startos/`.
