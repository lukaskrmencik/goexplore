import 'leaflet/dist/leaflet.css'
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import AppRouter from './router.tsx'
import { useEffect, useState } from 'react';
import { testToken } from "../services/testToken";

function App() {

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const init = async () => {
			await testToken(); // počká než se token uloží
			setLoading(false);
		};
		init();
	}, []);

	if (loading) return <div>Loading...</div>;

	return (
		<div className="App">
			<AppRouter />
		</div>
	)
}

export default App
