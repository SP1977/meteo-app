export function getLocalTime(cityTimezoneOffset = 0) {
	const nowUTC = new Date(
		new Date().getTime() + new Date().getTimezoneOffset() * 60000
	); // Heure UTC
	const localTime = cityTimezoneOffset
		? new Date(nowUTC.getTime() + cityTimezoneOffset * 1000) // Heure ajustée selon le décalage horaire
		: new Date(); // Heure locale

	return { nowUTC, localTime };
}
