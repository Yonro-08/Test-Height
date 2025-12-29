'use client';

import { useEffect, useRef, useState } from 'react';

const KEYBOARD_THRESHOLD = 120;

interface UseVisualViewportOptions {
	fixedElementSelector?: string;
}

export default function useVisualViewport(options?: UseVisualViewportOptions) {
	const [height, setHeight] = useState<number | null>(null);
	const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

	const initialHeightRef = useRef<number | null>(null);
	const fixedElementRef = useRef<HTMLElement | null>(null);
	const originalBodyPaddingRef = useRef<string>('');
	const originalElementStylesRef = useRef<{
		position: string;
		bottom: string;
		top: string;
	} | null>(null);
	const isKeyboardOpenRef = useRef<boolean>(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const viewport = window.visualViewport;

		if (!viewport) {
			const fallbackHeight = window.innerHeight;
			setHeight(fallbackHeight);
			return;
		}

		if (!initialHeightRef.current) {
			initialHeightRef.current = viewport.height;
			setHeight(viewport.height);
		}

		let fixedElement: HTMLElement | null = null;
		let adjustFixedPos: (() => void) | null = null;
		let handleViewportResizeForPadding: (() => void) | null = null;

		// Функция для обновления padding-bottom (не устанавливает если клавиатура открыта)
		const updateBodyPadding = () => {
			if (isKeyboardOpenRef.current) return;

			const element = fixedElementRef.current;
			if (!element) return;

			const fixedElementHeight = element.offsetHeight || 0;
			document.body.style.paddingBottom = `${fixedElementHeight}px`;
		};

		// Инициализация работы с фиксированным элементом
		if (options?.fixedElementSelector) {
			fixedElement = document.querySelector(
				options.fixedElementSelector
			) as HTMLElement;

			if (fixedElement) {
				fixedElementRef.current = fixedElement;

				// Сохраняем оригинальные стили body
				originalBodyPaddingRef.current =
					document.body.style.paddingBottom || '';

				// Устанавливаем начальный padding-bottom
				updateBodyPadding();

				// Обработка для iOS
				const isIOS = /iPhone|iPad|iPod/.test(window.navigator.userAgent);

				if (isIOS) {
					// Сохраняем оригинальные стили элемента
					originalElementStylesRef.current = {
						position: fixedElement.style.position || '',
						bottom: fixedElement.style.bottom || '',
						top: fixedElement.style.top || '',
					};

					// Переключаем на absolute позиционирование
					fixedElement.style.position = 'absolute';
					fixedElement.style.bottom = 'auto';

					const getDocHeight = () => {
						const fixedElementHeight = fixedElement?.offsetHeight || 0;
						return document.documentElement.scrollHeight + fixedElementHeight;
					};

					adjustFixedPos = () => {
						if (!fixedElement || isKeyboardOpenRef.current) return;

						const fixedElementHeight = fixedElement.offsetHeight;
						const docHeight = getDocHeight();

						let fixedElementBottom =
							document.documentElement.scrollTop + viewport.height;

						if (fixedElementBottom > docHeight) {
							fixedElementBottom = docHeight;
						}

						fixedElement.style.top = `${
							fixedElementBottom - fixedElementHeight
						}px`;

						// Обновляем padding-bottom при изменении размера (только если клавиатура закрыта)
						updateBodyPadding();
					};

					adjustFixedPos();

					document.addEventListener('scroll', adjustFixedPos, {
						passive: true,
					});
					viewport.addEventListener('resize', adjustFixedPos, {
						passive: true,
					});
				} else {
					// Для не-iOS устройств обновляем padding при изменении размера viewport
					handleViewportResizeForPadding = () => {
						updateBodyPadding();
					};

					viewport.addEventListener('resize', handleViewportResizeForPadding, {
						passive: true,
					});
				}
			}
		}

		const handleResize = () => {
			const currentHeight = viewport.height;
			const initialHeight = initialHeightRef.current;

			if (!initialHeight) return;

			const diff = initialHeight - currentHeight;

			if (diff > KEYBOARD_THRESHOLD) {
				isKeyboardOpenRef.current = true;
				setIsKeyboardOpen(true);
				setHeight(currentHeight);
				// Очищаем padding-bottom когда клавиатура открыта
				if (options?.fixedElementSelector) {
					document.body.style.paddingBottom = originalBodyPaddingRef.current;
				}
				return;
			}

			if (diff <= KEYBOARD_THRESHOLD) {
				isKeyboardOpenRef.current = false;
				setIsKeyboardOpen(false);
				setHeight(initialHeight);
				// Восстанавливаем padding-bottom когда клавиатура закрыта
				if (options?.fixedElementSelector) {
					updateBodyPadding();
				}
			}
		};

		viewport.addEventListener('resize', handleResize);

		return () => {
			viewport.removeEventListener('resize', handleResize);

			// Очистка обработчиков фиксированного элемента
			if (adjustFixedPos) {
				const isIOS = /iPhone|iPad|iPod/.test(window.navigator.userAgent);
				if (isIOS) {
					document.removeEventListener('scroll', adjustFixedPos);
					viewport.removeEventListener('resize', adjustFixedPos);
				}
			}

			if (handleViewportResizeForPadding) {
				viewport.removeEventListener('resize', handleViewportResizeForPadding);
			}

			// Восстанавливаем оригинальные стили элемента
			if (originalElementStylesRef.current && fixedElementRef.current) {
				const element = fixedElementRef.current;
				element.style.position = originalElementStylesRef.current.position;
				element.style.bottom = originalElementStylesRef.current.bottom;
				element.style.top = originalElementStylesRef.current.top;
			}

			// Восстанавливаем padding-bottom body
			document.body.style.paddingBottom = originalBodyPaddingRef.current;
		};
	}, [options?.fixedElementSelector]);

	return {
		height,
		isKeyboardOpen,
	};
}
