/**
 * Copyright IBM Corp. 2023, 2025
 * SPDX-License-Identifier: MPL-2.0
 */

const action = require('./action')

async function run () {
  try {
    await action()
  } catch (err) { }
}

run()
