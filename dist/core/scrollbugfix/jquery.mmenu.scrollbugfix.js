Mmenu.addons.scrollBugFix=function(){if(Mmenu.support.touch&&this.opts.offCanvas&&this.opts.offCanvas.blockUI){var o=this.opts.scrollBugFix;this.conf.scrollBugFix;"boolean"==typeof o&&(o={fix:o}),"object"!=typeof o&&(o={}),(o=this.opts.scrollBugFix=jQuery.extend(!0,{},Mmenu.options.scrollBugFix,o)).fix&&(this.bind("open:start",function(){this.node.$pnls.children(".mm-panel_opened").scrollTop(0)}),this.bind("initMenu:after",function(){var o=this;jQuery(document).off("touchmove.mm-scrollBugFix").on("touchmove.mm-scrollBugFix",function(o){jQuery("html").hasClass("mm-wrapper_opened")&&o.preventDefault()});var e=!1;jQuery("body").off("touchstart.mm-scrollBugFix").on("touchstart.mm-scrollBugFix",".mm-panels > .mm-panel",function(o){jQuery("html").hasClass("mm-wrapper_opened")&&(e||(e=!0,0===o.currentTarget.scrollTop?o.currentTarget.scrollTop=1:o.currentTarget.scrollHeight===o.currentTarget.scrollTop+o.currentTarget.offsetHeight&&(o.currentTarget.scrollTop-=1),e=!1))}).off("touchmove.mm-scrollBugFix").on("touchmove.mm-scrollBugFix",".mm-panels > .mm-panel",function(o){jQuery("html").hasClass("mm-wrapper_opened")&&jQuery(o.target)[0].scrollHeight>jQuery(o.target).innerHeight()&&o.stopPropagation()}),jQuery("window").off("orientationchange.mm-scrollBugFix").on("orientationchange.mm-scrollBugFix",function(){o.node.$pnls.children(".mm-panel_opened").scrollTop(0).css({"-webkit-overflow-scrolling":"auto"}).css({"-webkit-overflow-scrolling":"touch"})})}))}},Mmenu.options.scrollBugFix={fix:!0};