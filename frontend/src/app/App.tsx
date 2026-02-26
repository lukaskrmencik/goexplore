import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import AppRouter from './router.tsx';
import { usePrefetcher } from '../hooks/usePrefetcher.ts';

function App() {
	usePrefetcher();
	
	return (
		<div className="App">
			<AppRouter />
		</div>
	);
}

export default App;
