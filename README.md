# setup-copywrite

Download and configure the [copywrite](https://github.com/hashicorp/copywrite) CLI tool.

Originally based off of [setup-signore](https://github.com/hashicorp/setup-signore).

## Usage

Note: see [action.yml](action.yml) for detailed information about configuration and defaults.

### Install the latest copywrite client release and validate headers

```yaml
- name: Checkout Repo
  uses: actions/checkout@v3

- name: Install copywrite
  uses: hashicorp/setup-copywrite@v1.0.0
  
- name: Validate Header Compliance
  run: copywrite headers --plan
```

### Install a specific copywrite client release

```yaml
- name: Install copywrite v0.1.2
  uses: hashicorp/setup-copywrite@v1.0.0
  with:
    version: v0.13.1
```

### Install a specific copywrite client release, verifying its archive checksum

```yaml
- name: Install copywrite v0.1.2 and verify checksum
  uses: hashicorp/setup-copywrite@v1.0.0
  with:
    version: v0.13.1
    # https://github.com/hashicorp/copywrite/releases/download/v0.13.1/copywrite_0.13.1_darwin_x86_64.tar.gz sha256 hash
    archive-checksum: 359b0d80459012481f19a2bf7afafb5d6e01f2e5f8e4af42a89c0f5289adbaec
```

## FAQ

- What checksum are we verifying?
  - After downloading the os/arch specific `tar` or `zip` archive that contains the copywrite binary, we compare its SHA256 hash against the user supplied `archive-checksum`
