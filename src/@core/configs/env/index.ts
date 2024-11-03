const Env = {
	...process.env,
	//Public env
	NEXT_PUBLIC_BE_URL: process.env.NEXT_PUBLIC_BE_URL || 'http://103.167.89.184:8080',
	NEXT_PUBLIC_X_ACCESS_TOKEN: process.env.NEXT_PUBLIC_X_ACCESS_TOKEN || 'authorization',
	//Server env
	NEXT_PUBLIC_AUTHENTICATION_ENABLED: process.env.NEXT_PUBLIC_AUTHENTICATION_ENABLED === 'true' || false,
	NEXT_PUBLIC_REMOVE_CONSOLE: process.env.NEXT_PUBLIC_REMOVE_CONSOLE === 'true' || false,
	NEXT_PUBLIC_NOTIFY_LIBRARY: process.env.NEXT_PUBLIC_NOTIFY_LIBRARY || 'toast',
};

export default Env;
