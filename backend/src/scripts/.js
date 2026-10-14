import fs from "node:fs/promises"
import clipboard from "clipboardy"

const file = await fs.readFile("src/scripts/eventos.json")
const data = JSON.parse(file)
const compact = JSON.stringify(data)

console.log(compact)
await clipboard.write(compact)