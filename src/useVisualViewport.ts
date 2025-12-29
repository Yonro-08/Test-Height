'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

const KEYBOARD_THRESHOLD = 120;

interface UseVisualViewportOptions {
	fixedElementRef?: RefObject<HTMLElement>;
}

export default function useVisualViewport(options?: UseVisualViewportOptions) {
	const [height, setHeight] = useState<number | null>(null);
	const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

	const initialHeightRef = useRef<number | null>(null);
	const fixedElementRef = useRef<HTMLElement | null>(null);
	const originalElementPaddingRef = useRef<string>('');
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

		// Функция для обновления padding-bottom элемента
		const updateElementPadding = () => {
			const element = fixedElementRef.current;
			if (!element) return;

			// При закрытой клавиатуре (isKeyboardOpen = false) paddingBottom = 0
			if (!isKeyboardOpenRef.current) {
				element.style.paddingBottom = '0px';
				return;
			}

			// При открытой клавиатуре устанавливаем высоту элемента
			const fixedElementHeight = element.offsetHeight || 0;
			element.style.paddingBottom = `${fixedElementHeight}px`;
		};

		// Инициализация работы с фиксированным элементом
		if (options?.fixedElementRef?.current) {
			fixedElement = options.fixedElementRef.current;
			fixedElementRef.current = fixedElement;

			// Сохраняем оригинальные стили элемента
			originalElementPaddingRef.current =
				fixedElement.style.paddingBottom || '';

			// Устанавливаем начальный padding-bottom
			updateElementPadding();

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

					// Обновляем padding-bottom при изменении размера
					updateElementPadding();
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
					updateElementPadding();
				};

				viewport.addEventListener('resize', handleViewportResizeForPadding, {
					passive: true,
				});
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
				// Обновляем padding-bottom когда клавиатура открыта
				if (options?.fixedElementRef) {
					updateElementPadding();
				}
				return;
			}

			if (diff <= KEYBOARD_THRESHOLD) {
				isKeyboardOpenRef.current = false;
				setIsKeyboardOpen(false);
				setHeight(initialHeight);
				// Обновляем padding-bottom когда клавиатура закрыта (становится 0)
				if (options?.fixedElementRef) {
					updateElementPadding();
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

			// Восстанавливаем padding-bottom элемента
			if (fixedElementRef.current) {
				fixedElementRef.current.style.paddingBottom =
					originalElementPaddingRef.current;
			}
		};
	}, [options?.fixedElementRef]);

	return {
		height,
		isKeyboardOpen,
	};
}
