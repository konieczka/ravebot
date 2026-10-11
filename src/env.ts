import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	CF_ACCOUNT_ID: {
		schema: optional,
		description:
			'Cloudflare account id that owns the AI Gateway. Leave unset to run TechnoBot in offline mode.'
	},
	CF_AI_GATEWAY_ID: {
		schema: (value) => value || 'default',
		description: 'AI Gateway id (the `default` gateway is created automatically on first request).'
	},
	CF_AIG_TOKEN: {
		schema: optional,
		description:
			'Gateway auth token, sent as `cf-aig-authorization`. Only needed for authenticated gateways.'
	},
	LLM_API_KEY: {
		schema: optional,
		description:
			'Provider key sent as `Authorization: Bearer`. For `workers-ai/*` models this is a Cloudflare API token with Workers AI access; omit it when the gateway stores the key (BYOK).'
	},
	LLM_MODEL: {
		schema: (value) => value || 'workers-ai/@cf/qwen/qwen2.5-coder-32b-instruct',
		description: 'Model in AI Gateway `{provider}/{model}` format.'
	}
});
