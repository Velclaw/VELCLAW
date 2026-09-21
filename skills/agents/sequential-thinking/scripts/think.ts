#!/usr/bin/env bun
/**
 * Local sequential-thinking state machine.
 *
 * This stores only explicit state submitted to the script. Do not put secrets,
 * credentials, or private chain-of-thought into the state file.
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseArgs } from 'util'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STATE_FILE = join(__dirname, '.think_state.json')

interface ThoughtData {
  thought: string
  thoughtNumber: number
  totalThoughts: number
  nextThoughtNeeded: boolean
  isRevision?: boolean
  revisesThought?: number
  branchFromThought?: number
  branchId?: string
  needsMoreThoughts?: boolean
}

interface State {
  thoughtHistory: ThoughtData[]
  branches: Record<string, ThoughtData[]>
}

function loadState(): State {
  if (!existsSync(STATE_FILE)) return { thoughtHistory: [], branches: {} }
  return JSON.parse(readFileSync(STATE_FILE, 'utf8'))
}

function saveState(state: State): void {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
}

function fail(message: string): never {
  console.error('Sequential thinking input error')
  process.exitCode = 1
  throw new Error(message)
}

const { values } = parseArgs({
  options: {
    thought: { type: 'string' },
    thoughtNumber: { type: 'string' },
    totalThoughts: { type: 'string' },
    nextThoughtNeeded: { type: 'string' },
    isRevision: { type: 'boolean', default: false },
    revisesThought: { type: 'string' },
    branchFromThought: { type: 'string' },
    branchId: { type: 'string' },
    needsMoreThoughts: { type: 'boolean', default: false },
    status: { type: 'boolean', default: false },
    reset: { type: 'boolean', default: false },
  },
  strict: true,
})

if (values.reset) {
  if (existsSync(STATE_FILE)) unlinkSync(STATE_FILE)
  console.log(JSON.stringify({ status: 'reset' }))
  process.exit(0)
}

const state = loadState()

if (values.status) {
  const latest = state.thoughtHistory.at(-1)
  console.log(
    JSON.stringify(
      {
        thoughtNumber: latest?.thoughtNumber ?? 0,
        totalThoughts: latest?.totalThoughts ?? 0,
        nextThoughtNeeded: latest?.nextThoughtNeeded ?? true,
        branches: Object.keys(state.branches),
        thoughtHistoryLength: state.thoughtHistory.length,
        fullHistory: state.thoughtHistory,
        branchDetails: state.branches,
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

if (!values.thought) fail('--thought is required')
if (!values.thoughtNumber) fail('--thoughtNumber is required')
if (!values.totalThoughts) fail('--totalThoughts is required')
if (!values.nextThoughtNeeded) fail('--nextThoughtNeeded is required')

const thoughtNumber = Number.parseInt(values.thoughtNumber, 10)
let totalThoughts = Number.parseInt(values.totalThoughts, 10)
const nextThoughtNeeded = values.nextThoughtNeeded.toLowerCase() === 'true'

if (!Number.isInteger(thoughtNumber) || thoughtNumber < 1) fail('--thoughtNumber must be an integer >= 1')
if (!Number.isInteger(totalThoughts) || totalThoughts < 1) fail('--totalThoughts must be an integer >= 1')
if (thoughtNumber > totalThoughts) totalThoughts = thoughtNumber

const thought: ThoughtData = {
  thought: values.thought,
  thoughtNumber,
  totalThoughts,
  nextThoughtNeeded,
}

if (values.isRevision) {
  if (!values.revisesThought) fail('--revisesThought is required when --isRevision is set')
  thought.isRevision = true
  thought.revisesThought = Number.parseInt(values.revisesThought, 10)
}

if (values.branchFromThought != null) {
  if (!values.branchId) fail('--branchId is required when --branchFromThought is set')
  thought.branchFromThought = Number.parseInt(values.branchFromThought, 10)
  thought.branchId = values.branchId
}

if (values.needsMoreThoughts) thought.needsMoreThoughts = true

state.thoughtHistory.push(thought)

if (thought.branchFromThought != null && thought.branchId) {
  state.branches[thought.branchId] ??= []
  state.branches[thought.branchId].push(thought)
}

saveState(state)

const branches = Object.keys(state.branches)
const branchText = branches.length ? ` branches=${branches.join(',')}` : ''
console.log(`[${thoughtNumber}/${totalThoughts}] history=${state.thoughtHistory.length}${branchText} next=${nextThoughtNeeded}`)
