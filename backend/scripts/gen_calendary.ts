import { db } from "../src/db/index.js"
import fs from "node:fs/promises"

const eventosFile = await fs.readFile("scripts/eventos.json")

console.log(eventosFile)