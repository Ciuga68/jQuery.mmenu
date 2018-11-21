/*!
 * jQuery mmenu v8.0.0
 * @requires jQuery 1.7.0 or later
 *
 * mmenu.frebsite.nl
 *	
 * Copyright (c) Fred Heusschen
 * www.frebsite.nl
 *
 * License: CC-BY-NC-4.0
 * http://creativecommons.org/licenses/by-nc/4.0/
 */


/*
	jQuery plugin
*/
jQuery.fn[ 'mmenu' ] = function( opts, conf )
{
	var $result = jQuery();
	this.each(
		function()
		{
			var $menu = jQuery(this);
			if ( $menu.data( 'mmenu' ) )
			{
				return;
			}

			//	Create the menu
			var _menu = new Mmenu( $menu, opts, conf );

			//	Store the API
			_menu.node.$menu.data( 'mmenu', _menu.API );

			$result = $result.add( _menu.node.$menu );
		}
	);

	return $result;
};


/*
	Class
*/
class Mmenu {

	//	Plugin version
	static version : string = '8.0.0'

	//	Default options for the plugin
	static options : iLooseObject = {
		hooks 				: {},
		extensions			: [],
		wrappers			: [],
		navbar 				: {
			add 				: true,
			title				: 'Menu',
			titleLink			: 'parent'
		},
		onClick				: {
			close				: null,
			preventDefault		: null,
			setSelected			: true
		},
		slidingSubmenus		: true
	}

	//	Default configuration for the plugin
	static configs : iLooseObject = {
		classNames			: {
			divider				: 'Divider',
			inset 				: 'Inset',
			nolistview 			: 'NoListview',
			nopanel				: 'NoPanel',
			panel				: 'Panel',
			selected			: 'Selected',
			spacer				: 'Spacer',
			vertical			: 'Vertical'
		},
		clone				: false,
		language			: null,
		openingInterval		: 25,
		panelNodetype		: 'ul, ol, div',
		transitionDuration	: 400
	}

	//	Add-ons and wrappers
	static addons  	: iLooseObject	= {}
	static wrappers : iLooseObject	= {}

	//	Storage object for nodes
	static node 	: iLooseObject = {}

	//	Supported features
	static support 	: iLooseObject = {
		touch: 'ontouchstart' in window || navigator.msMaxTouchPoints || false,
	}

	//	Options and configuration
	opts 	: iLooseObject
	conf 	: iLooseObject

	//	Array of methods to expose in the API
	_api	: string[]

	//	Storage objects / arrays for nodes, variables, click handlers, callbacks and matchmedia calls
	node 	: iLooseObject
	vars	: iLooseObject
	hook	: iLooseObject
	mtch	: iLooseObject
	clck	: Function[]


	//	offCanvas add-on
	open 					: Function
	_openSetup 				: Function
	_openFinish 			: Function
	close 					: Function
	closeAllOthers 			: Function
	setPage 				: Function
	_initBlocker 			: Function
	_initWindow_offCanvas 	: Function


	//	TODO: what of the below can be replaced with local functions?

	//	screenReader add-on
	static sr_aria	: Function
	static sr_role	: Function
	static sr_text	: Function


	//	scrollBugFix add-on
	_initWindow_scrollBugFix	: Function


	//	keyboardNavigation add-on
	_initWindow_keyboardNavigation	: Function


	//	searchfield add-on
	search				: Function
	_initSearchPanel	: Function
	_initNoResultsMsg	: Function
	_initSearchfield	: Function
	_initSearching		: Function



	/**
	  * Initialize the plugin.
	  *
	  * @param {JQuery|String} 	$menu						Menu node.
	  * @param {object} 		[options=Mmenu.options]		Options for the menu.
	  * @param {object} 		[configs=Mmenu.configs]		Configuration options for the menu.
	  */
	constructor(
		$menu 		 : JQuery | String,
		options 	?: iLooseObject,
		configs		?: iLooseObject
	) {

		//	Get menu node from string
		if ( typeof $menu == 'string' )
		{
			$menu = jQuery( $menu );
		}

		//	Store menu node
		this.node 	= {
			$menu : $menu
		};

		//	Extend options and configuration from defaults
		this.opts 	= jQuery.extend( true, {}, Mmenu.options, options );
		this.conf 	= jQuery.extend( true, {}, Mmenu.configs, configs );

		this._api	= [ 'bind', 'initPanels', 'openPanel', 'closePanel', 'closeAllPanels', 'setSelected' ];

		this.vars	= {};
		this.hook 	= {};
		this.mtch 	= {};
		this.clck 	= [];

		// if ( typeof this.___deprecated == 'function' )
		// {
		// 	this.___deprecated();
		// }

		this._initWrappers();
		this._initAddons();
		this._initExtensions();
		this._initHooks();

		this._initMenu();
		this._initPanels();
		this._initOpened();
		this._initAnchors();
		this._initMatchMedia();

		// if ( typeof this.___debug == 'function' )
		// {
		// 	this.___debug();
		// }

		return this;
	}


