/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const core = require('@actions/core')
const { GitHub, getOctokitOptions } = require('@actions/github/lib/utils')
const { Octokit } = require('@octokit/rest')
const { retry } = require('@octokit/plugin-retry')
const { throttling } = require('@octokit/plugin-throttling')

const abuseLimitRetries = 5
const rateLimitRetries = 5

const baseOptions = {
  log: {
    debug: core.debug,
    info: core.info,
    warning: core.warning,
    error: core.error
  },
  throttle: {
    onAbuseLimit (retryAfter, options) {
      core.info(`Abuse limit triggered for request ${options.method} ${options.url} (attempt ${options.request.retryCount}/${abuseLimitRetries})`)

      if (options.request.retryCount < abuseLimitRetries) {
        core.info(`Retrying after ${retryAfter} seconds`)
        return true
      }

      core.warning(`Exhausted abuse limit retry count (${abuseLimitRetries}) for ${options.method} ${options.url}`)
    },
    onRateLimit (retryAfter, options) {
      core.info(`Rate limit triggered for request ${options.method} ${options.url} (attempt ${options.request.retryCount}/${rateLimitRetries})`)

      if (options.request.retryCount < rateLimitRetries) {
        core.info(`Retrying after ${retryAfter} seconds`)
        return true
      }

      core.warning(`Exhausted rate limit retry count (${rateLimitRetries}) for ${options.method} ${options.url}`)
    }
  }
}

module.exports = function client (token) {
  if (!token) {
    return new Octokit(baseOptions)
  }

  const OctokitInstance = GitHub.plugin(throttling, retry)
  const options = getOctokitOptions(token, baseOptions)

  return new OctokitInstance(options)
}
