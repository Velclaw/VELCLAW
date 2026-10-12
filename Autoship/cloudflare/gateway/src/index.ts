export interface Env {
  AUTOSHIP: {
    fetch(request: Request): Promise<Response>
  }
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return env.AUTOSHIP.fetch(request)
  },
}
