/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const fs = require('fs')
const nock = require('nock')
const path = require('path')
const os = require('os')

const core = require('@actions/core')

const mockRelease = {
  assets: [
    {
      id: 1,
      name: 'copywrite_0.1.3_darwin_x86_64.tar.gz',
      url: 'https://api.github.com/repos/hashicorp/copywrite/releases/assets/1',
      browser_download_url: 'https://github.com/hashicorp/copywrite/releases/download/v0.1.3/copywrite_0.1.3_darwin_x86_64.tar.gz'
    },
    {
      id: 2,
      name: 'copywrite_0.1.3_linux_x86_64.tar.gz',
      url: 'https://api.github.com/repos/hashicorp/copywrite/releases/assets/2',
      browser_download_url: 'https://github.com/hashicorp/copywrite/releases/download/v0.1.3/copywrite_0.1.3_linux_x86_64.tar.gz'
    },
    {
      id: 3,
      name: 'copywrite_0.1.3_windows_x86_64.zip',
      url: 'https://api.github.com/repos/hashicorp/copywrite/releases/assets/3',
      browser_download_url: 'https://github.com/hashicorp/copywrite/releases/download/v0.1.3/copywrite_0.1.3_windows_x86_64.zip'
    }
  ],
  id: '1',
  name: 'v0.1.3',
  tag_name: 'v0.1.3'
}

beforeAll(() => {
  nock.disableNetConnect()
})

beforeEach(() => {
  process.env['INPUT_GITHUB-TOKEN'] = 'testtoken'
  process.env.INPUT_VERSION = 'latest'
  process.env['INPUT_VERSION-CHECKSUM'] = '5663389ef1a8ec48af6ca622e66bf0f54ba8f22c127f14cb8a3f429e40868582'

  const spyOsArch = jest.spyOn(os, 'arch')
  spyOsArch.mockReturnValue('x64')
  const spyOsPlatform = jest.spyOn(os, 'platform')
  spyOsPlatform.mockReturnValue('win32')
})

