import { defineEventHandler } from "nitro/h3";
import { getSettings } from "@/lib/db";

const TEZOS_DOMAINS_GRAPHQL = "https://api.tezos.domains/graphql";

export interface BakerDomainResponse {
	domain: string | null;
	address: string;
}

interface GraphQLResponse {
	data?: {
		reverseRecords?: {
			items?: Array<{
				address: string;
				domain?: {
					name: string;
				} | null;
			}>;
		};
	};
	errors?: Array<{ message: string }>;
}

export default defineEventHandler(async (): Promise<BakerDomainResponse> => {
	const settings = getSettings();

	if (!settings) {
		return {
			domain: null,
			address: "",
		};
	}

	const bakerAddress = settings.bakerAddress;

	try {
		const query = `
			query GetReverseRecord($address: String!) {
				reverseRecords(where: { address: { eq: $address } }) {
					items {
						address
						domain {
							name
						}
					}
				}
			}
		`;

		const response = await fetch(TEZOS_DOMAINS_GRAPHQL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				query,
				variables: { address: bakerAddress },
			}),
		});

		if (!response.ok) {
			console.error(
				"Tezos Domains API error:",
				response.status,
				response.statusText,
			);
			return {
				domain: null,
				address: bakerAddress,
			};
		}

		const result: GraphQLResponse = await response.json();

		if (result.errors?.length) {
			console.error("Tezos Domains GraphQL errors:", result.errors);
			return {
				domain: null,
				address: bakerAddress,
			};
		}

		const items = result.data?.reverseRecords?.items;
		const domainName = items?.[0]?.domain?.name ?? null;

		return {
			domain: domainName,
			address: bakerAddress,
		};
	} catch (error) {
		console.error("Failed to fetch Tezos domain:", error);
		return {
			domain: null,
			address: bakerAddress,
		};
	}
});
