module.exports = {
	files: './src/service/bot/api/services/*.ts',
	from: [
		/import.+CancelablePromise.+\n/g,
		/\:\s*CancelablePromise\s*\<([a-zA-Z0-9]+)\>\s*\{/g
	],
  	to: [
		"import { ApiResponse } from '../core/ApiResponse';",
		':Promise<ApiResponse<$1>>{'
	],
};