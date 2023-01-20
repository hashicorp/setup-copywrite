/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const action = require('./action')

async function run () {
  try {
    await action()
  } catch (err) { }
}

run()
