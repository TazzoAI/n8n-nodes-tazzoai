import {

	ICredentialType,

	INodeProperties,

	ICredentialTestRequest,
	Icon,

} from 'n8n-workflow';
 
export class TazzoAiApi implements ICredentialType {

	name = 'tazzoAiApi';

	displayName = 'Tazzo.ai API';

	icon = 'file:tazzo.svg' as Icon;

	documentationUrl = 'https://github.com/TazzoAI/n8n-nodes-tazzoai/blob/main/README.md';
 
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
 
	test: ICredentialTestRequest = {

		request: {

			method: 'POST',

			url: 'https://api.tazzo.ai/auth/login',

			body: {

				email: '={{$credentials.email}}',

				password: '={{$credentials.password}}',

			},

			headers: {

				'Content-Type': 'application/json',

			},

		},

	};

}

 