	/**
	  * Get the API.
	  *
	  * @return {object} The API.
	  */
	get API()
	{
		var that = this,
			api = {};

		jQuery.each( this._api, 
			function( i )
			{
				let fn = this;
				api[ fn ] = function()
				{
					var re = that[ fn ].apply( that, arguments );
					return ( typeof re == 'undefined' ) ? api : re;
				};
			}
		);
		return api;
	}


	/**
	  * Open a panel.
	  *
	  * @param {JQuery}		$panel				Panel to open.
	  * @param {boolean}	[animation=true]	Whether or not to use an animation.
	  */
	openPanel( 
		$panel 		 : JQuery,
		animation	?: boolean
	) {
		this.trigger( 'openPanel:before', [ $panel ] );

		if ( !$panel || !$panel.length )
		{
			return;
		}
		if ( !$panel.hasClass( 'mm-panel' ) )
		{
			$panel = $panel.closest( '.mm-panel' );
		}
		if ( !$panel.hasClass( 'mm-panel' ) )
		{
			return;
		}


		if ( typeof animation != 'boolean' )
		{
			animation = true;
		}


		//	Open a "vertical" panel
		if ( $panel.parent( '.mm-listitem_vertical' ).length )
		{

			//	Open current and all vertical parent panels
			$panel
				.parents( '.mm-listitem_vertical' )
				.addClass( 'mm-listitem_opened' )
				.children( '.mm-panel' )
				.removeClass( 'mm-hidden' );

			//	Open first non-vertical parent panel
			this.openPanel( 
				$panel
					.parents( '.mm-panel' )
					.not(
						function()
						{
							return jQuery(this).parent( '.mm-listitem_vertical' ).length ? true : false
						}
					)
					.first()
			);

			this.trigger( 'openPanel:start' , [ $panel ] );
			this.trigger( 'openPanel:finish', [ $panel ] );
		}

		//	Open a "horizontal" panel
		else
		{
			if ( $panel.hasClass( 'mm-panel_opened' ) )
			{
				return;
			}

			var $panels 	= this.node.$pnls.children( '.mm-panel' ),
				$current 	= this.node.$pnls.children( '.mm-panel_opened' );


			//	Close all child panels
			$panels
				.not( $panel )
				.removeClass( 'mm-panel_opened-parent' );

			//	Open all parent panels
			var $parent = $panel.data( 'mm-parent' );
			while( $parent )
			{
				$parent = $parent.closest( '.mm-panel' );
				if ( !$parent.parent( '.mm-listitem_vertical' ).length )
				{
					$parent.addClass( 'mm-panel_opened-parent' );
				}
				$parent = $parent.data( 'mm-parent' );
			}

			//	Add classes for animation
			$panels
				.removeClass( 'mm-panel_highest' )
				.not( $current )
				.not( $panel )
				.addClass( 'mm-hidden' );

			$panel
				.removeClass( 'mm-hidden' );

			//	Start opening the panel
			var openPanelStart = () => {
				$current.removeClass( 'mm-panel_opened' );
				$panel.addClass( 'mm-panel_opened' );

				if ( $panel.hasClass( 'mm-panel_opened-parent' ) )
				{
					$current.addClass( 'mm-panel_highest' );
					$panel.removeClass( 'mm-panel_opened-parent' );
				}
				else
				{
					$current.addClass( 'mm-.panel_opened-parent' );
					$panel.addClass( 'mm-panel_highest' );
				}

				this.trigger( 'openPanel:start', [ $panel ] );
			};

			//	Finish opening the panel
			var openPanelFinish = () => {
				$current.removeClass( 'mm-panel_highest' ).addClass( 'mm-hidden' );
				$panel.removeClass( 'mm-panel_highest' );

				this.trigger( 'openPanel:finish', [ $panel ] );
			}

			if ( animation && !$panel.hasClass( 'mm-panel_noanimation' ) )
			{
				//	Without the timeout the animation will not work because the element had display: none;
				//	RequestAnimationFrame would be nice here.
				setTimeout(
					() => {
						//	Callback
						Mmenu.transitionend( $panel,
							() => {
								openPanelFinish();
							}, this.conf[ 'transitionDuration' ]
						);

						openPanelStart();

					}, this.conf[ 'openingInterval' ]
				);
			}
			else
			{
				openPanelStart();
				openPanelFinish();
			}
		}

		this.trigger( 'openPanel:after', [ $panel ] );
	}


