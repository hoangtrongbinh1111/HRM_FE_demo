import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800&display=swap" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
