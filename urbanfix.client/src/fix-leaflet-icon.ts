import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Override manual 100% compatible con Vite
const iconUrl = new URL('/leaflet/marker-icon.png', import.meta.url).href;
const iconRetinaUrl = new URL('/leaflet/marker-icon-2x.png', import.meta.url).href;
const shadowUrl = new URL('/leaflet/marker-shadow.png', import.meta.url).href;

L.Icon.Default.mergeOptions({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
});
