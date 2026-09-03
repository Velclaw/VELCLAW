import type { IbmCloudRuntimeConfig } from './ibm-cloud-runtime'
import { createIbmCloudRuntimePlan } from './ibm-cloud-runtime'
import {
  createIbmCloudInstanceListPlan,
  createIbmCloudInstanceStatusPlan,
} from './ibm-cloud-vpc'

export type IbmCloudRuntimeState = 'provisioning' | 'ready' | 'failed'

export type IbmCloudRuntimeRecord = {
  idempotencyKey: string
  state: IbmCloudRuntimeState
  instanceId?: string
  instanceName: string
  updatedAt: string
  error?: string
}

export type IbmCloudInstanceStatus = {
  status?: string
  lifecycle_state?: string
  lifecycle_reasons?: Array<{ code?: string; message?: string }>
}

export type IbmCloudRuntimeOrchestrationInput = {
  config: IbmCloudRuntimeConfig
  accessToken: string
  existing?: IbmCloudRuntimeRecord
  now?: Date
}

export type IbmCloudRuntimeOrchestrationPlan = {
  action: 'create' | 'recover' | 'poll' | 'noop'
  state: IbmCloudRuntimeState
  idempotencyKey: string
  request?:
    | ReturnType<typeof createIbmCloudRuntimePlan>
    | ReturnType<typeof createIbmCloudInstanceListPlan>
    | ReturnType<typeof createIbmCloudInstanceStatusPlan>
}

function requireValue(name: string, value: string) {
  if (!value.trim()) throw new Error(`${name} is required`)
}

export function createIbmCloudRuntimeIdempotencyKey(config: IbmCloudRuntimeConfig) {
  for (const [name, value] of Object.entries(config)) {
    if (typeof value === 'string') requireValue(name, value)
  }
  return `ibm-vpc:${config.region}:${config.zone}:${config.instanceName}`
}

/** Maps IBM instance status into Velclaw lifecycle state without treating initial stopped as failure. */
export function classifyIbmCloudInstanceStatus(
  response: IbmCloudInstanceStatus,
): IbmCloudRuntimeState {
  const status = response.status?.toLowerCase()
  const lifecycleState = response.lifecycle_state?.toLowerCase()

  if (status === 'running' && lifecycleState === 'stable') return 'ready'
  if (status === 'failed' || lifecycleState === 'failed' || lifecycleState === 'suspended') return 'failed'
  return 'provisioning'
}

/**
 * Pure decision layer. A provisioning record without an instance id is recovered by
 * listing instances by deterministic name before any second create request is allowed.
 */
export function createIbmCloudRuntimeOrchestrationPlan(
  input: IbmCloudRuntimeOrchestrationInput,
): IbmCloudRuntimeOrchestrationPlan {
  const idempotencyKey = createIbmCloudRuntimeIdempotencyKey(input.config)

  if (input.existing?.idempotencyKey && input.existing.idempotencyKey !== idempotencyKey) {
    throw new Error('existing runtime does not match the requested idempotency key')
  }

  if (!input.existing) {
    return {
      action: 'create',
      state: 'provisioning',
      idempotencyKey,
      request: createIbmCloudRuntimePlan(input),
    }
  }

  if (input.existing.state === 'provisioning' && !input.existing.instanceId) {
    const listConfig = { ...input.config, accessToken: input.accessToken }
    return {
      action: 'recover',
      state: 'provisioning',
      idempotencyKey,
      request: createIbmCloudInstanceListPlan(listConfig),
    }
  }

  if (input.existing.state === 'provisioning' && input.existing.instanceId) {
    const statusConfig = { ...input.config, accessToken: input.accessToken }
    return {
      action: 'poll',
      state: 'provisioning',
      idempotencyKey,
      request: createIbmCloudInstanceStatusPlan(statusConfig, input.existing.instanceId),
    }
  }

  return {
    action: 'noop',
    state: input.existing.state,
    idempotencyKey,
  }
}

export function transitionIbmCloudRuntimeState(
  record: IbmCloudRuntimeRecord,
  next: Pick<IbmCloudRuntimeRecord, 'state' | 'instanceId' | 'error'>,
  now = new Date(),
): IbmCloudRuntimeRecord {
  if (record.state === 'ready' && next.state === 'provisioning') {
    throw new Error('ready runtime cannot move back to provisioning')
  }
  if (record.state === 'failed' && next.state === 'ready') {
    throw new Error('failed runtime must be reprovisioned before becoming ready')
  }

  return { ...record, ...next, updatedAt: now.toISOString() }
}
