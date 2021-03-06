(function() {

	/**
	 * Debounce
	 *
	 * @param {Function} func
	 * @param {number} wait
	 * @param {boolean} immediate
	 */
	function debounce(func, wait, immediate) {
		'use strict';

		var timeout;
		wait      = (typeof wait !== 'undefined') ? wait : 20;
		immediate = (typeof immediate !== 'undefined') ? immediate : true;

		return function() {

			var context = this, args = arguments;
			var later = function() {
				timeout = null;

				if (!immediate) {
					func.apply(context, args);
				}
			};

			var callNow = immediate && !timeout;

			clearTimeout(timeout);
			timeout = setTimeout(later, wait);

			if (callNow) {
				func.apply(context, args);
			}
		};
	}

	/**
	 * Prepends an element to a container.
	 *
	 * @param {Element} container
	 * @param {Element} element
	 */
	function prependElement(container, element) {
		if (container.firstChild.nextSibling) {
			return container.insertBefore(element, container.firstChild.nextSibling);
		} else {
			return container.appendChild(element);
		}
	}

	/**
	 * Shows an element by adding a hidden className.
	 *
	 * @param {Element} element
	 */
	function showElement(element) {
		// classList.remove is not supported in IE11
		element.className = element.className.replace('is-hidden', '');
	}

	/**
	 * Hides an element by removing the hidden className.
	 *
	 * @param {Element} element
	 */
	function hideElement(element) {
		// classList.add is not supported in IE11
		if (!element.classList.contains('is-hidden')) {
			element.className += ' is-hidden';
		}
	}

	/**
	 * Returns the currently available space in the menu container.
	 *
	 * @returns {number} Available space
	 */
	function getAvailableSpace( button, container ) {
		return button.classList.contains('is-hidden') ? container.offsetWidth : container.offsetWidth - button.offsetWidth - 50;
	}

	/**
	 * Returns whether the current menu is overflowing or not.
	 *
	 * @returns {boolean} Is overflowing
	 */
	function isOverflowingNavivation( list, button, container ) {
		return list.offsetWidth > getAvailableSpace( button, container );
	}

	/**
	 * Set menu container variable
	 */
	var navContainer = document.querySelector('.main-navigation');
	var breaks       = [];

	/**
	 * Refreshes the list item from the menu depending on the menu size
	 */
	function updateNavigationMenu( container ) {

		// Adds the necessary UI to operate the menu.
		var visibleList  = container.parentNode.querySelector('.main-menu[id]');
		var hiddenList   = visibleList.parentNode.nextElementSibling.querySelector('.hidden-links');
		var toggleButton = visibleList.parentNode.nextElementSibling.querySelector('.main-menu-more-toggle');

		if ( isOverflowingNavivation( visibleList, toggleButton, container ) ) {

			// Record the width of the list
			breaks.push( visibleList.offsetWidth );
			// Move last item to the hidden list
			prependElement( hiddenList, ! visibleList.lastChild || null === visibleList.lastChild ? visibleList.previousElementSibling : visibleList.lastChild );
			// Show the toggle button
			showElement( toggleButton );

		} else {

			// There is space for another item in the nav
			if ( getAvailableSpace( toggleButton, container ) > breaks[breaks.length - 1] ) {
				// Move the item to the visible list
				visibleList.appendChild( hiddenList.firstChild.nextSibling );
				breaks.pop();
			}

			// Hide the dropdown btn if hidden list is empty
			if (breaks.length < 2) {
				hideElement( toggleButton );
				hideElement( hiddenList );
			}
		}

		// Recur if the visible list is still overflowing the nav
		if ( isOverflowingNavivation( visibleList, toggleButton, container ) ) {
			updateNavigationMenu( container );
		}
	}

	/**
	 * Run our priority+ function as soon as the document is `ready`
	 */
	document.addEventListener( 'DOMContentLoaded', function() {

		updateNavigationMenu( navContainer );

		// Also, run our priority+ function on selective refresh in the customizer
		var hasSelectiveRefresh = (
			'undefined' !== typeof wp &&
			wp.customize &&
			wp.customize.selectiveRefresh
		);

		if ( hasSelectiveRefresh ) {
			// Force a full refresh on partial content renders to re-run updateNavigationMenu()
			wp.customize.selectiveRefresh.bind('partial-content-rendered', function () {
				wp.customize.preview.send('refresh');
			});
        }
	});

	/**
	 * Run our priority+ function on load
	 */
	window.addEventListener('load', function() {
		updateNavigationMenu( navContainer );
	});

	/**
	 * Run our priority+ function every time the window resizes
	 */
	var isResizing = false;
	window.addEventListener( 'resize',
		debounce( function() {
			if ( isResizing ) {
				return;
			}

			isResizing = true;
			setTimeout( function() {
				updateNavigationMenu( navContainer );
				isResizing = false;
			}, 150 );
		} )
	);

	/**
	 * Run our priority+ function
	 */
	updateNavigationMenu( navContainer );

})();