	/**
	  * Close a panel.
	  *
	  * @param {JQuery} $panel Panel to close.
	  */
	closePanel( 
		$panel : JQuery
	) {
		this.trigger( 'closePanel:before', [ $panel ] );

		var $li = $panel.parent();

		//	Only works for "vertical" panels
		if ( $li.hasClass( 'mm-listitem_vertical' ) )
		{
			$li.removeClass( 'mm-listitem_opened' );
			$panel.addClass( 'mm-hidden' );

			this.trigger( 'closePanel', [ $panel ] );
		}

		this.trigger( 'closePanel:after', [ $panel ] );
	}


	/**
	  * Close all opened panels.
	  *
	  * @param {JQuery} [$panel] Panel to open after closing all other panels.
	  */
	closeAllPanels( 
		$panel ?: JQuery
	) {
		this.trigger( 'closeAllPanels:before' );

		//	Close all "vertical" panels
		this.node.$pnls
			.find( '.mm-listview' )
			.children()
			.removeClass( 'mm-listitem_selected' )
			.filter( '.mm-listitem_vertical' )
			.removeClass( 'mm-listitem_opened' );

		//	Close all "horizontal" panels
		var $pnls = this.node.$pnls.children( '.mm-panel' ),
			$frst = ( $panel && $panel.length ) ? $panel : $pnls.first();

		this.node.$pnls
			.children( '.mm-panel' )
			.not( $frst )
			.removeClass( 'mm-panel_opened' )
			.removeClass( 'mm-panel_opened-parent' )
			.removeClass( 'mm-panel_highest' )
			.addClass( 'mm-hidden' );

		//	Open first panel
		this.openPanel( $frst, false );

		this.trigger( 'closeAllPanels:after' );
	}


	/**
	  * Toggle a panel opened/closed.
	  *
	  * @param {JQuery} $panel Panel to open or close.
	  */
	togglePanel(
		$panel : JQuery
	) {
		var $li = $panel.parent();

		//	Only works for "vertical" panels
		if ( $li.hasClass( 'mm-listitem_vertical' ) )
		{
			this[ $li.hasClass( 'mm-listitem_opened' ) ? 'closePanel' : 'openPanel' ]( $panel );
		}
	}


	/**
	  * Mark a listitem as being "selected".
	  *
	  * @param {JQuery} $listitem Listitem to mark.
	  */
	setSelected(
		$listitem : JQuery
	) {
		this.trigger( 'setSelected:before', [ $listitem ] );

		this.node.$menu
			.find( '.mm-listitem_selected' )
			.removeClass( 'mm-listitem_selected' );

		$listitem.addClass( 'mm-listitem_selected' );

		this.trigger( 'setSelected:after', [ $listitem ] );
	}


	/**
	  * Bind a function to a hook.
	  *
	  * @param {string} 	hook The hook.
	  * @param {function} 	func The function.
	  */
	bind( 
		hook : string,
		func : Function
	) {
		this.hook[ hook ] = this.hook[ hook ] || [];
		this.hook[ hook ].push( func );
	}


	/**
	  * Invoke the functions bound to a hook.
	  *
	  * @param {string} hook  	The hook.
	  * @param {array}	[args] 	Arguments for the function.
	  */
	trigger(
		hook  : string,
		args ?: any[]
	) {
		if ( this.hook[ hook ] )
		{
			for ( var h = 0, l = this.hook[ hook ].length; h < l; h++ )
            {
                this.hook[ hook ][ h ].apply( this, args );
            }
		}
	}


	/**
	  * Bind functions to the match-media listener.
	  *
	  * @param {string} 	mediaquery 	Media query to match.
	  * @param {function} 	yes 		Function to invoke when the media query matches.
	  * @param {function} 	no 			Function to invoke when the media query doesn't match.
	  */
	matchMedia( 
		mediaquery	 : string,
		yes			?: Function,
		no			?: Function
	) {
		this.mtch[ mediaquery ] = this.mtch[ mediaquery ] || [];
		this.mtch[ mediaquery ].push({
			'yes': yes,
			'no' : no
		});
	}


