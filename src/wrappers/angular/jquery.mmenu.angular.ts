Mmenu.wrappers.angular = function(
	this : Mmenu
) {
	this.opts.onClick = {
		close			: true,
		preventDefault	: false,
		setSelected		: true
	};
};