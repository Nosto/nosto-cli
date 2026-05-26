export function isRunningInTest() {
  return !!process.env.VITEST_WORKER_ID
}
