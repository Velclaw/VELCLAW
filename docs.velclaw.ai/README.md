# Velclaw documentation

This static documentation site is driven by [`data.json`](./data.json). Its purpose is to publish only facts that can be traced to the application repository, [`Velclaw/Velclaw`](https://github.com/Velclaw/Velclaw).

## Source verification

The source repository is now accessible and the documentation was refreshed on **2026-09-04** against commit `fe7d48e02f461dc0d1506e8508f9d6d50339c3df` on `main`.

The verification covers the source tree and the deployment surfaces relevant to the documentation, including `package.json`, `pnpm-lock.yaml`, `README.md`, `app/`, `components/`, `lib/`, `server/`, `deploy/`, `docs/`, and `.github/workflows/`.

`data.json` records the source commit, check date, verification status, technology baseline, and confirmed capabilities. Values that still depend on credentials or external infrastructure remain explicitly qualified.

## Deployment

The repository retains its GitHub Pages workflow and now also contains a container runtime contract (`Dockerfile` + `docs-nginx.conf`) compatible with the Velclaw self-hosted publisher. The canonical docs hostname is `docs.velclaw.ai`; it is a documentation site, not a replacement for the canonical Velclaw application URL `https://velclaw.cfd`.

## License

This documentation repository is licensed under the [MIT License](./LICENSE).
