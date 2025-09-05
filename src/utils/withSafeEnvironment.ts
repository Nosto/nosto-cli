import { loadConfig, type LoadConfigProps } from "#config/config.ts"
import { withErrorHandler } from "#errors/withErrorHandler.ts"
import { assertGitRepo } from "#filesystem/asserts/assertGitRepo.ts"
import { assertNostoTemplate } from "#filesystem/asserts/assertNostoTemplate.ts"

type Props = LoadConfigProps & {
  skipSanityCheck?: boolean
}

export async function withSafeEnvironment(
  { skipSanityCheck, ...props }: Props,
  fn: () => void | Promise<void>
): Promise<void> {
  await withErrorHandler(async () => {
    loadConfig(props)
    if (!skipSanityCheck) {
      assertNostoTemplate()
    }
    assertGitRepo()
    await fn()
  })
}
