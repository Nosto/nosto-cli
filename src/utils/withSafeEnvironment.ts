import { loadConfig, type LoadConfigProps } from "#config/config.ts"
import { withErrorHandler } from "#errors/withErrorHandler.ts"
import { assertGitRepo } from "#filesystem/asserts/assertGitRepo.ts"
import { assertNostoTemplate } from "#filesystem/asserts/assertNostoTemplate.ts"

export async function withSafeEnvironment(props: LoadConfigProps, fn: () => void | Promise<void>): Promise<void> {
  withErrorHandler(async () => {
    loadConfig(props)
    assertNostoTemplate()
    assertGitRepo()
    await fn()
  })
}
