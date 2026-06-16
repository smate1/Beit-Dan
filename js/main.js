;(function () {
	const header = document.querySelector('.header')
	if (!header) return

	const burger = header.querySelector('.header__burger')
	const menu = header.querySelector('#header-menu')
	if (!burger || !menu) return

	const MOBILE_BREAKPOINT = 1199
	let scrollY = 0

	const isMobileMenu = () => window.innerWidth <= MOBILE_BREAKPOINT

	const setHeaderOffset = () => {
		document.documentElement.style.setProperty(
			'--header-offset',
			`${header.offsetHeight}px`,
		)
	}

	const getScrollPosition = () =>
		window.scrollY ||
		window.pageYOffset ||
		document.documentElement.scrollTop ||
		document.body.scrollTop ||
		0

	const lockScroll = () => {
		scrollY = getScrollPosition()
		document.body.style.top = `-${scrollY}px`
		document.body.classList.add('no-scroll')
	}

	const unlockScroll = () => {
		const y = scrollY
		const html = document.documentElement
		const prevScrollBehavior = html.style.scrollBehavior

		document.body.classList.remove('no-scroll')
		document.body.style.top = ''

		html.style.scrollBehavior = 'auto'
		html.scrollTop = y
		document.body.scrollTop = y
		window.scrollTo({ top: y, left: 0, behavior: 'instant' })

		requestAnimationFrame(() => {
			window.scrollTo({ top: y, left: 0, behavior: 'instant' })
			html.style.scrollBehavior = prevScrollBehavior
		})
	}

	const dropdownItems = [...header.querySelectorAll('.nav__item--dropdown')]

	const closeDropdowns = () => {
		dropdownItems.forEach(item => {
			item.classList.remove('is-open')
			const toggle = item.querySelector('.nav__link')
			if (toggle) toggle.setAttribute('aria-expanded', 'false')
		})
	}

	const closeMenu = () => {
		header.classList.remove('header--open')
		burger.setAttribute('aria-expanded', 'false')
		burger.setAttribute('aria-label', 'Відкрити меню')
		closeDropdowns()
		if (document.body.classList.contains('no-scroll')) unlockScroll()
	}

	const getHeaderOffset = () => {
		const offset = parseInt(
			getComputedStyle(document.documentElement).getPropertyValue(
				'--header-offset',
			),
			10,
		)
		return Number.isFinite(offset) ? offset : header.offsetHeight
	}

	const scrollToSection = target => {
		const top =
			target.getBoundingClientRect().top +
			getScrollPosition() -
			getHeaderOffset()
		window.scrollTo({ top, left: 0, behavior: 'smooth' })
	}

	const openMenu = () => {
		if (isMobileMenu()) {
			setHeaderOffset()
			lockScroll()
		}
		header.classList.add('header--open')
		burger.setAttribute('aria-expanded', 'true')
		burger.setAttribute('aria-label', 'Закрити меню')
	}

	burger.addEventListener('click', () => {
		if (header.classList.contains('header--open')) {
			closeMenu()
		} else {
			openMenu()
		}
	})

	dropdownItems.forEach(item => {
		const toggle = item.querySelector('.nav__link')
		if (!toggle) return

		toggle.setAttribute('aria-haspopup', 'true')
		toggle.setAttribute('aria-expanded', 'false')

		toggle.addEventListener('click', event => {
			if (!isMobileMenu()) return

			event.preventDefault()
			const isOpen = item.classList.toggle('is-open')
			toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false')

			dropdownItems.forEach(other => {
				if (other === item) return
				other.classList.remove('is-open')
				const otherToggle = other.querySelector('.nav__link')
				if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false')
			})
		})
	})

	const handleNavAnchorClick = (event, link) => {
		const href = link.getAttribute('href')
		if (!href?.startsWith('#')) {
			closeMenu()
			return
		}

		const target = document.getElementById(href.slice(1))
		if (!target) {
			closeMenu()
			return
		}

		if (!header.classList.contains('header--open')) return

		event.preventDefault()
		closeMenu()

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				scrollToSection(target)
			})
		})
	}

	menu.querySelectorAll('.nav__link, .nav__dropdown-link').forEach(link => {
		link.addEventListener('click', event => {
			if (
				isMobileMenu() &&
				link.classList.contains('nav__link') &&
				link.closest('.nav__item--dropdown')
			) {
				return
			}

			handleNavAnchorClick(event, link)
		})
	})

	document.addEventListener('keydown', event => {
		if (event.key === 'Escape') closeMenu()
	})

	window.addEventListener('resize', () => {
		setHeaderOffset()
		if (window.innerWidth > MOBILE_BREAKPOINT) {
			closeMenu()
		} else if (header.classList.contains('header--open')) {
			setHeaderOffset()
		} else {
			closeDropdowns()
		}
	})

	setHeaderOffset()

	let isHeaderScrolled = false

	const updateHeaderScroll = () => {
		const scrolled = getScrollPosition() > 0
		if (scrolled === isHeaderScrolled) return
		isHeaderScrolled = scrolled
		header.classList.toggle('header--scrolled', scrolled)
		setHeaderOffset()
	}

	updateHeaderScroll()
	window.addEventListener('scroll', updateHeaderScroll, { passive: true })
})()

