Mmenu.addons.counters=function(){var e=this.opts.counters;this.conf.counters;if("boolean"==typeof e&&(e={add:e,update:e}),"object"!=typeof e&&(e={}),e=this.opts.counters=jQuery.extend(!0,{},Mmenu.options.counters,e),this.bind("initListview:after",function(t){var n=this.conf.classNames.counters.counter;Mmenu.__refactorClass(t.find("."+n),n,"mm-counter")}),e.add&&this.bind("initListview:after",function(t){var n;switch(e.addTo){case"panels":n=t;break;default:n=t.filter(e.addTo)}n.each(function(){var t=jQuery(this).data("mm-parent");t&&(t.find(".mm-counter").length||t.children(".mm-btn").prepend(jQuery('<span class="mm-counter" />')))})}),e.update){function t(t){(t=t||this.node.$pnls.children(".mm-panel")).each(function(){var t=jQuery(this),n=t.data("mm-parent");if(n){var e=n.find(".mm-counter");e.length&&(t=t.children(".mm-listview")).length&&e.html(Mmenu.__filterListItems(t.children()).length)}})}this.bind("initListview:after",t),this.bind("updateListview",t)}},Mmenu.options.counters={add:!1,addTo:"panels",count:!1},Mmenu.configs.classNames.counters={counter:"Counter"};