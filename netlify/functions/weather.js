const axios = require("axios");

exports.handler = async function (event) {
	const API_KEY = process.env.API_KEY;
	const { city, latitude, longitude } = event.queryStringParameters;

	if (city) {
		// Si city est défini, appeler la fonction pour obtenir la météo par nom de ville
		return await getWeatherByCity(city, API_KEY);
	} else if (latitude && longitude) {
		// Si latitude et longitude sont définis, appeler la fonction pour obtenir la météo par coordonnées
		return await getWeatherByCoords(latitude, longitude, API_KEY);
	} else {
		// Gérer le cas d'erreur si aucun paramètre valide n'est passé
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: "Paramètres 'city' ou 'latitude' et 'longitude' requis",
			}),
		};
	}
};

async function getWeatherByCoords(latitude, longitude, API_KEY) {
	try {
		const geoResponse = await axios.get(
			`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
		);

		const city = geoResponse.data[0]?.name;
		const country = geoResponse.data[0]?.country;

		const weatherResponse = await axios.get(
			`https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}&units=metric`
		);

		return {
			statusCode: 200,
			body: JSON.stringify(weatherResponse.data),
		};
	} catch (error) {
		console.error("Erreur de géolocalisation :", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: "Erreur lors de la récupération des données météo",
			}),
		};
	}
}

async function getWeatherByCity(city, API_KEY) {
	try {
		const response = await axios.get(
			`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
		);
		return {
			statusCode: 200,
			body: JSON.stringify(response.data),
		};
	} catch (error) {
		console.error("Erreur lors de la recherche par ville :", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: "Erreur lors de la récupération des données météo par ville",
			}),
		};
	}
}
