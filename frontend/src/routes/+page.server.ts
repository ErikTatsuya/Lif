import type { PageServerLoad } from './$types';
import { API_BASE_URL } from '../lib/server/api';

type DailyEvent = {
	day: number;
	month: number;
	year: number;
	title: string;
	description: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isDailyEvent(value: unknown): value is DailyEvent {
	return (
		isRecord(value) &&
		typeof value.day === 'number' &&
		typeof value.month === 'number' &&
		typeof value.year === 'number' &&
		typeof value.title === 'string' &&
		typeof value.description === 'string'
	);
}

export const load: PageServerLoad = async ({ fetch }) => {
	let response: Response;
	try {
		response = await fetch(`${API_BASE_URL}/daytron`);
	} catch (cause) {
		console.error('Erro ao carregar o dado diário:', cause);
		return { dailyEvent: null, dailyEventMessage: 'Não foi possível carregar o dado diário.' };
	}

	if (response.status === 404) {
		return { dailyEvent: null, dailyEventMessage: 'Ainda não há um dado cadastrado para hoje.' };
	}

	if (!response.ok) {
		console.error('Erro ao carregar o dado diário:', response.status, response.statusText);
		return { dailyEvent: null, dailyEventMessage: 'Não foi possível carregar o dado diário.' };
	}

	let body: unknown;
	try {
		body = await response.json();
	} catch (cause) {
		console.error('Resposta inválida ao carregar o dado diário:', cause);
		return { dailyEvent: null, dailyEventMessage: 'A API retornou uma resposta inválida.' };
	}

	const events = isRecord(body) && Array.isArray(body.event) ? body.event : [];
	const dailyEvent = events.find(isDailyEvent) ?? null;

	return {
		dailyEvent,
		dailyEventMessage: dailyEvent ? null : 'Ainda não há um dado cadastrado para hoje.'
	};
};
