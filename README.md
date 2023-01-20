# setup-copywrite

Download and configure the [copywrite](https://github.com/hashicorp/copywrite) CLI tool.

Originally based off of [setup-signore](https://github.com/hashicorp/setup-signore).

## Usage

Note: see [action.yml](action.yml) for detailed information about configuration and defaults.

### Install the latest copywrite client release

```yaml
- name: Install copywrite
  uses: hashicorp/setup-copywrite@v1
```

### Install a specific copywrite client release

```yaml
- name: Install copywrite v0.1.2
  uses: hashicorp/setup-copywrite@v1
  with:
    version: v0.1.2
```

### Install a specific copywrite client release, verifying its archive checksum

```yaml
- name: Install copywrite v0.1.2 and verify checksum
  uses: hashicorp/setup-copywrite@v1
  with:
    version: v0.1.2
    # https://github.com/hashicorp/copywrite/releases/download/v0.1.2/copywrite_0.1.2_darwin_x86_64.tar.gz sha256 hash
    archive-checksum: 6b58be415b3e9b2f77d74f2cf70857819d15df512626658223b2d4a4f3adc404
```

## FAQ

- What checksum are we verifying?
  - After downloading the os/arch specific `tar` or `zip` archive that contains the copywrite binary, we compare its SHA256 hash against the user supplied `archive-checksum`
