Mmenu.addons.autoHeight=function(){var h=this.opts.autoHeight;this.conf.autoHeight;function t(t){if(!this.opts.offCanvas||this.vars.opened){var e=Math.max(parseInt(this.node.$pnls.css("top"),10),0)||0,i=Math.max(parseInt(this.node.$pnls.css("bottom"),10),0)||0,n=0;this.node.$menu.addClass("mm-menu_autoheight-measuring"),"auto"==h.height?((t=t||this.node.$pnls.children(".mm-panel_opened")).parent(".mm-listitem_vertical").length&&(t=t.parents(".mm-panel").not(function(){return!!jQuery(this).parent(".mm-listitem_vertical").length})),t.length||(t=this.node.$pnls.children(".mm-panel")),n=t.first().outerHeight()):"highest"==h.height&&this.node.$pnls.children(".mm-panel").each(function(){var t=jQuery(this);t.parent(".mm-listitem_vertical").length&&(t=t.parents(".mm-panel").not(function(){return!!jQuery(this).parent(".mm-listitem_vertical").length})),n=Math.max(n,t.first().outerHeight())}),this.node.$menu.height(n+e+i).removeClass("mm-menu_autoheight-measuring")}}"boolean"==typeof h&&h&&(h={height:"auto"}),"string"==typeof h&&(h={height:h}),"object"!=typeof h&&(h={}),"auto"!=(h=this.opts.autoHeight=jQuery.extend(!0,{},Mmenu.options.autoHeight,h)).height&&"highest"!=h.height||(this.bind("initMenu:after",function(){this.node.$menu.addClass("mm-menu_autoheight")}),this.opts.offCanvas&&this.bind("open:start",t),"highest"==h.height&&this.bind("initPanels:after",t),"auto"==h.height&&(this.bind("updateListview",t),this.bind("openPanel:start",t),this.bind("closePanel",t)))},Mmenu.options.autoHeight={height:"default"};