export type MockSubmitResult = {
  success: boolean
  message: string
}

/**
 * Placeholder submit handler shared by every form. Simulates network
 * latency so loading/success/error UI states can be built and tested
 * before a real API route exists. Swap the body for a fetch() call to
 * `/api/forms` once the backend is wired up — no form/component changes
 * needed since callers only depend on this function's signature.
 */
export async function mockSubmit<T>(values: T): Promise<MockSubmitResult> {
  console.info("[mock-submit] form values", values)

  await new Promise((resolve) => setTimeout(resolve, 900))

  return {
    success: true,
    message: "Thanks — we've received your request and will be in touch shortly.",
  }
}