	/**
	  * Initialize the match-media listener.
	  */
	_initMatchMedia()
	{
		for ( var mediaquery in this.mtch )
		{
			(() => {
				var mqstring = mediaquery,
					mqlist   = window.matchMedia( mqstring );

				this._fireMatchMedia( mqstring, mqlist );
				mqlist.addListener(
					( mqlist ) => {
						this._fireMatchMedia( mqstring, mqlist );
					}
				);
			})();
		}
	}


	/**
	  * Fire the "yes" or "no" function for a media query.
	  *
	  * @param {string} 			mqstring 	Media query to check for.
	  * @param {MediaQueryList} 	mqlist 		Media query list to check with.
	  */
	_fireMatchMedia(
		mqstring : string,
		mqlist	 : any // Typescript "Cannot find name 'MediaQueryListEvent'."
	) {
		var fn = mqlist.matches ? 'yes' : 'no';
		for ( var i = 0; i < this.mtch[ mqstring ].length; i++ )
		{
			this.mtch[ mqstring ][ i ][ fn ].call( this );
		}
	}


	/**
	  * Bind the hooks specified in the options.
	  */
	_initHooks()
	{
		for ( var hook in this.opts[ 'hooks' ] )
		{
			this.bind( hook, this.opts[ 'hooks' ][ hook ] );
		}
	}


	/**
	  * Initialize the wrappers specified in the options.
	  */
	_initWrappers()
	{
		this.trigger( 'initWrappers:before' );

		for ( var w = 0; w < this.opts[ 'wrappers' ].length; w++ )
		{
			var wrapper = Mmenu.wrappers[ this.opts[ 'wrappers' ][ w ] ];
			if ( typeof wrapper == 'function' )
			{
				wrapper.call( this );
			}
		}

		this.trigger( 'initWrappers:after' );
	}


	/**
	  * Initialize all available add-ons.
	  */
	_initAddons()
	{
		this.trigger( 'initAddons:before' );

		for ( var a in Mmenu.addons )
		{
			// Mmenu.addons[ a ].setup.call( this, this );
			Mmenu.addons[ a ].call( this, this );
		}

		this.trigger( 'initAddons:after' );
	}


	/**
	  * Initialize the extensions specified in the options.
	  */
	_initExtensions()
	{
		this.trigger( 'initExtensions:before' );

		//	Convert array to object with array
		if ( this.opts[ 'extensions' ].constructor === Array )
		{
			this.opts[ 'extensions' ] = {
				'all': this.opts[ 'extensions' ]
			};
		}

		//	Loop over object
		for ( var mediaquery in this.opts[ 'extensions' ] )
		{
			// this.opts[ 'extensions' ][ mediaquery ] = this.opts[ 'extensions' ][ mediaquery ].length ? _c.menu + '_' + this.opts[ 'extensions' ][ mediaquery ].join( ' ' + _c.menu + '_' ) : '';
			if ( this.opts[ 'extensions' ][ mediaquery ] )
			{
				(( mediaquery ) => {
					this.matchMedia( mediaquery,
						function()
						{
							this.node.$menu.addClass( this.opts.extensions[ mediaquery ] );
						},
						function()
						{
							this.node.$menu.removeClass( this.opts.extensions[ mediaquery ] );
						}
					);
				})( mediaquery );
			}
		}
		this.trigger( 'initExtensions:after' );
	}


	/**
	  * Initialize the menu.
	  */
	_initMenu()
	{
		this.trigger( 'initMenu:before' );

		//	Clone if needed
		if ( this.conf.clone )
		{
			this.node.$orig = this.node.$menu;
			this.node.$menu = this.node.$orig.clone();
			this.node.$menu
				.filter( '[id]' )
				.add( this.node.$menu.find( '[id]' ) )
				.each(
					function()
					{
						jQuery(this).attr( 'id', 'mm-' + jQuery(this).attr( 'id' ) );
					}
				);
		}

		//	Add ID
		this.node.$menu.attr( 'id', this.node.$menu.attr( 'id' ) || Mmenu.__getUniqueId() );

		//	Add markup
		this.node.$pnls = jQuery( '<div class="mm-panels" />' )
			.append( this.node.$menu.children( this.conf.panelNodetype ) )
			.prependTo( this.node.$menu );

		//	Add classes
		this.node.$menu
			.addClass( 'mm-menu' )
			.parent()
			.addClass( 'mm-wrapper' );

		this.trigger( 'initMenu:after' );
	}


