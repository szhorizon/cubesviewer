/*
 * CubesViewer
 * Copyright (c) 2012-2013 Jose Juan Montes, see AUTHORS for more details
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * If your version of the Software supports interaction with it remotely through
 * a computer network, the above copyright notice and this permission notice
 * shall be accessible to all users.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * Cache
 */
cubesviewer.cache = {};

/*
 * Override original cubesRequest 
 */
cubesviewer._cacheOverridedCubesRequest = cubesviewer.cubesRequest;

/*
 * Show "loaded from cache" message.
 */
cubesviewer._showCachedMessage = function(message) {
	
	if ($('#cv-cache-indicator').size() < 1) {
			
		$(body).append('<div id="cv-cache-indicator" style="display: none;"></div>')
		$('#cv-cache-indicator').qtip({
			   content: 'NO MESSAGE DEFINED',
			   position: {
				   my: 'bottom right',
				   at: 'bottom right',
				   target: $(window),
				   adjust: {
					   x: -10,
					   y: -10
				   }
			   },
			   style: {
				   classes: 'fixed',
				   tip: {
					   corner: false
				   }
			   },
			   show: {
				   delay: 0,
				   event: ''
			   },
			   hide: {
				   inactive: 1000
			   }
		});
	}

	$('#cv-cache-indicator').qtip('option', 'content.text', message);
	$('#cv-cache-indicator').qtip('toggle', true);
}


cubesviewer.cubesRequest = function(path, params, successCallback, completeCallback, errorCallback) {
	
	// TODO: Check if cache is enabled
	
	cubesviewer._cacheCleanup();
	
	var requestHash = path + "?" + $.param(params);
	if (requestHash in this.cache) {
		
		// TODO: What is the correct ordering of success/complete callbacks?
		successCallback(this.cache[requestHash].data);
		completeCallback();
		
		// Warn that data comes from cache (QTip can do this?)
		var timediff = Math.round ((new Date().getTime() - this.cache[requestHash].time) / 1000 / 60);
		cubesviewer._showCachedMessage("Data loaded from cache<br/>(" + timediff + " minutes old)");
		
	} else {
		// Do request
		cubesviewer._cacheOverridedCubesRequest(path, params, this.cacheCubesRequestSuccess(successCallback, requestHash), completeCallback, errorCallback);
	}
	
}

/*
 * Reviews the cache and removes old elements and oldest if too many
 */
cubesviewer._cacheCleanup = function() {
	
	var cacheMinutes = 60;
	var cacheSize = 32;
		
	if ("cacheMinutes" in cubesviewer.options) {
		cacheMinutes = cubesviewer.options.cacheMinutes;
	}
	if ("cacheSize" in cubesviewer.options) {
		cacheSize = cubesviewer.options.cacheSize;
	}

	var oldestTime = new Date().getTime() - (1000 * 60 * cacheMinutes);
	 
	var elements = [];
	for (element in this.cache) {
		if (this.cache[element].time < oldestTime) {
			delete this.cache[element];
		} else {
			elements.push (element);
		}
	}
	
	elements.sort(function(a, b) {
		return (cubesviewer.cache[a].time - cubesviewer.cache[b].time);
	});
	if (elements.length >= cacheSize) {
		for (var i = 0; i < elements.length - cacheSize; i++) {
			delete this.cache[elements[i]];
		}
	}
	
	
}

cubesviewer.cacheCubesRequestSuccess = function(pCallback, pRequestHash) {
	var requestHash = pRequestHash;
	var callback = pCallback;
	return function(data) {
		// TODO: Check if cache is enabled
		cubesviewer.cache[pRequestHash] = {
			"time": new Date().getTime(),
			"data": data
		};
		pCallback(data);
	};
}
