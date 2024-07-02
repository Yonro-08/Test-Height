import { useEffect, useState } from 'react';
import './App.css';

function App() {
	const [height, setHeight] = useState(window.innerHeight);

	useEffect(() => {
		setHeight(window.innerHeight);
	}, []);

	return (
		<div className="container">
			<p>{height}</p>
			<input
				type="text"
				onFocus={() => {
					setHeight(window.innerHeight);
				}}
				onChange={() => {
					setHeight(window.innerHeight);
				}}
			/>
		</div>
	);
}

export default App;