	/**
	  * Initialize panels.
	  *
	  * @param {JQuery} [$panels] Panels to initialize.
	  */
	_initPanels(
		$panels ?: JQuery
	) {

		//	Open / close panels
		this.clck.push(
			function(
				this : Mmenu,
				$a	 : JQuery,
				args : iLooseObject
			) {
				if ( args.inMenu )
				{
					var href = $a.attr( 'href' )
					if ( href.length > 1 && href.slice( 0, 1 ) == '#' )
					{
						try
						{
							var $panel = this.node.$menu.find( href );
							if ( $panel.is( '.mm-panel' ) )
							{
								this[ $a.parent().hasClass( 'mm-listitem_vertical' ) ? 'togglePanel' : 'openPanel' ]( $panel );
								return true;
							}
						}
						catch( err ) {}
					}
				}
			}
		);

		//	Actually initialise the panels
		this.initPanels( $panels );
	}


	/**
	  * Initialize panels.
	  *
	  * @param {JQuery} [$panels] The panels to initialize.
	  */
	initPanels( 
		$panels ?: JQuery
	) {
		this.trigger( 'initPanels:before', [ $panels ] );

		$panels = $panels || this.node.$pnls.children( this.conf.panelNodetype );

		var $newpanels = jQuery();

		var that = this;
		var init = ( $panels ) => {
			$panels
				.filter( this.conf[ 'panelNodetype' ] )
				.each(
					function( x )
					{

						var $panel = that._initPanel( jQuery(this) );
						if ( $panel )
						{

							that._initNavbar( $panel );
							that._initListview( $panel );

							$newpanels = $newpanels.add( $panel );

							//	init child panels
							var $child = $panel
								.children( '.mm-listview' )
								.children( 'li' )
								.children( that.conf[ 'panelNodetype' ] )
								.add( $panel.children( '.' + that.conf[ 'classNames' ].panel ) );

							if ( $child.length )
							{
								init( $child );
							}
						}
					}
				);
		};

		init( $panels );

		this.trigger( 'initPanels:after', [ $newpanels ] );
	}


	/**
	  * Initialize a single panel.
	  *
	  * @param  {JQuery} $panel 	Panel to initialize.
	  * @return {JQuery} 			Initialized panel.
	  */
	_initPanel(
		$panel : JQuery
	) {
		this.trigger( 'initPanel:before', [ $panel ] );

		//	Stop if already a panel
		if ( $panel.hasClass( 'mm-panel' ) )
		{
			return $panel;
		}

		//	Refactor panel classnames
		Mmenu.refactorClass( $panel, this.conf.classNames.panel 	, 'mm-panel' 			);
		Mmenu.refactorClass( $panel, this.conf.classNames.nopanel , 'mm-nopanel' 			);
		Mmenu.refactorClass( $panel, this.conf.classNames.inset 	, 'mm-listview_inset'	);

		$panel.filter( '.mm-listview_inset' )
			.addClass( 'mm-nopanel' );


		//	Stop if not supposed to be a panel
		if ( $panel.hasClass( 'mm-nopanel' ) )
		{
			return false;
		}


		//	Wrap UL/OL in DIV
		var vertical = ( $panel.hasClass( this.conf.classNames.vertical ) || !this.opts[ 'slidingSubmenus' ] );
		$panel.removeClass( this.conf.classNames.vertical );

		var id = $panel.attr( 'id' ) || Mmenu.__getUniqueId();

		if ( $panel.is( 'ul, ol' ) )
		{
			$panel.removeAttr( 'id' );

			$panel.wrap( '<div />' );
			$panel = $panel.parent();
		}

		$panel.attr( 'id', id );
		$panel.addClass( 'mm-panel mm-hidden' );

		var $parent = $panel.parent( 'li' );

		if ( vertical )
		{
			$parent.addClass( 'mm-listitem_vertical' );
		}
		else
		{
			$panel.appendTo( this.node.$pnls );
		}

		//	Store parent/child relation
		if ( $parent.length )
		{
			$parent.data( 'mm-child', $panel );
			$panel.data( 'mm-parent', $parent );
		}

		this.trigger( 'initPanel:after', [ $panel ] );

		return $panel;
	}


