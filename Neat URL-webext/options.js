const PREFS = {
	"neat_url_blocked_params": {
		"type": "value",
		"default": "utm_source, utm_medium, utm_term, utm_content, utm_campaign, utm_reader, utm_place, utm_userid, utm_cid, utm_name, utm_pubreferrer, utm_swu, utm_viz_id, ga_source, ga_medium, ga_term, ga_content, ga_campaign, ga_place, yclid, _openstat, fb_action_ids, fb_action_types, fb_ref, fb_source, action_object_map, action_type_map, action_ref_map, gs_l, pd_rd_r@amazon.*, pd_rd_w@amazon.*, pd_rd_wg@amazon.*, _encoding@amazon.*, psc@amazon.*, ved@google.*, ei@google.*, sei@google.*, gws_rd@google.*, cvid@bing.com, form@bing.com, sk@bing.com, sp@bing.com, sc@bing.com, qs@bing.com, pq@bing.com, feature@youtube.com, gclid@youtube.com, kw@youtube.com, $/ref@amazon.*, _hsenc, mkt_tok, hmb_campaign, hmb_medium, hmb_source"
	},
	"neat_url_icon_animation": {
		"type": "value",
		"default": "missing_underscore"
	},
	"neat_url_icon_theme": {
		"type": "value",
		"default": "dark"
	},
	"neat_url_show_counter": {
		"type": "checked",
		"default": true
	},
	"neat_url_counter_color": {
		"type": "value",
		"default": "#eeeeee"
	},
	"neat_url_logging": {
		"type": "checked",
		"default": false
	},
	"neat_url_blacklist": {
		"type": "value",
		"default": ""
	},
	"neat_url_types": {
		"type": "value",
		"default": "main_frame"
	},
	"neat_url_version": {
		"type": "value",
		"default": ""
	},
	"neat_url_hidden_params": {
		"type": "value",
		"default": ""
	}
};
var lastWidth = 0;

function getClean(text){
	let clean = text.split(",");
	for(let i = 0; i < clean.length; i++){
		clean[i] = clean[i].trim();
	}
	return clean;
}

function saveOptions() {
	// Get default values
	let defaultParams = getClean(PREFS["neat_url_blocked_params"]["default"]);
	let currentParams = getClean(document.getElementById("neat_url_blocked_params")["value"]);
	let hiddenParams = getClean(document.getElementById("neat_url_hidden_params")["value"]);

	// Add to hidden parameters if needed
	for(let defaultParam of defaultParams){
		if(currentParams.indexOf(defaultParam) == -1){
			// Add to hidden params if not already there.
			if(hiddenParams.indexOf(defaultParam) == -1){
				hiddenParams.push(defaultParam);
			}
		}
	}

	// Remove from hidden parameters if needed
	let newHiddenParams = [];
	for(let hiddenParam of hiddenParams){
		if(currentParams.indexOf(hiddenParam) == -1){
			newHiddenParams.push(hiddenParam);
		}
	}

	document.getElementById("neat_url_blocked_params").value = currentParams.join(", ");
	document.getElementById("neat_url_hidden_params").value = newHiddenParams.join(", ");

	const values = {};
	for(let p in PREFS) {
		values[p] = document.getElementById(p)[PREFS[p].type];
	}

	browser.storage.local.set(values).then(() => {
		browser.runtime.sendMessage({action: "refresh-options"});

		setTimeout(function(){
			browser.runtime.sendMessage({action: "notify", data: browser.i18n.getMessage("notify_preferences_saved")});
		}, 10);
	});
}

function restoreOptions() {
	browser.storage.local.get(Object.keys(PREFS)).then((result) => {
		let val;
		for(let p in PREFS) {
			if(p in result) {
				val = result[p];
			}
			else {
				val = PREFS[p].default;
			}

			document.getElementById(p)[PREFS[p].type] = val;
			//console.log("options.js val restored is " + val);
		}
	}).catch(console.error);
}

function i18n() {
	let i18nElements = document.querySelectorAll('[data-i18n]');

	for(let i in i18nElements){
		try{
			if(i18nElements[i].getAttribute == null)
				continue;
			i18n_attrib = i18nElements[i].getAttribute("data-i18n");
			let message = browser.i18n.getMessage(i18n_attrib);
			if(message.indexOf("<") > -1 && message.indexOf(">") > -1){
				i18nElements[i].innerHTML = message;
			}else{
				i18nElements[i].textContent = message;
			}
		}catch(ex){
			console.error("i18n id " + IDS[id] + " not found");
		}
	}
}

function init(){
	render();
	restoreOptions();
	i18n();
	document.querySelector("form").style.display = "block";
	document.querySelector(".refreshOptions").style.display = "none";
}

function render(){
	var newWidth = document.documentElement.clientWidth / 3;
	if(Math.abs(lastWidth - (newWidth / 3)) < 15) return; // do not render again

	var sheet = document.styleSheets[0];

	// https://stackoverflow.com/questions/29927992/remove-css-rules-by-javascript
	if (sheet.cssRules) {
		for (var i = 0; i < sheet.cssRules.length; i++) {
			if (sheet.cssRules[i].selectorText === '.labelbox') {
				sheet.deleteRule(i);
			}
		}
	}

	var cssRule = ".labelbox{ min-width: " + newWidth + "px;}";
	sheet.insertRule(cssRule, 1);
	lastWidth = newWidth;
}

window.addEventListener("DOMContentLoaded", init, { passive: true });
document.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); saveOptions(); }, { passive: false });
window.addEventListener("resize", render);
