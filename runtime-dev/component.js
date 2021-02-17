import $ from 'jquery';
import "jquery-ui/ui/widget";
import "jquery-ui/ui/widgets/mouse";
import "jquery-ui/ui/widgets/slider";

window.jQuery = $;
require("jquery-ui-touch-punch");
import videojs from "video.js";

class MediaRatingQuestion {
    constructor(currentQuestion, mediaOptions) {
        this.question = currentQuestion;
        this.options = mediaOptions;
        this.checks = 0;
        this.sliderMoved = false;
        // not in use yet; for future adaptation of the question depending on the screen orientation
        //this.screenOrientation = this.getOrientation();
        this.primaryBackground = $(".cf-navigation-next").css("background-color");
        this.videoDuration = 0;
        this.currentLanguage = String(Confirmit.page.surveyInfo.language);
        this.devErrors = [];
        this.init();
    }

    init() {
        this.devErrors = this.checkRequiredOptions();
        if (this.devErrors.length > 0) {
            document.getElementById(this.question.id).innerHTML = '<div style="color: red;">' + this.devErrors.join('<br />') + '</div>';
        } else {
            //document.getElementById(this.question.id).querySelectorAll('.cf-open-answer')[0].style.display = 'none';
            this.setDefaultOptions();
            $('body').prepend('<div id="popup" class="hide"><div id="popup-content"></div></div>');
            this.renderVideoRatingQuestion();
        }
    }

    checkRequiredOptions() {
        if (!this.options.hasOwnProperty("src") || (this.options.hasOwnProperty("src") && this.options.src == "")) {
            this.devErrors.push("Option \"src\" is required");
        }
        return this.devErrors;
    }

    setDefaultOptions() {
        if (!this.options.hasOwnProperty("type") || (this.options.hasOwnProperty("type") && this.options.type == "")) {
            this.options.type = "video";
        }
        if (!this.options.hasOwnProperty("width") || (this.options.hasOwnProperty("width") && this.options.width == "")) {
            this.options.width = 640;
        }
        if (!this.options.hasOwnProperty("poster") || (this.options.hasOwnProperty("poster") && this.options.poster == "")) {
            this.options.poster = "";
        }
        if (!this.options.hasOwnProperty("sliderPosition") || (this.options.hasOwnProperty("sliderPosition") && this.options.sliderPosition == "")) {
            this.options.sliderPosition = "bottom";
        }
        if (!this.options.hasOwnProperty("scaleMin") || (this.options.hasOwnProperty("scaleMin") && this.options.scaleMin == "")) {
            this.options.scaleMin = -50;
        }
        if (!this.options.hasOwnProperty("scaleMax") || (this.options.hasOwnProperty("scaleMax") && this.options.scaleMax == "")) {
            this.options.scaleMax = 50;
        }
        if (!this.options.hasOwnProperty("scaleStart") || (this.options.hasOwnProperty("scaleStart") && this.options.scaleStart == "")) {
            this.options.scaleStart = 0;
        }
        if (!this.options.playButtonText.hasOwnProperty(this.currentLanguage) || (this.options.playButtonText.hasOwnProperty(this.currentLanguage) && this.options.playButtonText[this.currentLanguage] == "")) {
            this.options.playButtonText[this.currentLanguage] = "Play";
        }
        if (!this.options.hasOwnProperty("playButtonColor") || (this.options.hasOwnProperty("playButtonColor") && this.options.playButtonColor == "")) {
            this.options.playButtonColor = this.primaryBackground;
        }
        if (!this.options.hasOwnProperty("countdown") || (this.options.hasOwnProperty("countdown") && this.options.countdown == "")) {
            this.options.countdown = 3;
        }
        if (!this.options.hasOwnProperty("timecheck") || (this.options.hasOwnProperty("timecheck") && this.options.timecheck == "")) {
            this.options.timecheck = 5;
        }
        if (!this.options.hasOwnProperty("warningsAmount") || (this.options.hasOwnProperty("warningsAmount") && this.options.warningsAmount == "")) {
            this.options.warningsAmount = 1;
        }
        if (!this.options.resetBtnText.hasOwnProperty(this.currentLanguage) || (this.options.resetBtnText.hasOwnProperty(this.currentLanguage) && this.options.resetBtnText[this.currentLanguage] == "")) {
            this.options.resetBtnText[this.currentLanguage] = "Reset";
        }
        if (!this.options.warningReset.hasOwnProperty(this.currentLanguage) || (this.options.warningReset.hasOwnProperty(this.currentLanguage) && this.options.warningReset[this.currentLanguage] == "")) {
            this.options.warningReset[this.currentLanguage] = "You don't seem to have moved your slider. Please click ‘Reset‘ to restart.";
        }
        if (!this.options.warningIOS.hasOwnProperty(this.currentLanguage) || (this.options.warningIOS.hasOwnProperty(this.currentLanguage) && this.options.warningIOS[this.currentLanguage] == "")) {
            this.options.warningIOS[this.currentLanguage] = "Media is loading and will start shortly.";
        }
    }

