# Velclaw documentation

This static documentation site is driven by [`data.json`](./data.json). Its purpose is to publish only facts that can be traced to the canonical application repository, [`Velclaw/VELCLAW`](https://github.com/Velclaw/VELCLAW).

## Source verification

The canonical source repository is `Velclaw/VELCLAW` on `main`. The documentation should be regenerated from the current canonical source before publishing a new verified snapshot.

The verification covers the source tree and the deployment surfaces relevant to the documentation, including `package.json`, `pnpm-lock.yaml`, `README.md`, `app/`, `components/`, `lib/`, `server/`, `deploy/`, `docs/`, and `.github/workflows/`.

`data.json` records source verification metadata, technology baseline, and confirmed capabilities. Values that still depend on credentials or external infrastructure remain explicitly qualified.

## Deployment

The repository retains its GitHub Pages workflow and also contains a container runtime contract (`Dockerfile` + `docs-nginx.conf`) compatible with the Velclaw self-hosted publisher. The public documentation URL is `https://velclaw.cfd/docs`; infrastructure-generated hostnames are not product URLs.

## License

This documentation repository is licensed under the [MIT License](./LICENSE).
