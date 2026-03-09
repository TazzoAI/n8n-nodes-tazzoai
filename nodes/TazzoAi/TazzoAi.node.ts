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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Call',
						value: 'call',
					},
				],
				default: 'call',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Trigger',
						value: 'trigger',
						action: 'Start a call',
					},
				],
				default: 'trigger',
			},
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Start Call',
						value: 'start',
						action: 'Start a call',
					},
				],
				default: 'start',
				displayOptions: {
					show: {
						resource: ['call'],
						operation: ['trigger'],
					},
				},
			},
			{
				displayName: 'Agent ID',
				name: 'agentId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['call'],
						operation: ['trigger'],
					},
				},
			},

			{
				displayName: 'Contact Number',
				name: 'contactNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['call'],
						operation: ['trigger'],
					},
				},
			},
			{
				displayName: 'Personalization',
				name: 'personalization',
				type: 'json',
				default: '{}',
				description: 'Optional personalization data to pass to the call',
				displayOptions: {
					show: {
						resource: ['call'],
						operation: ['trigger'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('tazzoAiApi');
		const email = credentials.email as string;
		const password = credentials.password as string;

		for (let i = 0; i < items.length; i++) {
			const agentId = this.getNodeParameter('agentId', i) as string;
			const contactNumber = this.getNodeParameter('contactNumber', i) as string;
			const personalization = this.getNodeParameter('personalization', i, {}) as object;


			try {
				const loginResponse = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'tazzoAiApi',
					{
						method: 'POST',
						url: 'https://api.tazzo.ai/auth/login',
						body: {
							email,
							password,
						},
						json: true,
					},
				);

				const token = loginResponse?.data?.token;

				if (!token) {
					throw new NodeApiError(
						this.getNode(),
						{
							message: 'No token found in login response',
						},
						{ itemIndex: i },
					);
				}

				const triggerResponse = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'tazzoAiApi',
					{
						method: 'POST',
						url: 'https://control.tazzo.ai/',
						headers: {
							Authorization: `Bearer ${token}`,
						},
						body: {
							agentId,
							contactNumber,
							personalization,
						},
						json: true,
					},
				);

				returnData.push({
					json: triggerResponse,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}

				throw new NodeApiError(this.getNode(), error as any, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
