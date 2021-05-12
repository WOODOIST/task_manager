"use strict";

(function () {
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            'use strict';
            if (typeof start !== 'number') {
                start = 0;
            }
            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        }
    }
})();

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getFileExtension(filename) {
	if(filename && typeof filename == "string") {
		let tmpArr = filename.split(".");
		if(tmpArr.length > 2 || tmpArr.length <= 0) {
			return false;
		}
		return filename.split(".")[1];
	}
}

document.addEventListener("mousedown", function(e) {
    if(e.button == 1) return e.preventDefault();
})