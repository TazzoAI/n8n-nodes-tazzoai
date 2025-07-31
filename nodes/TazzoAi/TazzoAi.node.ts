import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
	NodeApiError,
} from 'n8n-workflow';

export class TazzoAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Tazzo.ai',
		name: 'tazzoAi',
		icon: 'file:tazzo.svg',
		group: ['transform'],
		version: 1,
		description: 'Trigger a call via Tazzo.ai voice agent',
		defaults: {
			name: 'Tazzo.ai Action',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'tazzoAiApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Agent ID',
				name: 'agentId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Contact Number',
				name: 'contactNumber',
				type: 'string',
				default: '',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('tazzoAiApi');
		const email = credentials.email as string;
		const password = credentials.password as string;

		this.logger.info(`TazzoAi credentials: ${JSON.stringify(credentials)}`);

		for (let i = 0; i < items.length; i++) {
			const agentId = this.getNodeParameter('agentId', i) as string;
			const contactNumber = this.getNodeParameter('contactNumber', i) as string;

			try {
				const loginResponse = await this.helpers.request({
					method: 'POST',
					url: 'https://api.tazzo.ai/auth/login',
					body: {
						email,
						password,
					},
					json: true,
				});

				const token = loginResponse?.data?.token;
				this.logger.info(`TazzoAi token: ${token}`);
				this.logger.info(`TazzoAi login response: ${JSON.stringify(loginResponse)}`);
				if (!token) {
					throw new NodeApiError(
						this.getNode(),
						{
							message: 'No token found in login response',
						},
						{ itemIndex: i },
					);
				}

				const triggerResponse = await this.helpers.request({
					method: 'POST',
					url: 'https://originate.tazzo.ai/',
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: {
						agentId,
						contactNumber,
					},
					json: true,
				});

				this.logger.info(
					`Preparing to trigger call... agentId: ${agentId}, contactNumber: ${contactNumber}`,
				);
				this.logger.info(
					`Trigger request headers: ${JSON.stringify({ Authorization: `Bearer ${token}` })}`,
				);
				this.logger.info(`Trigger request body: ${JSON.stringify({ agentId, contactNumber })}`);

				returnData.push({
					json: triggerResponse,
				});
			} catch (error) {
				this.logger.error(`Error triggering call for item ${i}: ${JSON.stringify(error)}`);
				throw new NodeApiError(this.getNode(), error as any, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
