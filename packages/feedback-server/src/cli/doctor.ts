import { FeedbackHttpClient } from '../client.js';
import { projectFeedbackPaths, readFeedbackServerConfig } from '../config.js';

export interface DoctorOptions {
	endpoint?: string;
	projectRoot?: string;
}

export interface DoctorResult {
	output: string;
	error: string | null;
	exitCode: number;
}

export async function runDoctor(options: DoctorOptions = {}): Promise<DoctorResult> {
	const projectRoot = options.projectRoot ?? process.cwd();
	const paths = projectFeedbackPaths(projectRoot);
	const projectConfig = options.endpoint ? null : readFeedbackServerConfig(projectRoot);
	const resolvedEndpoint = options.endpoint ?? projectConfig?.baseUrl;
	const client = new FeedbackHttpClient({
		...(resolvedEndpoint ? { baseUrl: resolvedEndpoint } : {}),
		projectRoot
	});

	try {
		const [health, status] = await Promise.all([client.health(), client.status()]);
		return {
			output: [
				'DryUI feedback doctor',
				'',
				`Project: ${projectRoot}`,
				`Endpoint: ${client.baseUrl}`,
				`Health: ${health.status}`,
				`Active listeners: ${status.activeListeners}`,
				`Agent listeners: ${status.agentListeners}`,
				`Store path: ${projectConfig?.dbPath ?? paths.dbPath}`
			].join('\n'),
			error: null,
			exitCode: 0
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return {
			output: '',
			error: [
				`feedback server unreachable at ${client.baseUrl}`,
				`(${message})`,
				'',
				'Try one of:',
				'  dryui-feedback server',
				'  dryui-feedback'
			].join('\n'),
			exitCode: 1
		};
	}
}
