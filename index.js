/**
 * Copyright IBM Corp. 2023, 2025
 * SPDX-License-Identifier: MPL-2.0
 */

import action from './action.js'

async function run () {
  try {
    await action()
  } catch (err) { }
}

run()
