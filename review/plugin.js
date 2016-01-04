﻿(function (review) {
    'use strict';

    review.ReviewPlugin = function () {
        var spotsController = new review.ReviewSpotsController(),
            hintController = new review.ReviewHintController(),
            dialogController = null;

        function init(reviewApiUrl, courseId) {
            if ($ === undefined) {
                throw 'Easygenerator review requires jQuery';
            }

            if (!reviewApiUrl) {
                throw 'Failed to initialize review plugin. Review api url is invalid.';
            }

            if (!courseId) {
                throw 'Failed to initialize review plugin. Course id is invalid.';
            }

            var reviewService = new review.ReviewService(reviewApiUrl, courseId);
            dialogController = new review.ReviewDialogController(reviewService, hintController);
            dialogController.showGeneralReviewDialog();
        }

        function render() {
            spotsController.renderSpots(onSpotClick);
            hintController.showHintsIfNeeded();
        }

        function onSpotClick($spot) {
            if (hintController.isSpotReviewHintShown()) {
                hintController.hideSpotReviewHint();
            } else {
                dialogController.showElementReviewDialog($spot);
            }
        }

        return {
            init: init,
            render: render
        };
    };

})(window.review = window.review || {});