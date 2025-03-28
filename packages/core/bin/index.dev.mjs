#!/usr/bin/env node
'use strict'

import { register } from 'tsx/esm/api'

// Register tsx enhancement
const unregister = register()

// eslint-disable-next-line antfu/no-top-level-await
await import('../src/cli/index.ts')

unregister()
