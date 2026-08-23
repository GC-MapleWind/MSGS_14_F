import type { SettlementItem } from '$lib/types';

export function getSettlementCaption(item: SettlementItem): string {
	const title = item.title.trim();
	const description = item.description.trim();

	if (!description || description === title) {
		return title;
	}

	return `${title}\n${description}`;
}
