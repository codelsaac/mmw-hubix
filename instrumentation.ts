export async function register() {
  // No instrumentation hooks registered
}

export const onRequestError = async (err: Error, request: Request) => {
  console.error('Unhandled request error', {
    message: err.message,
    name: err.name,
    stack: err.stack,
    request: {
      url: request.url,
      method: request.method,
    },
  })
}