	/**
	  * Initialize a navbar.
	  *
	  * @param {JQuery} $panel Panel for the navbar.
	  */
	_initNavbar(
		$panel : JQuery
	) {
		this.trigger( 'initNavbar:before', [ $panel ] );

		if ( $panel.children( '.mm-navbar' ).length )
		{
			return;
		}

		var $parent = $panel.data( 'mm-parent' ),
			$navbar = jQuery( '<div class="mm-navbar" />' );

		var title: string = this.__getPanelTitle( $panel, this.opts[ 'navbar' ].title ),
			href : string = '';

		if ( $parent && $parent.length )
		{
			if ( $parent.hasClass( 'mm-listitem_vertical' ) )
			{
				return;
			}

			//	Listview, the panel wrapping this panel
			if ( $parent.parent().hasClass( 'mm-listview' ) )
			{
				var $a = $parent
					.children( 'a, span' )
					.not( '.mm-btn_next' );
			}

			//	Non-listview, the first anchor in the parent panel that links to this panel
			else
			{
				var $a = $parent
					.closest( '.mm-panel' )
					.find( 'a[href="#' + $panel.attr( 'id' ) + '"]' );
			}

			$a = $a.first();
			$parent = $a.closest( '.mm-panel' );

			var id = $parent.attr( 'id' );
			title = this.__getPanelTitle( $panel, jQuery('<span>' + $a.text() + '</span>').text() );

			switch ( this.opts[ 'navbar' ].titleLink )
			{
				case 'anchor':
					href = $a.attr( 'href' );
					break;

				case 'parent':
					href = '#' + id;
					break;
			}

			$navbar.append( '<a class="mm-btn mm-btn_prev mm-navbar__btn" href="#' + id + '" />' );
		}
		else if ( !this.opts[ 'navbar' ].title )
		{
			return;
		}

		if ( this.opts[ 'navbar' ].add )
		{
			$panel.addClass( 'mm-panel_has-navbar' );
		}

		$navbar.append( '<a class="mm-navbar__title"' + ( href.length ? ' href="' + href + '"' : '' ) + '>' + title + '</a>' )
			.prependTo( $panel );

		this.trigger( 'initNavbar:after', [ $panel ] );
	}


	/**
	  * Initialize a listview.
	  *
	  * @param {JQuery} $panel Panel for the listview(s).
	  */
	_initListview(
		$panel : JQuery
	) {
		this.trigger( 'initListview:before', [ $panel ] );

		//	Refactor listviews classnames
		var $ul = Mmenu.childAddBack( $panel, 'ul, ol' );

		Mmenu.refactorClass( $ul, this.conf.classNames.nolistview, 'mm-nolistview' );


		//	Refactor listitems classnames
		var $li = $ul
			.not( '.mm-nolistview' )
			.addClass( 'mm-listview' )
			.children()
			.addClass( 'mm-listitem' );

		Mmenu.refactorClass( $li, this.conf.classNames.selected , 'mm-listitem_selected' 	);
		Mmenu.refactorClass( $li, this.conf.classNames.divider 	, 'mm-listitem_divider'		);
		Mmenu.refactorClass( $li, this.conf.classNames.spacer 	, 'mm-listitem_spacer'		);

		$li.children( 'a, span' )
			.not( '.mm-btn' )
			.addClass( 'mm-listitem__text' );

		//	Add open link to parent listitem
		var $parent = $panel.data( 'mm-parent' );
		if ( $parent && $parent.hasClass( 'mm-listitem' ) )
		{
			if ( !$parent.children( '.mm-btn' ).length )
			{
				var $a = $parent.children( 'a, span' ).first(),
					$b = jQuery( '<a class="mm-btn mm-btn_next mm-listitem__btn" href="#' + $panel.attr( 'id' ) + '" />' );

				$b.insertAfter( $a );
				if ( $a.is( 'span' ) )
				{
					$b.addClass( 'mm-listitem__text' ).html( $a.html() );
					$a.remove();
				}
			}
		}

		this.trigger( 'initListview:after', [ $panel ] );
	}


	/**
	  * Find and open the correct panel after creating the menu.
	  */
	_initOpened()
	{
		this.trigger( 'initOpened:before' );

		//	Find the selected listitem
		var $selected = this.node.$pnls
			.find( '.mm-listitem_selected' )
			.removeClass( 'mm-listitem_selected' )
			.last()
			.addClass( 'mm-listitem_selected' );

		//	Find the current opened panel
		var $current = ( $selected.length ) 
			? $selected.closest( '.mm-panel' )
			: this.node.$pnls.children( '.mm-panel' ).first();

		//	Open the current opened panel
		this.openPanel( $current, false );

		this.trigger( 'initOpened:after' );
	}


