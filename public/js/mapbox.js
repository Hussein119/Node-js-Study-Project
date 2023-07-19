/* eslint-disable no-undef */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiaHVzc2VpbjExOSIsImEiOiJjbGs4ODZuenUwZ2kxM3NybzQxaXJjYjh5In0.7MHWVpP-VRm1Di8fVMcCTw';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
});
 