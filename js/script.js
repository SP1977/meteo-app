import { clock } from "./clock.js";
import { getLocalTime } from "./utils.js";

let cityTimezoneOffset = 0; // variable globale pour la ville
let clockInterval; // Référence à l'intervalle pour l'horloge

// Lancer la fonction clock toutes les secondes
function startClock() {
	clearInterval(clockInterval); // Annuler l'intervalle précédent
	clockInterval = setInterval(() => clock(cityTimezoneOffset), 1000); // Redémarrer avec le nouvel intervalle
}

// Initialiser l'horloge et la date au démarrage de la page
function initializeClock() {
	// Mise à jour de la date locale immédiatement au démarrage
	updateDate(cityTimezoneOffset);
	clock(cityTimezoneOffset); // Afficher immédiatement l'heure
	startClock(); // Démarrer la mise à jour régulière de l'heure
}

const cityEl = document.querySelector(".city");
const tempEl = document.querySelector(".temperature");
const cityInput = document.querySelector("#cityInput");
const dateEl = document.querySelector(".date");
const meteoBlock = document.querySelector(".city-temp");
const icon = document.getElementById("icon");

function updateDate(cityTimezoneOffset = 0, locale = "fr-CH") {
	const { localTime } = getLocalTime(cityTimezoneOffset);

	const options = {
		day: "numeric",
		month: "long",
		year: "numeric",
		weekday: "long",
	};

	let formattedDate = new Intl.DateTimeFormat(locale, options).format(
		localTime
	);
	formattedDate =
		formattedDate[0].toLocaleUpperCase() + formattedDate.slice(1);
	dateEl.textContent = formattedDate;
}

// Récupérer la météo par latitude et longitude
const fetchWeatherByCoords = async (latitude, longitude) => {
	try {
		const res = await fetch(
			`/.netlify/functions/weather?latitude=${latitude}&longitude=${longitude}`
		);
		const data = await res.json();

		const city = data.name || data[0]?.name;
		const country = data.sys?.country || data[0]?.country;

		if (city) {
			await fetchWeatherByCity(city);
		} else {
			console.error("Erreur : Ville non trouvée.");
		}
	} catch (err) {
		console.error("Erreur de géolocalisation : ", err);
	}
};

// Récupérer la météo par ville
const fetchWeatherByCity = async (city) => {
	try {
		const resTemp = await fetch(`/.netlify/functions/weather?city=${city}`);
		const dataTemp = await resTemp.json();

		if (dataTemp.error) {
			throw new Error(dataTemp.error);
		}

		// Mise à jour du décalage horaire et de l'horloge
		cityTimezoneOffset = dataTemp.timezone;
		updateDate(cityTimezoneOffset, dataTemp.sys.country); // Mettre à jour la date
		clock(cityTimezoneOffset); // Mettre à jour l'heure immédiatement
		startClock(); // Redémarrer l'intervalle de l'horloge

		// Affichage de la météo
		const temp = dataTemp.main.temp;
		meteoBlock.style.display = "flex";
		const cityClean =
			city.charAt(0).toLocaleUpperCase() +
			city.slice(1).toLocaleLowerCase();

		cityEl.textContent = `${cityClean}:`;
		tempEl.textContent = `${Math.round(temp)} °C`;
		icon.src = `https://openweathermap.org/img/w/${dataTemp.weather[0].icon}.png`;
		icon.style.display = "block";
	} catch (err) {
		console.error("Erreur lors de la récupération de la météo : ", err);
		alert(
			"Erreur lors de la récupération des données. Essayez une autre ville."
		);
	}
};

// Fonction de géolocalisation
const geoLocation = () => {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				fetchWeatherByCoords(latitude, longitude);
				meteoBlock.style.display = "flex";
			},
			() => {
				alert(
					"Géolocalisation non autorisée. Veuillez entrer une ville."
				);
			}
		);
	} else {
		alert("La géolocalisation n'est pas supportée par votre navigateur.");
	}
};

// Gestion de la recherche par ville
const handleCitySearch = () => {
	const city = cityInput.value.trim();

	// Validation du nom de la ville
	const cityRegex = /^[a-zA-Z\u00C0-\u017F\s-]+$/;
	if (!cityRegex.test(city)) {
		alert("Veuillez entrer un nom de ville valide.");
		cityInput.value = "";
		return;
	}

	if (city) fetchWeatherByCity(city);
	cityInput.value = "";
};

// Evénement "submit" sur le formulaire
document.querySelector("#cityForm").addEventListener("submit", (event) => {
	event.preventDefault();
	handleCitySearch();
});

// Initialiser la page
initializeClock(); // Lancer l'horloge et mettre à jour la date immédiatement
geoLocation(); // Lancer la géolocalisation
cityInput.focus(); // Focus sur l'input au démarrage
