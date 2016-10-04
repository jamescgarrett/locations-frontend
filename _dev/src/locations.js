import Mustache from 'mustache';

import Utils from './utils/Utils';
import ApiUtils from './utils/ApiUtils';
import GoogleMapsUtils from './utils/GoogleMapsUtils';

(function (window) {

    'use strict';

    var LocationLocator = function () {
        destroy.call(this);

        this.geocoder = new google.maps.Geocoder();
        this.map = null;
        this.data = [];
        this.locations = [];
        this.settings = null;
        this.filteredLocations = [];

        this.form = null;
        this.searchInput = null;
        this.radiusInput = null;
        this.resultsContainer = null;
        this.mapContainer = null;
        this.result = null;
        this.emptyContainer = null;
        this.errorsContainer = null;
        this.loadingContainer = null;

        var defaults = {
            data: null,
            formClass: 'locations-form',
            searchInputClass: 'locations-form-search',
            radiusInputClass: 'locations-form-radius',
            resultsContainerClass: 'locations-results',
            mapContainerClass: 'locations-map',
            emptyContainerClass: 'locations-empty',
            errorsContainerClass: 'locations-errors',
            resultsTemplateId: 'location-template',
            loadingContainerClass: 'locations-loading',
            loadingHtml: 'Loading...'
        };

        if (arguments[0] && typeof arguments[0] === 'object') {
            this.options = Utils.extend(defaults, arguments[0]);
        }

        init.call(this);
    };

	/**
	 * Destory instance of plugin
	 * @private
	 */
    var destroy = function () {
        if (!this.options) return;

        document.removeEventListener('submit', handleSearchSubmit, false);

        this.options = null;
    };

	/**
	 * Init Plugin
	 * @private
	 */
    var init = function (options) {
        this.form = document.querySelector('.' + this.options.formClass);
        this.searchInput = document.querySelector('.' + this.options.searchInputClass);
        this.radiusInput = document.querySelector('.' + this.options.radiusInputClass);
        this.resultsContainer = document.querySelector('.' + this.options.resultsContainerClass);
        this.mapContainer = document.querySelector('.' + this.options.mapContainerClass);
        this.emptyContainer = document.querySelector('.' + this.options.emptyContainerClass);
        this.errorsContainer = document.querySelector('.' + this.options.errorsContainerClass);
        this.loadingContainer = document.querySelector('.' + this.options.loadingContainerClass);

        this.form.addEventListener('submit', handleSearchSubmit.bind(this), false);

        this.loadingContainer.innerHTML = this.options.loadingHtml;

        const self = this;
        ApiUtils.loadData(this.options.data, function (results) {
            self.locations = results.locations;
            self.settings = results.settings;
            self.geocoder = new google.maps.Geocoder();
            if (results.settings.showMap) {
                GoogleMapsUtils.setupMap(self.geocoder, results.settings.defaultZip, self.mapContainer, function (result) {
                    self.map = result;
                    getInitialView.call(self);
                });
            } else {
                getInitialView.call(self);
            }
        });
    };

	/**
	 * Handle Form Submit
	 * @private
	 */
    var handleSearchSubmit = function (event) {
        if (this.searchInput.value === '') {
            getFormErrors.call(this, 'empty');
        } else if (!Utils.validate('zip', this.searchInput.value)) {
            getFormErrors.call(this, 'zipformat');
        } else if (this.radiusInput.value !== '' && !Utils.validate('radius', this.radiusInput.value)) {
            getFormErrors.call(this, 'radiusformat');
        } else {
            getSearchView.call(this, this.searchInput.value, this.radiusInput.value);
        }
        event.preventDefault();
    };

	/**
	 * Get Form Errors
	 * @private
	 */
    var getFormErrors = function (type) {
        if (this.errorsContainer.innerHTML !== '') {
            this.errorsContainer.innerHTML = '';
        }
        var message;
        switch (type) {
            case 'empty':
                message = '<p>You must enter a zip code.</p>';
                break;
            case 'zipformat':
                message = '<p>Your zip code doesn\'t seem correct... Please check it again.</p>';
                break;
            case 'radiusformat':
                message = '<p>Please enter a radius that consists of only numbers.</p>';
                break;
            default :
                alert('Something unquestionably bad just happened!');
                break;
        }
        this.errorsContainer.innerHTML = message;
    };

	/**
	 * Get Initial View
	 * @private
	 */
    var getInitialView = function () {
        const self = this;
        GoogleMapsUtils.findCurrentLocation(this.geocoder, this.settings, this.locations, function (results) {
            for (var i = 0; i < results.length; i++) {
                self.filteredLocations.push(self.locations[results[i]]);
            }
            self.filteredLocations.sort(function (a, b) { 
                return a.latitude - b.latitude ; 
            });
            updateView.call(self);
        });
    };

	/**
	 * Get Search View
	 * @private
	 */
    var getSearchView = function (zip, radius) {
        var searchRadius;
        if (radius === '') {
            searchRadius = '24860';
        } else {
            searchRadius = radius;
        }

        // Clear exsiting results
        this.filteredLocations.length = 0;
        this.resultsContainer.innerHTML = '';

        const self = this;
        GoogleMapsUtils.findLocation(this.geocoder, zip, searchRadius, this.locations, function (results) {
            for (var i = 0; i < results.length; i++) {
                self.filteredLocations.push(self.locations[results[i]]);
            }

            self.filteredLocations.sort(function (a, b) { 
                return a.latitude - b.latitude ; 
            });

            updateView.call(self);
        });
    };

	/**
	 * Update View
	 * @private
	 */
    var updateView = function () {
        if (this.filteredLocations.length > 1) {
            this.loadingContainer.innerHTML = '';
            this.errorsContainer.innerHTML = '';
            this.emptyContainer.innerHTML = '';
        } else {
            this.loadingContainer.innerHTML = '';
            this.errorsContainer.innerHTML = '';
            this.emptyContainer.innerHTML = this.settings.notFoundText;
        }

        if (this.settings.showMap) {
            GoogleMapsUtils.addMapMarkers(this.map, this.filteredLocations);
        }

        var template = document.getElementById(this.options.resultsTemplateId).innerHTML;
        Mustache.parse(template);
        var compiledTemplate = Mustache.render(template, {locations: this.filteredLocations});
        this.resultsContainer.innerHTML = compiledTemplate;
    };

	// load it
    window.LocationLocator = LocationLocator;

})(window);