	/**
	  * Initialize anchors in / for the menu.
	  */
	_initAnchors()
	{
		this.trigger( 'initAnchors:before' );

		var that = this;


		//	Bind to clicking on the <body>
		jQuery('body')
			.on( 'click.mm',
				'a[href]',
				function( e )
				{
					var $t = jQuery(this),
						_h = $t.attr( 'href' );

					var args = {
						inMenu 		: that.node.$menu.find( $t ).length, 
						inListview 	: $t.is( '.mm-listitem > a' ),
						toExternal 	: $t.is( '[rel="external"]' ) || $t.is( '[target="_blank"]' )
					};

					var onClick = {
						close 			: null,
						setSelected 	: null,
						preventDefault	: _h.slice( 0, 1 ) == '#'
					};

					//	Find behavior for addons
					//for ( var a in Mmenu.addons )
					for ( var c = 0; c < that.clck.length; c++ )
					{
						var click = that.clck[ c ].call( that, $t, args );
						if ( click )
						{
							if ( typeof click == 'boolean' )
							{
								e.preventDefault();
								return;
							}
							if ( typeof click == 'object' )
							{
								onClick = jQuery.extend( {}, onClick, click );
							}
						}
					}


					//	All other anchors in lists
					if ( args.inMenu && args.inListview && !args.toExternal )
					{

						//	Set selected item, Default: true
						if ( Mmenu.__valueOrFn( $t, that.opts.onClick.setSelected, onClick.setSelected ) )
						{
							that.setSelected( jQuery( e.target ).parent() );
						}

						//	Prevent default / don't follow link. Default: false
						if ( Mmenu.__valueOrFn( $t, that.opts.onClick.preventDefault, onClick.preventDefault ) )
						{
							e.preventDefault();
						}

						//	Close menu. Default: false
						//		TODO: option + code should be in offcanvas add-on
						if ( Mmenu.__valueOrFn( $t, that.opts.onClick.close, onClick.close ) )
						{
							if ( that.opts.offCanvas && typeof that.close == 'function' )
							{
								that.close();
							}
						}
					}

				}
			);

		this.trigger( 'initAnchors:after' );
	}


	/**
	  * Get the translation for a text.
	  *
	  * @param  {string} text 	Text to translate.
	  * @return {string}		The translated text.
	  */
	i18n(
		text : string
	) {
		return Mmenu.i18n( text, this.conf.language );
	}


	/**
	  * Add or get a translated text.
	  *
	  * @param  {string|object} 	[text] 		The translated text to add or get.
	  * @param  {string} 			[language] 	The language for the translated text.
	  * @return {string|object}					The translated text.
	  */
	static i18n : Function = (function() {

		var translations = {};

		return function( 
			text		?: any, // Actually a string or object, but Typescript does not understand the typeof condition :/
			language	?: string
		) {
			switch( typeof text )
			{
				case 'object':
					if ( typeof language == 'string' )
					{
						if ( typeof translations[ language ] == 'undefined' )
						{
							translations[ language ] = {};
						}
						jQuery.extend( translations[ language ], text );
					}
					return translations;

				case 'string':
					if ( typeof language == 'string' &&
						typeof translations[ language ] != 'undefined'
					) {
						return translations[ language ][ text ] || text;
					}
					return text;

				case 'undefined':
				default:
					return translations;
			}
		};
	})();


	/**
	  * Get the original menu ID (in case it was changed after cloning).
	  *
	  * @return {string} The original ID.
	  */
	_getOriginalMenuId()
	{
		var id = this.node.$menu.attr( 'id' );
		if ( this.conf.clone && id && id.length )
		{
			id = id.substr( 3 );
		}
		return id;
	}


	/**
	  * Find the title for a panel.
	  *
	  * @param {JQuery} $panel 		Panel to search in.
	  * @param {string} [dfault] 	Fallback/default title.
	  */
	__getPanelTitle( 
		$panel  : JQuery, 
		dfault ?: string
	) {
		var title: string;

		//	Function
		if ( typeof this.opts[ 'navbar' ].title == 'function' )
		{
			title = this.opts[ 'navbar' ].title.call( $panel[ 0 ] );
		}

		//	Data attr
		if ( typeof title == 'undefined' )
		{
			title = $panel.data( 'mm-title' );
		}

		if ( typeof title != 'undefined' )
		{
			return title;
		}

		//	Fallback
		if ( typeof dfault == 'string' )
		{
			return this.i18n( dfault );
		}

		//	Default
		return this.i18n( Mmenu.options[ 'navbar' ].title );
	}


