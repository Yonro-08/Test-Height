import { useEffect, useState } from 'react';
import './App.css';

function App() {
	const [isInputFocused, setIsInputFocused] = useState(false);
	const [scrollPosition, setScrollPosition] = useState(0);
	const [height, setHeight] = useState(window.innerHeight);

	useEffect(() => {
		setHeight(window.innerHeight);
	}, []);

	const preventDefault = (e: any) => {
		e.preventDefault();
	};

	const handleFocus = () => {
		setScrollPosition(window.scrollY);
		document.body.style.overflow = 'hidden';
		document.body.style.position = 'fixed';
		document.body.style.top = `-${window.scrollY}px`;
		document.body.style.width = '100%';
		window.addEventListener('touchmove', preventDefault, { passive: false });
		setIsInputFocused(true);
	};

	const handleBlur = () => {
		document.body.style.overflow = '';
		document.body.style.position = '';
		document.body.style.top = '';
		document.body.style.width = '';
		window.scrollTo(0, scrollPosition);
		//@ts-ignore
		window.removeEventListener('touchmove', preventDefault, { passive: false });
		setIsInputFocused(false);
	};

	return (
		<div className="container">
			<p>{height}</p>
			{isInputFocused && <div>Input is focused</div>}
			<input
				type="text"
				onFocus={handleFocus}
				onBlur={handleBlur}
				onChange={() => {
					setHeight(window.innerHeight);
				}}
			/>
		</div>
	);
}

export default App;
