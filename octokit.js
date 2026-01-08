/**
 * Copyright IBM Corp. 2023, 2025
 * SPDX-License-Identifier: MPL-2.0
 */

import core from '@actions/core'
import { GitHub, getOctokitOptions } from '@actions/github/lib/utils'
import { Octokit } from '@octokit/rest'
import { retry } from '@octokit/plugin-retry'
import { throttling } from '@octokit/plugin-throttling'

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
    onSecondaryRateLimit (retryAfter, options, octokit) {
      core.info(`Secondary rate limit triggered for request ${options.method} ${options.url} (attempt ${options.request.retryCount}/${abuseLimitRetries})`)

      if (options.request.retryCount < abuseLimitRetries) {
        core.info(`Retrying after ${retryAfter} seconds`)
        return true
      }

      core.warning(`Exhausted secondary rate limit retry count (${abuseLimitRetries}) for ${options.method} ${options.url}`)
    },
    onRateLimit (retryAfter, options, octokit) {
      core.info(`Rate limit triggered for request ${options.method} ${options.url} (attempt ${options.request.retryCount}/${rateLimitRetries})`)

      if (options.request.retryCount < rateLimitRetries) {
        core.info(`Retrying after ${retryAfter} seconds`)
        return true
      }

      core.warning(`Exhausted rate limit retry count (${rateLimitRetries}) for ${options.method} ${options.url}`)
    }
  }
}

export default function client (token) {
  if (!token) {
    return new Octokit(baseOptions)
  }

  const OctokitInstance = GitHub.plugin(throttling, retry)
  const options = getOctokitOptions(token, baseOptions)

  return new OctokitInstance(options)
}