	/**
	  * Find the value from an option or function.
	  *
	  * @param {JQuery} 	$elem 		Scope for the function.
	  * @param {any} 		[option] 	Value or function.
	  * @param {any} 		[dfault] 	Fallback/default value.
	  */
	static __valueOrFn( 
		$elem	 : JQuery,
		option	?: any,
		dfault 	?: any
	) {
		if ( typeof option == 'function' )
		{
			var value = option.call( $elem[ 0 ] );
			if ( typeof value != 'undefined' )
			{
				return value;
			}
		}
		if ( ( typeof option == 'function' || typeof option == 'undefined' ) && typeof dfault != 'undefined' )
		{
			return dfault;
		}
		return option;
	}


	/**
	  * Refactor a classname on multiple elements.
	  *
	  * @param {JQuery} $elements 	Elements to refactor.
	  * @param {string}	oldClass 	Classname to remove.
	  * @param {string}	newClass 	Classname to add.
	  */
	static refactorClass( 
		$elements 	: JQuery,
		oldClass	: string,
		newClass	: string
	) {
		return $elements.filter( '.' + oldClass ).removeClass( oldClass ).addClass( newClass );
	}


	/**
	  * Find and filter child nodes including the node itself.
	  *
	  * @param  {JQuery} 	$elements 	Elements to refactor.
	  * @param  {string}	selector 	Selector to filter the elements against.
	  * @return {JQuery}				The expanded and filtered set of nodes.
	  */
	static findAddBack( 
		$element : JQuery,
		selector : string
	) {
		return $element.find( selector ).add( $element.filter( selector ) );
	}


	/**
	  * Find and filter direct child nodes including the node itself.
	  *
	  * @param  {JQuery} 	$elements 	Elements to refactor.
	  * @param  {string}	selector 	Selector to filter the elements against.
	  * @return {JQuery}				The expanded and filtered set of nodes.
	  */
	static childAddBack( 
		$element : JQuery,
		selector : string
	) {
		return $element.children( selector ).add( $element.filter( selector ) );
	}


	/**
	  * Filter out non-listitem listitems.
	  *
	  * @param  {JQuery} 	$listitems 	Elements to filter.
	  * @return {JQuery}				The filtered set of listitems.
	  */
	static filterListItems(
		$listitems : JQuery
	) {
		return $listitems
			.not( '.mm-listitem_divider' )
			.not( '.mm-hidden' );
	}


	/**
	  * Find anchors in listitems.
	  *
	  * @param  {JQuery} 	$listitems 	Elements to filter.
	  * @return {JQuery}				The filtered set of listitems.
	  */
	static filterListItemAnchors(
		$listitems : JQuery
	) {
		return Mmenu.filterListItems( $listitems )
			.children( 'a' )
			.not( '.mm-btn_next' );
	}


	/**
	  * Set and invoke a (single) transition-end function with fallback.
	  *		Should be replaced as supported browsers all support object.addEventListener("transitionend", myScript);
	  *
	  * @param {JQuery} 	$element 	Scope for the function.
	  * @param {function}	func		Function to invoke.
	  * @param {number}		duration	The duration of the animation (for the fallback).
	  */
	static transitionend( 
		$element 	: JQuery, 
		func 		: Function,
		duration	: number
	) {
		var guid = Mmenu.__getUniqueId();

		var _ended = false,
			_fn = function( e )
			{
				if ( typeof e !== 'undefined' )
				{
					if ( e.target != $element[ 0 ] )
					{
						return;
					}
				}

				if ( !_ended )
				{
					$element.off( 	    'transitionend.' + guid );
					$element.off( 'webkitTransitionEnd.' + guid );
					func.call( $element[ 0 ] );
				}
				_ended = true;
			};

		$element.on( 	   'transitionend.' + guid, _fn );
		$element.on( 'webkitTransitionEnd.' + guid, _fn );
		setTimeout( _fn, duration * 1.1 );
	}


	/**
	  * Get an unique ID.
	  *
	  * @return {string} An unique ID.
	  */
	static __getUniqueId()
	{
		return 'mm-guid-' + Mmenu.uniqueId++;
	}
	static uniqueId	: number = 0
}
