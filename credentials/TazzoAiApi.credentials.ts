import {
	ICredentialType,
	ICredentialTestRequest,
	INodeProperties,
	NodePropertyTypes,
	Icon,
} from 'n8n-workflow';

export class TazzoAiApi implements ICredentialType {
	name = 'tazzoAiApi';
	displayName = 'Tazzo.ai API';
	icon = 'file:tazzo.svg' as Icon;
	documentationUrl = 'https://docs.n8n.io/integrations/creating-nodes';

	properties: INodeProperties[] = [
		{
			displayName: 'Email',
			name: 'email',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];

}

export default TazzoAiApi;
