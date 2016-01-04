(function (review) {
    'use strict';

    review.clientContext = {
        set: function (key, value) {
            localStorage.setItem(key, JSON.stringify(value));
            return value;
        },
        get: function (key) {
            return JSON.parse(localStorage.getItem(key));
        },
        remove: function (key) {
            localStorage.removeItem(key);
        }
    }

})(window.review = window.review || {});
(function (review) {
    'use strict';

    var constants = {};

    constants.patterns = {
        email: /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,15})+)$/
    };

    constants.clientContextKeys = {
        userName: 'usernameForReview',
        userMail: 'usermailForReview',
        reviewSpotHintShown: 'reviewSpotHintShown',
        reviewGeneralHintShown: 'reviewGeneralHintShown'
    };

    constants.css = {
        reviewable: 'reviewable',
        reviewSpot: 'review-spot',
        reviewSpotWrapper: 'review-spot-wrapper',

        reviewDialog: 'review-dialog',
        generalReviewDialog: 'general-review-dialog',
        elementReviewDialog: 'element-review-dialog',
        closeDialogBtn: 'close-dialog-btn',
        commentStatusMessage: 'comment-status-message',
        cancelBtn: 'cancel-btn',
        commentBtn: 'comment-btn',
        commentsHeader: 'comments-header',
        message: 'message',
        identifyUserWrapper: 'identify-user-wrapper',
        messageWrapper: 'message-wrapper',
        errorMessage: 'error-message',
        mailInput: 'email-input',
        nameInput: 'name-input',
        addCommentForm: 'add-comment-form',

        reviewHint: 'review-hint',
        reviewHintText: 'review-hint-text',
        reviewHitnBtn: 'review-hint-btn',
        spotReviewHint: 'spot-review-hint',
        generalReviewHint: 'general-review-hint',

        top: 'top',
        left: 'left',
        right: 'right',
        bottom: 'bottom',
        middle: 'middle',
        expanded: 'expanded',
        error: 'error',
        name: 'name',
        email: 'email',
        empty: 'empty',
        shown: 'shown',
        success: 'success',
        fail: 'fail',
        disabled: 'disabled'
    };

    constants.selectors = {
        reviewable: '.' + constants.css.reviewable,
        reviewSpot: '.' + constants.css.reviewSpot,
        reviewSpotWrapper: '.' + constants.css.reviewSpotWrapper,

        reviewDialog: '.' + constants.css.reviewDialog,
        closeDialogBtn: '.' + constants.css.closeDialogBtn,
        commentStatusMessage: '.' + constants.css.commentStatusMessage,
        cancelBtn: '.' + constants.css.cancelBtn,
        commentBtn: '.' + constants.css.commentBtn,
        commentsHeader: '.' + constants.css.commentsHeader,
        message: '.' + constants.css.message,
        identifyUserWrapper: '.' + constants.css.identifyUserWrapper,
        messageWrapper: '.' + constants.css.messageWrapper,
        errorMessage: '.' + constants.css.errorMessage,
        mailInput: '.' + constants.css.mailInput,
        nameInput: '.' + constants.css.nameInput,
        addCommentForm: '.' + constants.css.addCommentForm,

        reviewHint: '.' + constants.css.reviewHint,
        reviewHintText: '.' + constants.css.reviewHintText,
        reviewHitnBtn: '.' + constants.css.reviewHitnBtn,

        name: '.' + constants.css.name,
        email: '.' + constants.css.email,
        success: '.' + constants.css.success,
        fail: '.' + constants.css.fail,

        body: 'body'
    };

    review.constants = constants;

})(window.review = window.review || {});
(function (review) {
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
(function (review) {
    'use strict';

    review.ReviewService = function (reviewApiUrl, courseId) {
        function postComment(message, username, useremail) {
            return $.ajax({
                url: reviewApiUrl + 'api/comment/create',
                data: { courseId: courseId, text: message.trim(), createdByName: username.trim(), createdBy: useremail.trim() },
                type: 'POST'
            });
        }

        return {
            postComment: postComment
        };
    }

})(window.review = window.review || {});
(function (review) {
    'use strict';

    review.PopupPositioner = function () {
        var constants = review.constants,
            css = constants.css,
            $windowContainer = $(constants.selectors.body),
            preferredVerticalAligment = css.bottom;

        function setPopupPosition($container, $popup) {
            var popupHeight = $popup.height();
            var popupWidth = $popup.width();

            var containerOffset = $container.offset();
            var windowOffset = $windowContainer.offset();
            var position = {};

            position.vertical = getVerticalPosition(preferredVerticalAligment, containerOffset.top, windowOffset.top, popupHeight);
            position.horizontal = getHorizontalPosition(containerOffset.left, windowOffset.left, $windowContainer.width(), popupWidth);

            $popup.addClass(position.vertical.aligment).addClass(position.horizontal.aligment);

            function getVerticalPosition(preferredVerticalAligment, pointerTopOffset, containerTopOffset, tooltipHeight) {
                var vertical = {};
                vertical.aligment = getVerticalAligment(preferredVerticalAligment, pointerTopOffset, tooltipHeight);

                function getVerticalAligment(preferredVerticalAligment, pointerTopOffset, tooltipHeight) {
                    if (preferredVerticalAligment === css.top && (pointerTopOffset - 100) < tooltipHeight) {
                        return css.bottom;
                    }
                    if (preferredVerticalAligment === css.bottom && pointerTopOffset + tooltipHeight > $windowContainer.height()) {
                        return css.top;
                    }
                    return preferredVerticalAligment;
                }

                return vertical;
            }

            function getHorizontalPosition(pointerLeftOffset, containerLeftOffset, containerWidth, tooltipWidth) {
                var horizontal = {};
                horizontal.aligment = '';

                var leftLimit = containerLeftOffset;
                var rightLimit = leftLimit + containerWidth;
                var preferredHorizontalPosition = getPreferredHorizontalPosition();

                if (preferredHorizontalPosition === css.right && pointerLeftOffset - tooltipWidth + 23 > leftLimit) {
                    horizontal.aligment = css.right;
                    return horizontal;
                } else if (preferredHorizontalPosition === css.left && pointerLeftOffset + tooltipWidth < rightLimit) {
                    horizontal.aligment = css.left;
                    return horizontal;
                }

                if (pointerLeftOffset + tooltipWidth < rightLimit) {
                    horizontal.aligment = css.left;
                    return horizontal;
                } else if (pointerLeftOffset - tooltipWidth + 23 > leftLimit) {
                    horizontal.aligment = css.right;
                    return horizontal;
                }

                horizontal.aligment = css.middle;
                return horizontal;
            }

            function getPreferredHorizontalPosition() {
                var constainerX = $container.offset().left;
                return $windowContainer.width() / 2 - constainerX > 0 ? css.right : css.left;
            }

            return position;
        }

        return {
            setPopupPosition: setPopupPosition
        };
    };

})(window.review = window.review || {});
(function (review) {
    'use strict';

    review.ReviewDialogController = function (reviewService, hintController) {
        var constants = review.constants,
            elementReviewDialog = new review.ElementReviewDialog(reviewService),
            generalReviewDialog = new review.GeneralReviewDialog(reviewService, hintController);

        function showGeneralReviewDialog() {
            generalReviewDialog.show();
        }

        function showElementReviewDialog($spot) {
            if (elementReviewDialog.isShown) {
                elementReviewDialog.hide();
            }

            elementReviewDialog.show($spot, constants.css.elementReviewDialog);
        }

        return {
            showGeneralReviewDialog: showGeneralReviewDialog,
            showElementReviewDialog: showElementReviewDialog
        };
    };

})(window.review = window.review || {});
(function (review) {
    'use strict';

    review.ReviewHint = function (text, css) {
        var constants = review.constants,
            html = $.parseHTML('<div class="review-hint"> <div class="review-hint-text-wrapper"> <div class="review-hint-text"></div> </div> <div class="review-hint-action-wrapper"> <button class="review-hint-btn btn">Got it</button> </div> </div>'),
            $hint = $(html),
            hint = {
                 isShown: false,
                 show: show,
                 hide: hide
            };

        return hint;

        function show($parent, gotItHandler) {
            hint.isShown = true;
            $hint.appendTo($parent);
            $hint.addClass(css);
            $hint.find(constants.selectors.reviewHintText).text(text);
            $hint.find(constants.selectors.reviewHitnBtn).click(gotItHandler);
        }

        function hide() {
            hint.isShown = false;
            $hint.detach();
        }
    };

})(window.review = window.review || {});
(function (review) {
    'use strict';

    review.ReviewHintController = function () {
        var constants = review.constants,
            clientContext = review.clientContext,
            spotReviewHint = new review.ReviewHint('Click on icon near elements to leave the comment.', constants.css.spotReviewHint + ' ' + constants.css.left),
            generalReviewHint = new review.ReviewHint('Click on the panel here to leave the general comment.', constants.css.generalReviewHint + ' ' + constants.css.bottom);

        function showSpotReviewHint($spot) {
            spotReviewHint.show($spot, function () {
                hideSpotReviewHint();
            });
        }

        function hideSpotReviewHint() {
            spotReviewHint.hide();
            clientContext.set(constants.clientContextKeys.reviewSpotHintShown, true);

            showHintsIfNeeded();
        }

        function showGeneralReviewHint() {
            generalReviewHint.show($('body'), function () {
                hideGeneralReviewHint();
            });
        }

        function hideGeneralReviewHint() {
            generalReviewHint.hide();
            clientContext.set(constants.clientContextKeys.reviewGeneralHintShown, true);

            showHintsIfNeeded();
        }

        function isSpotReviewHintShown() {
            return spotReviewHint.isShown;
        }

        function isGeneralReviewHintShown() {
            return generalReviewHint.isShown;
        }

        function showHintsIfNeeded() {
            if (generalReviewHint.isShown)
                return;

            if (spotReviewHint.isShown) {
                spotReviewHint.hide();
            }

            var $spots = $(constants.selectors.reviewSpotWrapper);

            if ($spots.length > 0 && clientContext.get(constants.clientContextKeys.reviewSpotHintShown) !== true) {
                showSpotReviewHint($spots[0]);
            } else if (clientContext.get(constants.clientContextKeys.reviewGeneralHintShown) !== true) {
                showGeneralReviewHint();
            }
        }

        return {
            isSpotReviewHintShown: isSpotReviewHintShown,
            isGeneralReviewHintShown: isGeneralReviewHintShown,
            showSpotReviewHint: showSpotReviewHint,
            showGeneralReviewHint: showGeneralReviewHint,
            hideSpotReviewHint: hideSpotReviewHint,
            hideGeneralReviewHint: hideGeneralReviewHint,
            showHintsIfNeeded: showHintsIfNeeded
        };
    };

})(window.review = window.review || {});
(function (review) {
    'use strict';

    review.ReviewSpotsController = function () {
        var constants = review.constants,
            spotMarkup = '<div class="review-spot-wrapper"> <div class="review-spot"></div> </div>';

        function renderSpots(clickHandler) {
            var spots = [];
            $(constants.selectors.reviewable).each(function () {
                var $spot = renderSpotOnElement($(this), clickHandler);
                if ($spot) {
                    spots.push($spot);
                }
            });

            return spots;
        }

        return {
            renderSpots: renderSpots
        };

        function renderSpotOnElement($element, clickHandler) {
            if ($element.children().find(constants.selectors.reviewSpot).length > 0)
                return;

            var $spotWrapper = $(spotMarkup);
            $spotWrapper.appendTo($element);

            if (clickHandler) {
                var $spot = $spotWrapper.find(constants.selectors.reviewSpot);
                $spot.click(function () {
                    clickHandler($spotWrapper);
                });
            }

            return $spotWrapper;
        }
    };

})(window.review = window.review || {});
(function (review) {
    'use strict';

    review.CommentForm = function (reviewService, closeHandler) {
        var constants = review.constants,
            clientContext = review.clientContext,
            html = $.parseHTML('<form class="add-comment-form"> <div class="message-wrapper"> <div class="add-comment-form-title">Leave your comment</div> <textarea class="comment-text-block message" placeholder="Type your comment here..."></textarea> </div> <div class="identify-user-wrapper"> <div class="identify-user-title">Please idenitify yourself</div> <div class="identify-user-row"> <input class="name-input" type="text" /> <label>Name</label> <span class="error-message name">Enter your name</span> </div> <div class="identify-user-row"> <input class="email-input" type="email" /> <label>Email</label> <span class="error-message email">Invalid email</span> </div> </div> <div class="comment-action-wrapper"> <div class="comment-status-message success" title="Comment was sent"> Comment was sent </div> <div class="comment-status-message fail" title="Comment was not sent"> Comment was not sent. <br /> Try again. </div> <div class="comment-actions"> <button title="Cancel" class="cancel-btn"> <span class="btn-title">Cancel</span> </button> <button title="Post comment" class="comment-btn"> <span class="btn-title">Post comment</span> </button> </div> </div> </form>'),
            $commentForm= $(html),
            controls = new review.CommentFormControls($commentForm);

        subscribeOnEvents();
		
		return {
			$element: $commentForm,
			init: init
		};

        function hide() {    
			if(closeHandler){
				closeHandler();
			}
        }

        function submit() {
            if (!controls.identifyForm.isShown) {
                if (controls.messageForm.messageField.getValue().trim().length === 0) {
                    controls.messageForm.messageField.setErrorMark();
                    return;
                }
            }
            else {
                if (!validateIdentifyUserForm())
                    return;

                clientContext.set(constants.clientContextKeys.userName, controls.identifyForm.nameField.getValue().trim());
                clientContext.set(constants.clientContextKeys.userMail, controls.identifyForm.mailField.getValue().trim());
            }

            var username = clientContext.get(constants.clientContextKeys.userName),
                usermail = clientContext.get(constants.clientContextKeys.userMail);

            if (!username || !username.trim() || !usermail || !usermail.trim()) {
                switchToIdentifyUserForm();
                return;
            }

            var message = controls.messageForm.messageField.getValue().trim();
            controls.submitBtn.disable();
            reviewService.postComment(message, username, usermail)
                .done(function (response) {
                    switchToMessageForm();
                    controls.submitBtn.enable();
                    if (response) {
                        if (response.success) {
                            init();
                            controls.commentStatusMessage.success.fadeIn();
                        } else {
                            
                            controls.commentStatusMessage.fail.fadeIn();
                        }
                    }
                }).fail(function () {
                    controls.submitBtn.enable();
                    switchToMessageForm();
                    controls.commentStatusMessage.fail.fadeIn();
                });
        }

        function init() {
            controls.commentStatusMessage.hide();
            switchToMessageForm();

            controls.messageForm.messageField.clear();
            controls.messageForm.messageField.focus();
        }

        function subscribeOnEvents() {
            controls.cancelBtn.click(hide);
            controls.submitBtn.click(submit);
            controls.messageForm.messageField.onfocus(function () {
                controls.commentStatusMessage.fadeOut();
            });
        }

        function switchToIdentifyUserForm() {
            controls.identifyForm.nameField.clear();
            controls.identifyForm.mailField.clear();

            controls.identifyForm.show();
            controls.messageForm.hide();
        }

        function switchToMessageForm() {
            controls.identifyForm.hide();
            controls.messageForm.show();
        }

        function validateIdentifyUserForm() {
            var isValid = true;
            if (!isIdentifyFormNameValid()) {
                controls.identifyForm.nameField.setErrorMark();
                isValid = false;
            }

            if (!isIdentifyFormMailValid()) {
                controls.identifyForm.mailField.setErrorMark();
                isValid = false;
            }

            return isValid;
        }

        function isIdentifyFormNameValid() {
            var value = controls.identifyForm.nameField.getValue();
            return value && value.trim() && value.trim().length <= 254;
        }

        function isIdentifyFormMailValid() {
            var value = controls.identifyForm.mailField.getValue();
            return value && value.trim() && value.trim().length <= 254 && constants.patterns.email.test(value.trim());
        }
    }

})(window.review = window.review || {});
(function (review) {
    'use strict';

    review.CommentFormControls = function ($dialog) {
        var constants = review.constants,
            controls = {
                cancelBtn: new Button(constants.selectors.cancelBtn),
                submitBtn: new Button(constants.selectors.commentBtn),

                commentStatusMessage: new CommentStatusMessage(),

                messageForm: new MessageForm(),
                identifyForm: new IdentifyForm()
            };

        return controls;

        function CommentStatusMessage() {
            var control = Control.call(this, constants.selectors.commentStatusMessage);

            control.success = new Message(constants.selectors.commentStatusMessage + constants.selectors.success);
            control.fail = new Message(constants.selectors.commentStatusMessage + constants.selectors.fail);

            return control;
        }

        function MessageForm() {
            var control = Control.call(this, constants.selectors.messageWrapper);

            control.messageField = new TextField(constants.selectors.message);

            return control;
        }

        function IdentifyForm() {
            var control = Control.call(this, constants.selectors.identifyUserWrapper);

            control.nameField = new TextField(constants.selectors.nameInput);
            control.mailField = new TextField(constants.selectors.mailInput);
            control.nameErrorMessage = new Message(constants.selectors.errorMessage + constants.selectors.name);
            control.mailErrorMassage = new Message(constants.selectors.errorMessage + constants.selectors.email);

            return control;
        }

        function Message(selector) {
            return new review.controls.Message($dialog, selector);
        }

        function Button(selector) {
            return new review.controls.Button($dialog, selector);
        }

        function TextField(selector) {
            return new review.controls.TextField($dialog, selector);
        }

        function Control(selector) {
            return new review.controls.Control($dialog, selector);
        }
    }

})(window.review = window.review || {});
(function (review) {
    'use strict';

    review.controls = {
        Message: Message,
        Button: Button,
        TextField: TextField,
        Control: Control
    };

    function Message($parent, selector) {
        return review.controls.Control.call(this, $parent, selector);
    }

    function Button($parent, selector) {
        var control = review.controls.Control.call(this, $parent, selector),
            $control = control.$control;

        control.click = function (handler) {
            $control.click(function (e) {
                e.preventDefault();
                handler();
            });
        }

        return control;
    }

    function TextField($parent, selector) {
        var control = review.controls.Control.call(this, $parent, selector),
            $control = control.$control,
            $errorMessage = $control.nextAll(review.constants.selectors.errorMessage),
            onfocus = null;

        $control.change(onChange);
        $control.focus(function () {
            control.removeErrorMark();
            if (onfocus) {
                onfocus();
            }
        });

        control.onfocus = function (handler) {
            onfocus = handler;
        }

        control.getValue = function () {
            return $control.val();
        }

        control.setValue = function (value) {
            $control.val(value);
            onChange();
        }

        control.clear = function () {
            control.setValue('');
            control.removeErrorMark();
        }

        control.setErrorMark = function () {
            control.addClass(review.constants.css.error);
            $errorMessage.addClass(review.constants.css.shown);
        }

        control.removeErrorMark = function () {
            control.removeClass(review.constants.css.error);
            $errorMessage.removeClass(review.constants.css.shown);
        }

        function onChange() {
            control.removeErrorMark();
            if (control.getValue().length === 0) {
                control.addClass(review.constants.css.empty);
            } else {
                control.removeClass(review.constants.css.empty);
            }
        }

        return control;
    }

    function Control($parent, selector) {
        var $control = $parent.find(selector);

        var control = {
            isShown: true,
            show: show,
            hide: hide,
            focus: focus,
            addClass: addClass,
            removeClass: removeClass,
            fadeIn: fadeIn,
            fadeOut: fadeOut,
            disable: disable,
            enable: enable,
            $control: $control
        };

        return control;

        function addClass(css) {
            $control.addClass(css);
        }

        function removeClass(css) {
            $control.removeClass(css);
        }

        function show() {
            $control.show();
            control.isShown = true;
        }

        function hide() {
            $control.hide();
            control.isShown = false;
        }

        function fadeOut() {
            $control.fadeOut('fast');
            control.isShown = false;
        }

        function fadeIn() {
            $control.fadeIn('fast');
            control.isShown = true;
        }

        function focus() {
            $control.focus();
        }

        function disable() {
            $control.prop('disabled', true);
            addClass('disabled');
        }

        function enable() {
            $control.prop('disabled', false);
            removeClass('disabled');
        }
    }

})(window.review = window.review || {});
(function (review) {
    'use strict';

    review.ElementReviewDialog = function (reviewService) {
        var constants = review.constants,
            html = $.parseHTML('<div class="review-dialog element-review-dialog"> <button class="close-dialog-btn"></button> <form class="add-comment-form"> </form> </div>'),
            commentForm = new review.CommentForm(reviewService, hide),
            popupPositioner = new review.PopupPositioner(),
            $dialog = $(html),
            closeBtn = new review.controls.Button($dialog, constants.selectors.closeDialogBtn),
            dialog = {
                isShown: false,
                show: show,
                hide: hide
            };

        closeBtn.click(hide);

        return dialog;

        function show($parent) {
            if (dialog.isShown)
                return;

            $dialog.find(constants.selectors.addCommentForm).replaceWith(commentForm.$element);
            $dialog.appendTo($parent);

            $dialog.hide();
            popupPositioner.setPopupPosition($parent, $dialog);

            $dialog.fadeIn('fast').addClass(constants.css.shown);
            commentForm.init();

            dialog.isShown = true;
        }

        function hide() {
            if (!dialog.isShown)
                return;

            $dialog.removeClass(constants.css.shown).fadeOut('fast', function () {
                $dialog.detach();
            });

            dialog.isShown = false;
        }
    };
})(window.review = window.review || {});
(function (review) {
    'use strict';

    review.GeneralReviewDialog = function (reviewService, hintController) {
        var constants = review.constants,
            commentForm = new review.CommentForm(reviewService),
            $dialog = $($.parseHTML('<div class="review-dialog general-review-dialog"> <div class="comments-header"> <div class="comment-header-text">Leave general comment</div> <div class="comments-expander"></div> </div> <form class="add-comment-form"> </form> </div>')),
            expandCollapseBtn = new review.controls.Button($dialog, constants.selectors.commentsHeader),
            dialog = {
                show: show
            };

        expandCollapseBtn.click(toggleSize);

        return dialog;

        function show() {
            $dialog.find(constants.selectors.addCommentForm).replaceWith(commentForm.$element);
            $dialog.appendTo(constants.selectors.body);
            commentForm.init();
        }

        function toggleSize() {
            var isExpanded = $dialog.hasClass(constants.css.expanded);
            $dialog.toggleClass(constants.css.expanded);

            if (!isExpanded) {
                commentForm.init();
                if (hintController.isGeneralReviewHintShown()) {
                    hintController.hideGeneralReviewHint();
                }
            }
        }
    };
})(window.review = window.review || {});