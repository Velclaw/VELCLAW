'use client'

import { useEffect, useRef, useState } from 'react'
import { WebContainer, type PreviewMessage } from '@webcontainer/api'

function previewMessageText(message: PreviewMessage) {
  if ('message' in message && typeof message.message === 'string') return message.message
  if ('args' in message && Array.isArray(message.args)) return message.args.map(String).join(' ')
  return message.type
}

// ... existing component implementation ...
