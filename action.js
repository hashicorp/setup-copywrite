/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

'use strict'

const fs = require('fs').promises
const os = require('os')
const crypto = require('crypto')

const core = require('@actions/core')
const tc = require('@actions/tool-cache')

const octokit = require('./octokit')

const owner = 'hashicorp'
const repo = 'copywrite'

// adapted from setup-terraform
// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [x86_64, 386, arm]
function mapArch (arch) {
  const mappings = {
    x32: '386',
    x64: 'x86_64'
  }
  return mappings[arch] || arch
}

// adapted from setup-terraform
// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS (os) {
  const mappings = {
    win32: 'windows'
  }
  return mappings[os] || os
}

async function run () {
  try {
    const expectedArchiveChecksum = core.getInput('archive-checksum')
    const githubToken = process.env.GITHUB_TOKEN ?? ''
    const version = core.getInput('version')

    const platform = mapOS(os.platform())
    const arch = mapArch(os.arch())

    // windows binaries are zipped
    const archiveSuffix = platform === 'windows' ? '.zip' : '.tar.gz'

    const client = await octokit(githubToken)

    // if we don't have specific version, get latest release
    let releaseToDownload
    if (version === 'latest' || !version) {
      releaseToDownload = (await client.rest.repos.getLatestRelease({ owner, repo })).data
    } else {
      releaseToDownload = (await client.rest.repos.getReleaseByTag({ owner, repo, tag: version })).data
    }
    const tag = releaseToDownload.tag_name
    core.setOutput('version', tag)

    // i.e. copywrite_0.1.2_darwin_x86_64.tar.gz
    const expectedAssetName = `${repo}_${tag.replace('v', '')}_${platform}_${arch}${archiveSuffix}`
    const assetToDownload = releaseToDownload.assets.find(asset => asset.name === expectedAssetName)
    if (assetToDownload === undefined) {
      throw new Error(`Unable to find asset matching ${expectedAssetName} in the ${tag} release`)
    }

    const url = assetToDownload.url
    // const auth = 'token ' + (githubToken)

    core.debug(`Downloading ${repo} release from ${url}`)
    const downloadedArchive = await tc.downloadTool(url)

    if (expectedArchiveChecksum !== '') {
      const downloadedArchiveChecksum = crypto.createHash('sha256').update(await fs.readFile(downloadedArchive)).digest('hex')
      if (expectedArchiveChecksum !== downloadedArchiveChecksum) {
        throw new Error(`Checksum mismatch: ${downloadedArchiveChecksum} does not match expected checksum ${expectedArchiveChecksum}`)
      }
    }

    core.debug(`Extracting ${repo} release`)
    let pathToCLI
    if (archiveSuffix === '.tar.gz') {
      pathToCLI = await tc.extractTar(downloadedArchive)
    } else {
      pathToCLI = await tc.extractZip(downloadedArchive)
    }
    core.debug(`${repo} CLI path is ${pathToCLI}.`)

    if (!downloadedArchive || !pathToCLI) {
      throw new Error(`Unable to download ${repo} from ${url}`)
    }

    core.addPath(pathToCLI)

    core.debug('success: copywrite has been set up!')
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = run