    renderVideoRatingQuestion() {
        let object = this;
        // add standard question markup
        document.getElementById(this.question.id).innerHTML = '<div class="cf-question__text" id="' + this.question.id + '_text">' + this.question.text + '</div>' +
            '<div class="cf-question__instruction" id="' + this.question.id + '_instruction">' + this.question.instruction + '</div>' +
            '<div class="cf-question__error cf-error-block cf-error-block--bottom cf-error-block--hidden" id="' + this.question.id + '_error" role="alert" aria-labelledby="' + this.question.id + '_error_list">' +
            '<ul class="cf-error-list" id="' + this.question.id + '_error_list"></ul></div>' +
            '<div class="cf-question__content cf-question__content--no-padding"><div class="video-slider-container"></div></div>';
        // add specific question markup
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (this.options.sliderPosition == 'left' || this.options.sliderPosition == 'right') {
            $('#' + this.question.id + ' .cf-question__content').addClass('slider-' + this.options.sliderPosition);
        }
        let notificationIos = '';
        if (iOS) {
            //<span style="text-transform:capitalize;">' + this.options.mediaType + '</span>
            notificationIos = '<div id="apple-warning">' + this.options.warningIOS[this.currentLanguage] + '</div>';
        }

        let minValAdditionalStyle, maxValAdditionalStyle;
        switch (this.options.sliderPosition) {
            case 'bottom':
                minValAdditionalStyle = 'top: 15px;';
                maxValAdditionalStyle = 'top: 15px; right: 0;';
                break;
            case 'left':
                minValAdditionalStyle = 'bottom: -10px; right: -30px;';
                maxValAdditionalStyle = 'top: -10px; right: -30px;';
                break;
            case 'right':
                minValAdditionalStyle = 'bottom: -10px; left: -30px;';
                maxValAdditionalStyle = 'top: -10px; left: -30px;';
                break;
            default:
                console.log('default');
        }

        $('#' + this.question.id + ' .cf-question__content').prepend('' +
            notificationIos +
            '<div class="video-slider-container"><div class="video-container" style="width: ' + this.options.width + 'px; max-width: 82%;">' +
            '<div class="button-container"><button style="background: ' + this.options.playButtonColor + ';" type="button" id="startVideo_' + this.question.id + '" data-start="0">' + this.options.playButtonText[this.currentLanguage] + '</button></div>' +
            '</div>' +
            '<div class="slider-container">' +
            '<div id="slider">' +
            '<span id="min-val" style="position: absolute; ' + minValAdditionalStyle + '">' + this.options.scaleMin + '</span><span id="max-val" style="position: absolute; ' + maxValAdditionalStyle + '">' + this.options.scaleMax + '</span>' +
            '<div id="custom-handle" class="ui-slider-handle"></div>' +
            '</div></div></div>');

        //add video
        let video = document.createElement('video');
        video.setAttribute('id', this.question.id + '-rate-video');
        video.setAttribute('class', 'video-js');
        video.innerHTML = '<source src="' + this.options.src + '" type = "video/mp4" /><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href = "https://videojs.com/html5-video-support/" target = "_blank"> supports HTML5 video </a></p>';
        document.getElementById(this.question.id).querySelectorAll('.video-container')[0].appendChild(video);

        //video settings
        let controlsVal = false;
        if (iOS) {
            controlsVal = false;
        }

        let myPlayer = videojs(this.question.id + '-rate-video', {
            controls: controlsVal,
            autoplay: false,
            playsinline: true,
            preload: 'auto',
            responsive: true,
            poster: this.options.poster,
            fill: true
        });

        myPlayer.one("loadedmetadata", function(){ changeCounterDisplay(object) });

        //Changing duration to use a Math.round function
        function changeCounterDisplay(obj) {
            let counterMinutes = obj.setCounterMinutesDisplay(Math.floor(myPlayer.duration()));
            $('#' + obj.question.id + ' .video-container').append('<div class="videoTiming clearfix" style="background: ' + obj.primaryBackground + ';"><span class="videoTimingTitle"><span id="timeRemain">00:00</span>&nbsp;/&nbsp;<span id="videoLength">' + counterMinutes + ' </span></span></div>');
            obj.videoDuration = Math.floor(myPlayer.duration());
            obj.generateSparklines(Math.floor(myPlayer.duration()));
        };

        //add slider
        let mySlider;
        const sliderHeight = ($('.video-container').height() + 100) + 'px';

        let orientation = 'horizontal';
        if (this.options.sliderPosition == 'left' || this.options.sliderPosition == 'right') {
            orientation = 'vertical';
            $('.slider-container').css({ 'height': sliderHeight });
        } else {
            $('.slider-container').css({ 'width': this.options.width + 'px', 'max-width': '82%' });
        }
        let handle = $('#custom-handle');
        handle.css('background', this.primaryBackground);
        mySlider = $('#' + this.question.id + ' #slider').slider({
            min: parseInt(this.options.scaleMin),
            max: parseInt(this.options.scaleMax),
            value: parseInt(this.options.scaleStart),
            orientation: orientation,
            create: () => {
                handle.text(this.options.scaleStart);
            },
            slide: (event, ui) => {
                handle.text(ui.value);
                this.sliderMoved = true;
            }
        });

        const nextBtn = $('.cf-navigation-next');
        let nextButtonDisabled = false;
        let addResetBtn = false;
        myPlayer.one("loadedmetadata", function(){ setInitialStateOfNextBtn(object) });

        function setInitialStateOfNextBtn(questionObj) {
            if(questionObj.question.required && (questionObj.question.value === null || questionObj.question.value.split("|")[1].split(",").length < Math.floor(myPlayer.duration()))) {
                nextButtonDisabled = true;
                if(questionObj.question.value !== null) {
                    addResetBtn = true;
                }
            }
            // if(addResetBtn) {
            //     $('#startVideo').attr('data-start', questionObj.question.value.split("|")[1].split(",").length);
            //     $('#' + questionObj.question.id + ' .button-container').append('<button type="button" id="restartVideo" style="background: #000000; margin-left: 15px;">Reset</button>');
            // }
            nextBtn.attr('disabled', nextButtonDisabled);
        }

        //countdown
        $(document).on('click', '#startVideo_' + this.question.id, function () { startVideo(object); });

        function startVideo(obj) {
            //myPlayer.currentTime(parseInt($('#startVideo').attr('data-start'), 10))
            myPlayer.play();
            myPlayer.pause();
            mySlider.slider({ disabled: true });
            obj.playerCycle(myPlayer, mySlider);
            $('#startVideo_' + obj.question.id).attr({ 'disabled': true });
        }
    }

