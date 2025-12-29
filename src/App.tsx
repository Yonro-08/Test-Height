import { useRef } from 'react';
import './App.css';
import useVisualViewport from './useVisualViewport';

function App() {
	const modalRef = useRef<HTMLDivElement>(null);
	useVisualViewport({ fixedElementRef: modalRef });

	return (
		<div className='container'>
			<div ref={modalRef} className='modal'>
				<div className={'modal__header'}>
					<span className={'modal__title'}>Войдите в учетную запись</span>
					<div className='modal__close'>
						<svg
							width='20'
							height='20'
							viewBox='0 0 20 20'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								fillRule='evenodd'
								clipRule='evenodd'
								d='M4.29289 4.2929C4.68341 3.90237 5.31657 3.90237 5.7071 4.29289L10.0001 8.5858L14.2929 4.29309C14.6834 3.90257 15.3166 3.90258 15.7071 4.2931C16.0976 4.68363 16.0976 5.3168 15.7071 5.70732L11.4143 10L15.7071 14.2927C16.0976 14.6832 16.0976 15.3164 15.7071 15.7069C15.3166 16.0974 14.6834 16.0974 14.2929 15.7069L10.0001 11.4142L5.7071 15.7071C5.31657 16.0976 4.68341 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.2929 14.2929L8.58587 10L4.2929 5.70711C3.90237 5.31659 3.90237 4.68343 4.29289 4.2929Z'
								fill='#141B28'
							/>
						</svg>
					</div>
				</div>
				<form className={'login'}>
					<div className={'login__inputs'}>
						<input placeholder={'Электронная почта'} />
						<input placeholder={'Пароль'} />
					</div>
					<div className={'login__footer'}>
						<button type={'submit'} className={'login__button'}>
							Войти
						</button>
						<div className={'login__actions'}>
							<button type='button'>Я забыл пароль</button>
							<button type='button'>Зарегистрироваться</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}

export default App;
