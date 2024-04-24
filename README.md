# setup-copywrite

Download and configure the [copywrite](https://github.com/hashicorp/copywrite) CLI tool.

Originally based off of [setup-signore](https://github.com/hashicorp/setup-signore).

## Usage

Note: see [action.yml](action.yml) for detailed information about configuration and defaults.

### Install the latest copywrite client release and validate headers

```yaml
- name: Checkout Repo
  uses: actions/checkout@v4

- name: Install copywrite
  uses: hashicorp/setup-copywrite@v1.1.2
  
- name: Validate Header Compliance
  run: copywrite headers --plan
```

### Install a specific copywrite client release

```yaml
- name: Install copywrite v0.18.0
  uses: hashicorp/setup-copywrite@v1.1.2
  with:
    version: v0.18.0
```

### Install a specific copywrite client release, verifying its archive checksum

```yaml
- name: Install copywrite v0.18.0 and verify checksum
  uses: hashicorp/setup-copywrite@v1.1.2
  with:
    version: v0.18.0
    # https://github.com/hashicorp/copywrite/releases/download/v0.18.0/copywrite_0.18.0_darwin_x86_64.tar.gz sha256 hash
    archive-checksum: 88f135d752782447fcb34efee1c3bef64096cd8e1d26c921b0a54cf5ab13d573
```

## FAQ

- What checksum are we verifying?
  - After downloading the OS/arch specific `tar` or `zip` archive that contains the `copywrite` binary, we compare its SHA256 hash against the user supplied `archive-checksum`
