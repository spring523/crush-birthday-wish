const playSongBtn = document.getElementById('playSong');
const song = document.getElementById('song');
const blowBtn = document.getElementById('blowCandles');
const candles = document.querySelectorAll('.candle');

playSongBtn.addEventListener('click', () => {
  song.play();
});

// Blow out candles using microphone
blowBtn.addEventListener('click', () => {
  startBlowDetection();
});

function startBlowDetection() {
  if (!navigator.mediaDevices.getUserMedia) {
    alert('Microphone not supported!');
    return;
  }
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 512;
      const data = new Uint8Array(analyser.fftSize);

      function detectBlow() {
        analyser.getByteTimeDomainData(data);
        // Calculate volume
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += Math.pow((data[i] - 128) / 128, 2);
        }
        let volume = Math.sqrt(sum / data.length);

        if (volume > 0.18) { // Might need tuning!
          blowOutCandles();
          // stop mic
          stream.getTracks().forEach(track => track.stop());
          audioCtx.close();
        } else {
          requestAnimationFrame(detectBlow);
        }
      }
      detectBlow();
    })
    .catch(err => {
      alert('Please allow microphone access to blow out candles!');
    });
}

function blowOutCandles() {
  candles.forEach(candle => candle.classList.add('blow-out'));
  alert("You blew out the candles! 🎂");
}
