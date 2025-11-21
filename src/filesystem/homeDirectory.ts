import os from "os"

export const HomeDirectory = import.meta.env?.MODE === "test" ? "/vitest/home" : os.homedir()
