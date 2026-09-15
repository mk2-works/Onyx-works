/* showreel.js — шоурил: большая кнопка play, контролы только на время просмотра */
(function () {
  'use strict';

  document.querySelectorAll('.showreel__box').forEach(function (box) {
    var video = box.querySelector('.showreel__video');
    var play = box.querySelector('.showreel__play');
    if (!video || !play) return;

    play.addEventListener('click', function () {
      video.controls = true;
      play.classList.add('is-hidden');
      video.play();
    });

    video.addEventListener('ended', function () {
      video.controls = false;
      video.currentTime = 0;
      play.classList.remove('is-hidden');
    });
  });
})();