#!/usr/bin/env node
// dryui-ambient bin — thin wrapper around emitAmbient for SessionStart hooks.

import { emitAmbient } from './commands/ambient.js';

emitAmbient();
