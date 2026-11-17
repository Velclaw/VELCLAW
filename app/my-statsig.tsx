// app/my-statsig.tsx

'use client'

import React from 'react'
import { StatsigProvider, useClientAsyncInit } from '@statsig/react-bindings'
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics'
import { StatsigSessionReplayPlugin } from '@statsig/session-replay'

export default function MyStatsig({ children }: { children: React.ReactNode }) {
  const { client } = useClientAsyncInit(
    'client-Q6xDCqTKlI1kPlwM3Y6hllJEfAmI2drvdSniV4X8mQy',
    { userID: 'a-user' },
    { plugins: [new StatsigAutoCapturePlugin(), new StatsigSessionReplayPlugin()] },
  )

  return (
    <StatsigProvider client={client} loadingComponent={<div>Loading...</div>}>
      {children}
    </StatsigProvider>
  )
}