    adjustHexOpacity(color, opacity) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
    }

    setCounterMinutesDisplay(seconds) {
        let minutes = 0;
        let remainingSeconds = 0;
        if (seconds >= 60) {
            minutes = seconds / 60;
        }
        minutes = Math.floor(minutes);
        remainingSeconds = seconds % 60;
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (remainingSeconds < 10) {
            remainingSeconds = "0" + remainingSeconds;
        }
        return minutes + ":" + remainingSeconds;
    }

    generateSparklines(seconds) {
        if (this.options.showSparkline == true) {
            let lines = "";
            const width = $("#spark").width() / seconds;
            const pcWidth = (width / $("#spark").width()) * 100;
            for (let i = 0; i < seconds; i++) {
                lines += '<span style="width:' + pcWidth + '%;" class="spark-line" id="spark-' + i + '"></span>';
            }
            $("#spark").html(lines);
        }
    }

    playerCycle(player, sliderObj) {
        let object = this;
        let timeleft = parseInt(object.options.countdown);
        let startTimer = setInterval(function () {
            if (timeleft <= 0) {
                clearInterval(startTimer);
                $('#startVideo_' + object.question.id).html(object.options.playButtonText[object.currentLanguage]);
                sliderObj.slider({ disabled: false });
                sliderObj.slider({ value: parseInt(object.options.scaleStart) });
                document.getElementById('custom-handle').innerHTML = parseInt(object.options.scaleStart);
                player.play();
                var videoLength = Math.round(player.duration());
                object.collectData(player, videoLength, sliderObj);
                if (object.checks <= object.options.warningsAmount) {
                    object.checkActivity(player, sliderObj);
                }
            }
            if (timeleft === 0) {
                $('#startVideo_' + object.question.id).html(object.options.playButtonText[object.currentLanguage]);
            } else {
                $('#startVideo_' + object.question.id).text(timeleft);
            }
            timeleft -= 1;
        }, 1000);
    }

    checkActivity(player, sliderObj) {
        let object = this;
        //TO DO: why not used?
        const timecheck = object.options.timecheck - 1;
        let moved = false;
        if (object.checks <= object.options.warningsAmount) {
            player.on('timeupdate', function () {
                const second = Math.floor(player.currentTime());
                if (sliderObj.slider('value') != object.options.scaleStart) {
                    moved = true;
                }
                if (object.checks <= object.options.warningsAmount && second === parseInt(object.options.timecheck) && !moved) {
                    //restart video
                    player.pause();
                    sliderObj.slider({ disabled: true });
                    $('#startVideo_' + object.question.id).html(object.options.playButtonText[object.currentLanguage]);
                    $('#popup-content').html('' +
                        '<p>' + object.options.warningReset[object.currentLanguage] + '</p>' +
                        '<button type="button" id="restartVideo_' + object.question.id + '" style="background: ' + object.options.playButtonColor + ';">' + object.options.resetBtnText[object.currentLanguage] + '</button>');
                    $('#popup').removeClass('hide');
                    $('body').css('overflow', 'hidden');
                }
            });
            if (!moved) {
                object.checks++;
            }
        }

        $('body').on('click', '#restartVideo_' + object.question.id, function () {
            object.closePopup();
            $('#startVideo_' + object.question.id).html(object.options.playButtonText[object.currentLanguage]);
            object.generateSparklines(object.videoDuration);
            object.restartVideo(player, sliderObj);
        });
    }

    closePopup() {
        $('#popup').addClass('hide');
        $('body').css('overflow', 'auto');
    }

    //restart video
    restartVideo(player, sliderObj) {
        player.currentTime(0);
        this.playerCycle(player, sliderObj)
    }

    //get evaluation values every second of the media
    collectData(player, videoLength, sliderObj) {
        let videoAsnwers = [];
        if(this.question.value) {
            videoAsnwers = this.question.value.split("|")[1].split(",");
        }
        let object = this;
        player.on('timeupdate', function () {
            const second = Math.floor(player.currentTime());
            if (second >= 1) {
                videoAsnwers[second - 1] = sliderObj.slider('value');
                const val = sliderObj.slider('value');
                if(val > 0) {
                    const pc = (val / object.options.scaleMax) * 10;
                    $("#spark-" + (second - 1)).css({
                        "height":pc+"px",
                        "margin-bottom":"10px",
                        "background-color":"green"
                    });
                } else if (val < 0){
                    const pc = (val / object.options.scaleMin) * 10;
                    $("#spark-" + (second - 1)).css({
                        "height": pc + "px",
                        "margin-bottom": (10 - pc) + "px",
                        "background-color": "red"
                    });
                } else {
                    $("#spark-" + (second - 1)).css({
                        "height": "2px",
                        "margin-bottom": "9px",
                        "background-color": "grey"
                    });
                }
            }
            $('#timeRemain').html(object.setCounterMinutesDisplay(second));

        });

        player.on('ended', () => {
            $('.cf-navigation-next').attr('disabled', false);
            const data = object.checks + "|" + videoAsnwers;
            object.setQuestionValue(data, object);
        });

        object.question.validationCompleteEvent.on(
            () => {
                const data = object.checks + "|" + videoAsnwers;
                object.setQuestionValue(data, object);
            }
        );
    }

    //screen orientation
    getOrientation() {
        const orientation = window.innerWidth > window.innerHeight ? "landscape" : "portrait";
        return orientation;
    }

    setQuestionValue(value, obj) {
        obj.question.setValue(value);
        // to be sure that it won't be changed manually in dev tools somehow
        obj.question.validationCompleteEvent.on(
            () => {
                obj.question.setValue(value);
            }
        );
    }
}

/* global register */
(function () {
    Confirmit.pageView.registerCustomQuestion(
        "6f41ab25-214d-4c98-a06f-60b6ca31b466",
        function (question, customQuestionSettings, questionViewSettings) {
            new MediaRatingQuestion(question, customQuestionSettings);
        }
    );
})();