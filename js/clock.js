import { getLocalTime } from "./utils.js";

export function clock(cityTimezoneOffset = 0) {
	// Appel de la fonction getLocalTime et débogage
	const { nowUTC, localTime } = getLocalTime(cityTimezoneOffset);

	// Vérification si les valeurs sont valides
	if (!nowUTC || !localTime) {
		console.error("Les valeurs 'nowUTC' et 'localTime' sont invalides.");
		return;
	}

	// Récupération de l'heure, minute et seconde de la ville (localTime ajusté)
	const hours = localTime.getHours();
	const minutes = localTime.getMinutes();
	const seconds = localTime.getSeconds();

	const hour = hours * 30; // 360° / 12 = 30° par heure
	const minute = minutes * 6; // 360° / 60 = 6° par minute
	const second = seconds * 6; // 360° / 60 = 6° par seconde

	// Mettre à jour l'affichage de l'horloge
	document.querySelector(
		".hour"
	).style.cssText = `transform: rotate(${hour}deg); display: block`;
	document.querySelector(
		".minute"
	).style.cssText = `transform: rotate(${minute}deg); display: block`;
	document.querySelector(
		".second"
	).style.cssText = `transform: rotate(${second}deg); display: block`;
}
