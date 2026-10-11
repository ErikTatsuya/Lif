import { db } from "../db/index.js"
import { events } from "../db/schema.js"
import fs from "node:fs/promises"

type EventJson = {
    data: string
    ano: number
    title: string
    descricao: string
}


const eventosFile = await fs.readFile("src/scripts/eventos.json", "utf-8")
const data: EventJson[] = JSON.parse(eventosFile)

const eventos = data.map((eventJson: EventJson) => {
    const [dia, mes] = eventJson.data.split("-").map(Number)

    return {
        day: dia ?? 0,
        month: mes ?? 0,
        year: eventJson.ano,
        title: eventJson.title,
        description: eventJson.descricao,
    }
})

await db.insert(events).values(eventos)

console.log("Eventos inseridos com sucesso!")