import {
	ICredentialType,
	INodeProperties,
	NodePropertyTypes,
	Icon,
} from 'n8n-workflow';

export class TazzoAiApi implements ICredentialType {
	name: string = 'tazzoAiApi';
	displayName: string = 'Tazzo.ai API';
	icon: Icon = 'file:tazzo.svg';
	documentationUrl: string = 'https://docs.n8n.io/integrations/creating-nodes';

	properties: INodeProperties[] = [
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
}

export default TazzoAiApi;
