Mmenu.addons.navbars.searchfield = function( 
	this	: Mmenu,
	$navbar	: JQuery, 
	opts	: iLooseObject, 
	conf	: iLooseObject
) {
	if ( typeof this.opts.searchfield != 'object' )
	{
		this.opts.searchfield = {};
	}
	this.opts.searchfield.add = true;
	this.opts.searchfield.addTo = $navbar;
};