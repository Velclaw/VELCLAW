import { headers } from 'next/headers'
import { VelclawLanding } from '@/components/velclaw-landing'
import {
  getVelclawDomainRole,
  getVelclawDomainRoleContent,
  getVelclawOriginForRole,
} from '@/lib/velclaw/domain-config'

/** Renders the landing experience with screen-reader context tailored to the request's domain role. */
export default async function VelclawWorkspacePage() {
  const requestHeaders = await headers()
  const role = getVelclawDomainRole(requestHeaders.get('host'))
  const content = getVelclawDomainRoleContent[role]
  const origin = getVelclawOriginForRole(role)

  return (
    <>
      <section className="sr-only" aria-labelledby="domain-purpose">
        <h1 id="domain-purpose">{content.heading}</h1>
        <p>{content.intro}</p>
        <p>
          Official Velclaw service: <a href={origin}>{origin}</a>
        </p>
      </section>
      <VelclawLanding role={role} />
    </>
  )
}
