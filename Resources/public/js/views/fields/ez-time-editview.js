/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-time-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the time fields
     *
     * @module ez-time-editview
     */

    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'eztime';

    /**
     * Time edit view
     *
     * @namespace eZ
     * @class timeEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.TimeEditView = Y.Base.create('timeEditView', Y.eZ.FieldEditView, [], {
        events: {
            '.ez-time-input-ui input': {
                'blur': 'validate',
                'valuechange': 'validate',
            },
        },

        /**
         * Check if browser supports time input
         *
         * @method _detectInputTimeSupport
         * @private
         */
        _detectInputTimeSupport: function () {
            var i = document.createElement("input");

            i.setAttribute("type", "time");
            return i.type === "time";
        },

        /**
         * Validation for browsers supporting time input
         *
         * @protected
         * @method _supportedTimeInputValidate
         */
        _supportedTimeInputValidate: function () {
            var validity = this._getInputValidity();

            if ( validity.valueMissing ) {
                this.set('errorStatus', 'This field is required');
            } else if ( validity.badInput ) {
                this.set('errorStatus', 'This is not a valid input');
            } else {
                this.set('errorStatus', false);
            }
        },

        /**
         * Validation for browsers NOT supporting time input
         *
         * @protected
         * @method _unsupportedTimeInputValidate
         */
        _unsupportedTimeInputValidate: function () {
            var validity = this._getInputValidity();

            if ( validity.valueMissing ) {
                this.set('errorStatus', 'This field is required');
            } else if ( validity.patternMismatch ) {
                this.set('errorStatus', 'This time is invalid, enter a correct time: HH:MM(:SS)');
            } else {
                this.set('errorStatus', false);
            }
        },

        /**
         * Validates the current input of time field
         *
         * @method validate
         */
        validate: function () {
            if (this.get('supportsTimeInput')) {
                this._supportedTimeInputValidate();
            } else {
                this._unsupportedTimeInputValidate();
            }
        },

        /**
         * Defines the variables to import in the field edit template for time
         *
         * @protected
         * @method _variables
         * @return {Object} {Object} holding the variables for the template
         */
        _variables: function () {
            var def = this.get('fieldDefinition'),
                field = this.get('field'),
                time = '';

            if ( field && field.fieldValue ) {
                if (!this.get('supportsTimeInput') && !def.fieldSettings.useSeconds) {
                    time =  Y.Date.format(new Date(field.fieldValue * 1000), {format:"%R"});
                } else {
                    time =  Y.Date.format(new Date(field.fieldValue * 1000), {format:"%T"});
                }
            }
            return {
                "isRequired": def.isRequired,
                "supportsTimeInput": this.get('supportsTimeInput'),
                "time": time,
                "useSeconds": def.fieldSettings.useSeconds,
            };
        },

        /**
         * Returns the time input node of the time template
         *
         *
         * @protected
         * @method _getInputNode
         * @return {Y.Node}
         */
        _getInputNode: function () {
            return this.get('container').one('.ez-time-input-ui input');
        },

        /**
         * Returns the input validity state object for the input generated by
         * the time template
         *
         * See https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
         *
         * @protected
         * @method _getInputValidity
         * @return {ValidityState}
         */
        _getInputValidity: function () {
            return this._getInputNode().get('validity');
        },

        /**
         * Returns the currently filled time value for browsers which support Time input
         *
         * @protected
         * @method _supportedTimeInputGetFieldValue
         * @return {Number}
         */
        _supportedTimeInputGetFieldValue: function () {
            var valueOfInput;

            valueOfInput = this._getInputNode().get('valueAsNumber');
            if (valueOfInput) {
                return valueOfInput/1000;
            }
            return null;
        },

        /**
         * Returns the currently filled time value for browsers which DO NOT support Time input
         *
         * @protected
         * @method _unsupportedTimeInputGetFieldValue
         * @return {Number}
         */
        _unsupportedTimeInputGetFieldValue: function () {
            var time = this._getInputNode().get('value').split(":"),
                hours,
                minutes,
                seconds;

            if ( time.length >= 2 ) {
                hours = parseInt(time[0], 10)*3600;
                minutes = parseInt(time[1], 10)*60;
                seconds = 0;
                if ( time.length > 2 ) {
                    seconds = parseInt(time[2], 10);
                }
                time = hours + minutes + seconds;
                return time;
            }
            return null;
        },

        /**
         * Returns the currently filled time value
         *
         * @protected
         * @method _getFieldValue
         * @return {Number}
         */
        _getFieldValue: function () {
            if (this.get('supportsTimeInput')) {
                return this._supportedTimeInputGetFieldValue();
            } else {
                return this._unsupportedTimeInputGetFieldValue();
            }
        },
    },{
        ATTRS: {
            /**
             * Checks if browser supports HTML5 time input
             *
             * @attribute supportsTimeInput
             * @readOnly
             */
            supportsTimeInput: {
                valueFn: '_detectInputTimeSupport',
                readOnly: true
            },
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(FIELDTYPE_IDENTIFIER, Y.eZ.TimeEditView);
});
