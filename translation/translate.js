// curl 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=Airing%20Today'
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

const makeTranslationAPI = async (source, target, text) => {
	const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${text}`;
	return fetch(url)
		.then((res) => res.json())
		.then((res) => res[0][0][0])
		.catch((err) => {
			console.error('err', err);
		});
};

const toCapitalize = (str) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

const getTranslationFiles = () => {
	const source = process.env.SOURCE || 'en';
	const envFiles = process.env.TRANSLATION_FILES || '';
	return envFiles
		.split(',')
		.filter((file) => ![source].includes(file))
		.map((file) => file + '.json');
};

const translate = () => {
	const i18nFolderPath = process.env.I18N_FOLDER_PATH || 'src/i18n';
	fs.readdir(i18nFolderPath, async (err, files) => {
		const source = process.env.SOURCE || 'vi';
		const sourceFile = source + '.json';
		const sourceJSON = fs.readFileSync(i18nFolderPath + '/' + sourceFile, 'utf8');
		const sourceObject = JSON.parse(sourceJSON);
		const sourceKeys = Object.keys(sourceObject);

		const translationFiles = getTranslationFiles();
		const total = translationFiles.length;
		let index = 1;

		for (let file of translationFiles) {
			let result = {};
			for (let key of sourceKeys) {
				const target = file.split('.')[0];

				let translated = '';
				const targetPath = i18nFolderPath + '/' + file;
				if (!fs.existsSync(targetPath)) {
					translated = toCapitalize(await makeTranslationAPI(source, target, sourceObject[key]));
				} else {
					const targetJSON = fs.readFileSync(targetPath, 'utf8');
					const targetObject = JSON.parse(targetJSON);
					if (key.startsWith('_t_')) translated = toCapitalize(await makeTranslationAPI(source, target, sourceObject[key]));
					else translated = targetObject[key] || toCapitalize(await makeTranslationAPI(source, target, sourceObject[key]));
				}

				result[key] = translated;
			}

			result = JSON.stringify(result, null, 2);

			fs.writeFile(i18nFolderPath + '/' + file, result, 'utf8', function (err) {
				if (err) throw err;
				console.log('LOG ~ :', file, index++, '/', total, 'done');
			});
		}
	});
};

const prepareEnv = () => {
	if (!fs.existsSync('.env')) {
		console.error('Please create .env file');
		process.exit(1);
	}
	dotenv.config();
};

const main = async () => {
	prepareEnv();
	translate();
};

main();
