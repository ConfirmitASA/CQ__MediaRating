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
        this.devErrors = [];
        this.init();
    }

    init() {
        this.devErrors = this.checkRequiredOptions();
        if (this.devErrors.length > 0) {
            document.getElementById(this.question.id).innerHTML = '<div style="color: red;">' + this.devErrors.join('<br />') + '</div>';
            //$('#' + currentQuestion.id).html('<div style="color: red;">' + errorsForDeveloper.join('<br />') + '</div>');
        } else {
            document.getElementById(this.question.id).querySelectorAll('.cf-open-answer')[0].style.display = 'none';
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
        // console.log("this.options");
        // console.log(this.options);
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
        if (!this.options.hasOwnProperty("sliderPadding") || (this.options.hasOwnProperty("sliderPadding") && this.options.sliderPadding == "")) {
           this.options.sliderPadding = 30;
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
        if (!this.options.hasOwnProperty("playButtonText") || (this.options.hasOwnProperty("playButtonText") && this.options.playButtonText == "")) {
            this.options.playButtonText = "Play";
        }
        if (!this.options.hasOwnProperty("playButtonColor") || (this.options.hasOwnProperty("playButtonColor") && this.options.playButtonColor == "")) {
            //var selectedForeground = $(".cf-navigation-next").css("color");
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
        // if (!this.options.hasOwnProperty("showSparklie") || (this.options.hasOwnProperty("type") && this.options.type == "")) {
        //     this.options.showSparklie = true;
        // }
    }

    renderVideoRatingQuestion() {
        var object = this;
        // add markup
        var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (this.options.sliderPosition == 'left' || this.options.sliderPosition == 'right') {
            $('#' + this.question.id + ' .cf-question__content').addClass('slider-' + this.options.sliderPosition);
        }
        var notificationIos = '';
        if (iOS) {
            notificationIos = '<div id="apple-warning"><span style="text-transform:capitalize;">' + this.options.mediaType + '</span> is loading and will start shortly.</div>';
        }

        $('#' + this.question.id + ' .cf-question__content').prepend('' +
            notificationIos +
            '<div class="video-slider-container"><div class="video-container" style="width: ' + this.options.width + 'px; max-width: 82%;">' +
            '<div class="button-container"><button style="background: ' + this.options.playButtonColor + ';" type="button" id="startVideo">' + this.options.playButtonText + '</buttonsty></div>' +
            '<div id="counter"></div>' +
            '</div>' +
            '<div class="slider-container">' +
            '<div id="slider">' +
            '<div id="custom-handle" class="ui-slider-handle"></div>' +
            '</div></div></div>');

        //hide countdown
        $('#counter').hide();

        // var selectedLight = selectedBackground;
        // if (selectedLight.indexOf("#") > -1) {
        //     selectedLight = this.adjustHexOpacity(selectedLight , 0.5);
        // } else {
        //     selectedLight = selectedLight.replace('rgb','rgba').replace(')',',0.5)')
        // }
        //
        // $("head").append('<style>.uiColorScheme{ background-color: ' + selectedBackground + '!important; color: ' + selectedForeground + '!important; } .uiColorSchemeFaded{ background-color: ' + selectedLight + ';} </style>');

        //add video
        var video = document.createElement('video');
        video.setAttribute('id', this.question.id + '-rate-video');
        video.setAttribute('class', 'video-js');
        video.innerHTML = '<source src="' + this.options.src + '" type = "video/mp4" /><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href = "https://videojs.com/html5-video-support/" target = "_blank"> supports HTML5 video </a></p>';
        document.getElementById(this.question.id).querySelectorAll('.video-container')[0].appendChild(video);

        // var videoHTML = '<video id="' + this.question.id + '-rate-video" class="video-frame" style="width: 100%; height:auto;"><source src="' + this.options.src + '" type = "video/mp4" /><p class="vjs-no-js">To play this ' + this.options.mediaType + ' please enable JavaScript, and consider upgrading to a web browser that<a href="https://videojs.com/html5-video-support/" target = "_blank"> supports HTML5 video </a></p></video>';
        // $(".video-container").append(videoHTML);

        //video settings
        var controlsVal = false;
        if (iOS) {
            controlsVal = false;
        }
        //console.log(this.question.id);
        var myPlayer = videojs(this.question.id + '-rate-video', {
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
            //$('.video-container').append('<div class="videoTiming"><p class="videoTimingTitle">Video length (remain): <span id="videoLength">' + (Math.floor(myPlayer.duration()) + 1) + ' sec.</span> (<span id="timeRemain">' + (Math.floor(myPlayer.duration()) + 1) + '</span>  sec.)</p></div>');
            var counterMinutes = obj.setCounterMinutesDisplay(Math.floor(myPlayer.duration()));
            $('.video-container').append('<div class="videoTiming clearfix" style="background: ' + obj.primaryBackground + ';"><span class="videoTimingTitle"><span id="timeRemain">00:00</span>&nbsp;/&nbsp;<span id="videoLength">' + counterMinutes + ' </span></span></div>');
            obj.videoDuration = Math.floor(myPlayer.duration());
            obj.generateSparklines(Math.floor(myPlayer.duration()));
        };

        //add slider
        var mySlider;
        var sliderHeight = ($('.video-container').height() + 100) + 'px';

        var orientation = 'horizontal';
        if (this.options.sliderPosition == 'left' || this.options.sliderPosition == 'right') {
            orientation = 'vertical';
            $('.slider-container').css({ 'height': sliderHeight });
        } else {
            $('.slider-container').css({ 'width': this.options.width + 'px', 'max-width': '82%' });
        }
        var handle = $('#custom-handle');
        handle.css('background', this.primaryBackground);
        mySlider = $('#slider').slider({
            min: parseInt(this.options.scaleMin),
            max: parseInt(this.options.scaleMax),
            value: parseInt(this.options.scaleStart),
            orientation: orientation,
            //disabled: true,
            create: function () {
                handle.text($(this).slider('value'));
            },
            slide: function (event, ui) {
                handle.text(ui.value);
                this.sliderMoved = true;
            }
        });

        var nextBtn = $('.cf-navigation-next');
        nextBtn.attr('disabled', true);

        //countdown
        $(document).on('click', '#startVideo', function () { startVideo(object); });

        function startVideo(obj) {
            myPlayer.play();
            myPlayer.pause();
            mySlider.slider({ disabled: true });
            obj.playerCycle(myPlayer, mySlider);
            $('#startVideo').attr({ 'disabled': true });
        }
    }

    adjustHexOpacity(color, opacity) {
        var r = parseInt(color.slice(1, 3), 16);
        var g = parseInt(color.slice(3, 5), 16);
        var b = parseInt(color.slice(5, 7), 16);
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
    }

    setCounterMinutesDisplay(seconds) {
        var minutes = 0;
        var remainingSeconds = 0;
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
            var lines = "";
            var width = $("#spark").width() / seconds;
            var pcWidth = (width / $("#spark").width()) * 100;
            for (var i = 0; i < seconds; i++) {
                lines += '<span style="width:' + pcWidth + '%;" class="spark-line" id="spark-' + i + '"></span>';
            }
            $("#spark").html(lines);
        }
    }

    playerCycle(player, sliderObj) {
        var object = this;
        var timeleft = object.options.countdown;
        var startTimer = setInterval(function () {
            if (timeleft <= 0) {
                clearInterval(startTimer);
                $('#startVideo').text("Play");
                sliderObj.slider({ disabled: false });
                player.play();
                var videoLength = Math.round(player.duration());
                object.collectData(player, videoLength, sliderObj);
                if (object.checks <= object.options.warningsAmount) {
                    object.checkActivity(player, sliderObj);
                }
            }
            $('#startVideo').text(timeleft);
            timeleft -= 1;
        }, 1000);
    }

    checkActivity(player, sliderObj) {
        var object = this;
        //TO DO: why not used?
        var timecheck = object.options.timecheck - 1;
        var moved = false;
        if (object.checks <= object.options.warningsAmount) {
            player.on('timeupdate', function () {
                var second = Math.floor(player.currentTime());
                if (sliderObj.slider('value') != object.options.scaleStart) {
                    moved = true;
                }
                if (object.checks <= object.options.warningsAmount && second === parseInt(object.options.timecheck) && !moved) {
                    //restart video
                    player.pause();
                    sliderObj.slider({ disabled: true });
                    $('#startVideo').text(object.options.playButtonText);
                    // $('#counter').html('');
                    $('#popup-content').html('' +
                        '<p>You don\'t seem to have moved your slider. Please click ‘OK’ to restart this task again.</p>' +
                        '<button type="button" id="restartVideo" style="background: ' + object.options.playButtonColor + ';">Reset</button>');
                    $('#popup').removeClass('hide');
                    $('body').css('overflow', 'hidden');
                }
            });
            if (!moved) {
                object.checks++;
            }
        }

        $('body').on('click', '#restartVideo', function () {
            object.closePopup();
            $('#startVideo').text("Play");
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

    //setInterval(function, milliseconds, param1, param2, ...)
    //var startDataTimer;
    collectData(player, videoLength, sliderObj) {
        var videoAsnwers = [];
        var object = this;
        player.on('timeupdate', function () {
            var second = Math.floor(player.currentTime());
            //console.log(second + " == " + sliderObj.slider('value'));
            if (second >= 1) {
                videoAsnwers[second - 1] = sliderObj.slider('value');
                var val = sliderObj.slider('value');
                if(val > 0) {
                    var pc = (val / object.options.scaleMax) * 10;
                    $("#spark-" + (second - 1)).css({
                        "height":pc+"px",
                        "margin-bottom":"10px",
                        "background-color":"green"
                    });
                } else if (val < 0){
                    var pc = (val / object.options.scaleMin) * 10;
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
        player.on('ended', function () {
            $('.cf-navigation-next').attr('disabled', false);
            var data = object.checks + "|" + videoAsnwers;
            console.log("data");
            console.log(data);
            object.setQuestionValue(data, object);
        })
    }

    getOrientation() {
        var orientation = window.innerWidth > window.innerHeight ? "landscape" : "portrait";
        return orientation;
    }

    setQuestionValue(value, obj) {
        obj.question.setValue(value);
        // to be sure that it won't be changed manually in dev tools somehow
        obj.question.validationCompleteEvent.on(
            function () {
                obj.question.setValue(value);
            }
        );
    }
}

/* global register */
register(function (question, customQuestionSettings, questionViewSettings) {
    // console.log("customQuestionSettings");
    // console.log(customQuestionSettings);
    new MediaRatingQuestion(question, customQuestionSettings);
});