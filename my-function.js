exports.handler = async (event) => {
	const keyword = event.queryStringParameters?.keyword || 'nothing';
	return {
		statusCode: 200,
		body: JSON.stringify({ message: `Bashar says ${keyword}` }),
	};
};