describe('action', () => {
  test('installs latest version', (done) => {
    const scopeAPI = nock('https://api.github.com')
      .get('/repos/hashicorp/copywrite/releases/latest')
      .reply(200, mockRelease)
    const scopeWeb = nock('https://github.com')
      .get('/hashicorp/copywrite/releases/download/v0.1.3/copywrite_0.1.3_windows_x86_64.zip')
      .replyWithFile(200, path.resolve(__dirname, 'test.zip'), { 'content-type': 'application/octet-stream' })
    const spyCoreAddPath = jest.spyOn(core, 'addPath')
    const spyCoreSetOutput = jest.spyOn(core, 'setOutput')

    fs.mkdtemp(path.join(os.tmpdir(), 'setup-copywrite-'), async (err, directory) => {
      if (err) throw err

      process.env.RUNNER_TEMP = directory

      const spyOsHomedir = jest.spyOn(os, 'homedir')
      spyOsHomedir.mockReturnValue(directory)

      const action = require('./action')
      await expect(await action()).resolves
      expect(scopeAPI.isDone()).toBeTruthy()
      expect(scopeWeb.isDone()).toBeTruthy()
      expect(spyCoreAddPath).toHaveBeenCalled()
      expect(spyCoreSetOutput).toHaveBeenCalledWith('version', 'v0.1.3')
      done()
    })
  })

  test('installs configured version', (done) => {
    const scopeAPI = nock('https://api.github.com')
      .get('/repos/hashicorp/copywrite/releases/tags/v0.1.3')
      .reply(200, mockRelease)
    const scopeWeb = nock('https://github.com')
      .get('/hashicorp/copywrite/releases/download/v0.1.3/copywrite_0.1.3_windows_x86_64.zip')
      .replyWithFile(200, path.resolve(__dirname, 'test.zip'), { 'content-type': 'application/octet-stream' })
    const spyCoreAddPath = jest.spyOn(core, 'addPath')
    const spyCoreSetOutput = jest.spyOn(core, 'setOutput')

    fs.mkdtemp(path.join(os.tmpdir(), 'setup-copywrite-'), async (err, directory) => {
      if (err) throw err

      process.env.INPUT_VERSION = 'v0.1.3'
      process.env.RUNNER_TEMP = directory

      const spyOsHomedir = jest.spyOn(os, 'homedir')
      spyOsHomedir.mockReturnValue(directory)

      const action = require('./action')
      await expect(await action()).resolves
      expect(scopeAPI.isDone()).toBeTruthy()
      expect(scopeWeb.isDone()).toBeTruthy()
      expect(spyCoreAddPath).toHaveBeenCalled()
      expect(spyCoreSetOutput).toHaveBeenCalledWith('version', 'v0.1.3')
      done()
    })
  })

//   test('retries transient errors', (done) => {
//     const scope = nock('https://api.github.com')
//       .get('/repos/hashicorp/copywrite/releases/tags/v0.1.3')
//       .reply(500, 'expected transient error')
//       .get('/repos/hashicorp/copywrite/releases/tags/v0.1.3')
//       .reply(200, mockRelease)
//       .get('/repos/hashicorp/copywrite/releases/assets/3')
//       .replyWithFile(200, path.resolve(__dirname, 'test.zip'), { 'content-type': 'application/octet-stream' })
//
//     fs.mkdtemp(path.join(os.tmpdir(), 'setup-copywrite-'), async (err, directory) => {
//       if (err) throw err
//
//       process.env.INPUT_VERSION = 'v0.1.3'
//       process.env.RUNNER_TEMP = directory
//
//       const spyOsHomedir = jest.spyOn(os, 'homedir')
//       spyOsHomedir.mockReturnValue(directory)
//
//       const action = require('./action')
//       await expect(await action()).resolves
//       expect(scope.isDone()).toBeTruthy()
//       done()
//     })
//   })
//
//   test('retries abuse limit errors', (done) => {
//     const scope = nock('https://api.github.com')
//       .get('/repos/hashicorp/copywrite/releases/tags/v0.1.3')
//       .reply(403, {
//         message: 'You have triggered an abuse detection mechanism and have been temporarily blocked from content creation. Please retry your request again later.',
//         documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#abuse-rate-limits'
//       })
//       .get('/repos/hashicorp/copywrite/releases/tags/v0.1.3')
//       .reply(200, mockRelease)
//       .get('/repos/hashicorp/copywrite/releases/assets/3')
//       .replyWithFile(200, path.resolve(__dirname, 'test.zip'), { 'content-type': 'application/octet-stream' })
//
//     fs.mkdtemp(path.join(os.tmpdir(), 'setup-copywrite-'), async (err, directory) => {
//       if (err) throw err
//
//       process.env.INPUT_VERSION = 'v0.1.3'
//       process.env.RUNNER_TEMP = directory
//
//       const spyOsHomedir = jest.spyOn(os, 'homedir')
//       spyOsHomedir.mockReturnValue(directory)
//
//       const action = require('./action')
//       await expect(await action()).resolves
//       expect(scope.isDone()).toBeTruthy()
//       done()
//     })
//   })
//
//   test('retries rate limit errors', (done) => {
//     const scope = nock('https://api.github.com')
//       .get('/repos/hashicorp/copywrite/releases/tags/v0.1.3')
//       .reply(429, 'expected rate limit error')
//       .get('/repos/hashicorp/copywrite/releases/tags/v0.1.3')
//       .reply(200, mockRelease)
//       .get('/repos/hashicorp/copywrite/releases/assets/3')
//       .replyWithFile(200, path.resolve(__dirname, 'test.zip'), { 'content-type': 'application/octet-stream' })
//
//     fs.mkdtemp(path.join(os.tmpdir(), 'setup-copywrite-'), async (err, directory) => {
//       if (err) throw err
//
//       process.env.INPUT_VERSION = 'v0.1.3'
//       process.env.RUNNER_TEMP = directory
//
//       const spyOsHomedir = jest.spyOn(os, 'homedir')
//       spyOsHomedir.mockReturnValue(directory)
//
//       const action = require('./action')
//       await expect(await action()).resolves
//       expect(scope.isDone()).toBeTruthy()
//       done()
//     })
//   })
})
