(function () {
	const header = document.querySelector('.header');
	if (!header) return;

	const burger = header.querySelector('.header__burger');
	const menu = header.querySelector('#header-menu');
	if (!burger || !menu) return;

	const MOBILE_BREAKPOINT = 1199;
	let scrollY = 0;

	const isMobileMenu = () => window.innerWidth <= MOBILE_BREAKPOINT;

	const setHeaderOffset = () => {
		const inner = header.querySelector('.header__inner');
		if (!inner) return;
		document.documentElement.style.setProperty(
			'--header-offset',
			`${inner.offsetHeight}px`,
		);
	};

	const getScrollPosition = () =>
		window.scrollY ||
		window.pageYOffset ||
		document.documentElement.scrollTop ||
		document.body.scrollTop ||
		0;

	const lockScroll = () => {
		scrollY = getScrollPosition();
		document.body.style.top = `-${scrollY}px`;
		document.body.classList.add('no-scroll');
	};

	const unlockScroll = () => {
		const y = scrollY;
		const html = document.documentElement;
		const prevScrollBehavior = html.style.scrollBehavior;

		document.body.classList.remove('no-scroll');
		document.body.style.top = '';

		html.style.scrollBehavior = 'auto';
		html.scrollTop = y;
		document.body.scrollTop = y;
		window.scrollTo({ top: y, left: 0, behavior: 'instant' });

		requestAnimationFrame(() => {
			window.scrollTo({ top: y, left: 0, behavior: 'instant' });
			html.style.scrollBehavior = prevScrollBehavior;
		});
	};

	const closeMenu = () => {
		header.classList.remove('header--open');
		burger.setAttribute('aria-expanded', 'false');
		burger.setAttribute('aria-label', 'Відкрити меню');
		if (document.body.classList.contains('no-scroll')) unlockScroll();
	};

	const openMenu = () => {
		if (isMobileMenu()) {
			setHeaderOffset();
			lockScroll();
		}
		header.classList.add('header--open');
		burger.setAttribute('aria-expanded', 'true');
		burger.setAttribute('aria-label', 'Закрити меню');
	};

	burger.addEventListener('click', () => {
		if (header.classList.contains('header--open')) {
			closeMenu();
		} else {
			openMenu();
		}
	});

	menu.querySelectorAll('.nav__link').forEach((link) => {
		link.addEventListener('click', closeMenu);
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') closeMenu();
	});

	window.addEventListener('resize', () => {
		setHeaderOffset();
		if (window.innerWidth > MOBILE_BREAKPOINT) {
			closeMenu();
		} else if (header.classList.contains('header--open')) {
			setHeaderOffset();
		}
	});

	setHeaderOffset();
})();