;(function () {
	const REVIEWS_BREAKPOINT = 1100
	const AUTOPLAY_DELAY = 5000
	const ITEMS_PER_SLIDE = 2

	const section = document.querySelector('.reviews')
	if (!section) return

	const itemsWrap = section.querySelector('.reviews__items')
	const dotsWrap = section.querySelector('.reviews__dots')
	const items = [...section.querySelectorAll('.reviews__item')]

	if (!itemsWrap || !dotsWrap || !items.length) return

	let slides = []
	let current = 0
	let timer = null
	let enabled = false

	const isSlider = () => window.innerWidth <= REVIEWS_BREAKPOINT
	const prefersReducedMotion = () =>
		window.matchMedia('(prefers-reduced-motion: reduce)').matches

	const stopAutoplay = () => {
		if (timer) clearInterval(timer)
		timer = null
	}

	const startAutoplay = () => {
		stopAutoplay()
		if (!enabled || prefersReducedMotion()) return
		timer = setInterval(() => {
			goTo(current + 1)
		}, AUTOPLAY_DELAY)
	}

	const updateDots = () => {
		dotsWrap.querySelectorAll('.reviews__dot').forEach((dot, index) => {
			const isActive = index === current
			dot.classList.toggle('is-active', isActive)
			dot.setAttribute('aria-selected', isActive ? 'true' : 'false')
			dot.tabIndex = isActive ? 0 : -1
		})
	}

	const goTo = index => {
		if (!slides.length) return

		current = (index + slides.length) % slides.length

		slides.forEach((slide, slideIndex) => {
			const isActive = slideIndex === current
			slide.classList.toggle('is-active', isActive)
			slide.setAttribute('aria-hidden', isActive ? 'false' : 'true')
		})

		updateDots()
	}

	const buildSlides = () => {
		itemsWrap.innerHTML = ''
		slides = []

		for (let i = 0; i < items.length; i += ITEMS_PER_SLIDE) {
			const slide = document.createElement('div')
			slide.className = 'reviews__slide'
			items.slice(i, i + ITEMS_PER_SLIDE).forEach(item => {
				slide.appendChild(item)
			})
			itemsWrap.appendChild(slide)
			slides.push(slide)
		}
	}

	const destroySlides = () => {
		itemsWrap.innerHTML = ''
		items.forEach(item => {
			item.classList.remove('is-active')
			item.removeAttribute('aria-hidden')
			itemsWrap.appendChild(item)
		})
		slides = []
	}

	const buildDots = () => {
		dotsWrap.innerHTML = ''

		slides.forEach((slide, index) => {
			const names = [...slide.querySelectorAll('.reviews__name')]
				.map(nameEl => nameEl.textContent.trim())
				.filter(Boolean)
				.join(', ')
			const dot = document.createElement('button')
			dot.type = 'button'
			dot.className = 'reviews__dot'
			dot.setAttribute('role', 'tab')
			dot.setAttribute(
				'aria-label',
				names ? `Відгуки: ${names}` : `Слайд ${index + 1}`,
			)
			dot.addEventListener('click', () => {
				goTo(index)
				startAutoplay()
			})
			dotsWrap.appendChild(dot)
		})
	}

	const enable = () => {
		if (enabled) return
		enabled = true
		section.classList.add('reviews--slider')
		itemsWrap.setAttribute('aria-live', 'polite')
		buildSlides()
		buildDots()
		goTo(current)
		startAutoplay()
	}

	const disable = () => {
		if (!enabled) return
		enabled = false
		section.classList.remove('reviews--slider')
		stopAutoplay()
		itemsWrap.removeAttribute('aria-live')
		destroySlides()
		dotsWrap.innerHTML = ''
		current = 0
	}

	const update = () => {
		if (isSlider()) enable()
		else disable()
	}

	section.addEventListener('mouseenter', stopAutoplay)
	section.addEventListener('mouseleave', startAutoplay)
	section.addEventListener('focusin', stopAutoplay)
	section.addEventListener('focusout', event => {
		if (!section.contains(event.relatedTarget)) startAutoplay()
	})

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) stopAutoplay()
		else startAutoplay()
	})

	window.addEventListener('resize', update)
	update()
})()

;(function () {
	const section = document.querySelector('.news')
	if (!section) return

	const track = section.querySelector('.news__track')
	const prev = section.querySelector('.news__nav--prev')
	const next = section.querySelector('.news__nav--next')
	const cards = [...section.querySelectorAll('.news__card')]

	if (!track || !prev || !next || !cards.length) return

	const GAP = 20
	let index = 0

	const getVisibleCount = () => {
		if (window.innerWidth <= 768) return 1
		if (window.innerWidth <= 1240) return 2
		return 3
	}

	const getMaxIndex = () => Math.max(0, cards.length - getVisibleCount())

	const update = () => {
		index = Math.min(index, getMaxIndex())
		const cardWidth = cards[0].getBoundingClientRect().width
		track.style.transform = `translateX(-${index * (cardWidth + GAP)}px)`
		prev.disabled = index === 0
		next.disabled = index >= getMaxIndex()
	}

	prev.addEventListener('click', () => {
		index = Math.max(0, index - 1)
		update()
	})

	next.addEventListener('click', () => {
		index = Math.min(getMaxIndex(), index + 1)
		update()
	})

	window.addEventListener('resize', update)
	update()
})()

;(function () {
	const accordion = document.querySelector('.accordion')
	if (!accordion) return

	accordion.querySelectorAll('.accordion__item').forEach(item => {
		const header = item.querySelector('.accordion__header')
		const btn = item.querySelector('.accordion__btn')
		if (!header || !btn) return

		const toggle = () => {
			const isOpen = item.classList.toggle('accordion__item--open')
			btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
			btn.setAttribute('aria-label', isOpen ? 'Згорнути' : 'Розгорнути')
			header.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
		}

		header.addEventListener('click', toggle)
		header.addEventListener('keydown', e => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				toggle()
			}
		})

		header.setAttribute('tabindex', '0')
		header.setAttribute('role', 'button')
		header.setAttribute('aria-expanded', 'false')
		btn.setAttribute('tabindex', '-1')
	})
})()
