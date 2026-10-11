import type { FastifyRequest, FastifyReply } from "fastify";

import { getTodaysEventService } from "../services/daytron.js";

export async function getTodaysEventController(
    req: FastifyRequest,
    res: FastifyReply
) {
    const hoje = new Date();

    const day = hoje.getDate();
    const month = hoje.getMonth() + 1;

    const event = await getTodaysEventService(day, month);

    if (!event) {
        return res.status(404).send({
            error: "Nenhum evento encontrado para hoje."
        });
    }

    return res.status(200).send({ event });
}