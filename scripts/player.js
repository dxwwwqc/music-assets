// 音频上下文恢复解决方案
function forceResumeAudioContext() {
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
        console.log("Audio context is suspended, attempting to resume...");
        Howler.ctx.resume().then(() => {
            console.log("✅ Audio context resumed successfully");
            // 重新播放当前歌曲
            if (player && player.playlist[player.index] && player.playlist[player.index].howl) {
                var currentSound = player.playlist[player.index].howl;
                if (currentSound.playing()) {
                    currentSound.pause();
                    setTimeout(() => currentSound.play(), 100);
                }
            }
        }).catch(error => {
            console.error("❌ Failed to resume audio context:", error);
        });
    } else {
        console.log("Audio context state:", Howler.ctx ? Howler.ctx.state : "No context");
    }
}

// 音频诊断函数
function audioDiagnostic() {
    console.log("=== Audio Diagnostic ===");
    
    // 检查音频上下文
    console.log("1. Audio Context:", Howler.ctx ? Howler.ctx.state : "MISSING");
    
    // 检查全局设置
    console.log("2. Global Volume:", Howler.volume());
    console.log("3. Howler Global State:", Howler._howls ? Howler._howls.length + " sounds" : "No sounds");
    
    // 检查当前音频
    if (player && player.playlist[player.index]) {
        var sound = player.playlist[player.index].howl;
        if (sound) {
            console.log("4. Current Sound State:", sound.state());
            console.log("5. Current Sound Playing:", sound.playing());
            console.log("6. Current Sound Volume:", sound.volume());
            console.log("7. Current Sound Duration:", sound.duration());
            console.log("8. Current Sound Seek:", sound.seek());
            
            // 检查音频节点
            if (sound._sounds && sound._sounds[0]) {
                var audioNode = sound._sounds[0]._node;
                console.log("9. Audio Node:", audioNode ? "EXISTS" : "MISSING");
                if (audioNode) {
                    console.log("10. Audio Node muted:", audioNode.muted);
                    console.log("11. Audio Node volume:", audioNode.volume);
                }
            }
        }
    }
    
    // 测试基础音频API
    var test = new Audio();
    test.volume = 0.1;
    test.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmQeBzF/z/LMeSsFHG+97+WQQAoUXrTp56hVFApGn+DyvmQeBzF/z/LMeSs=';
    
    test.play().then(() => {
        console.log("✅ Basic Audio API: WORKING");
        setTimeout(() => test.pause(), 1000);
    }).catch(e => {
        console.log("❌ Basic Audio API: BLOCKED -", e.message);
    });
}

// 检查音频输出设备
function checkAudioOutput() {
    console.log("=== Audio Output Check ===");
    
    // 创建一个测试音频
    var testSound = new Howl({
        src: ['https://raw.githubusercontent.com/dxwwwqc/music-assets/main/audio/th06/01.%20%E8%B5%A4%E3%82%88%E3%82%8A%E7%B4%85%E3%81%84%E5%A4%A2.mp3'],
        html5: true,
        volume: 0.3,
        onplay: function() {
            console.log("✅ Howl.js Test: PLAYING - Audio output should work");
            // 3秒后停止测试音频
            setTimeout(() => {
                testSound.stop();
                console.log("Test audio stopped");
            }, 3000);
        },
        onloaderror: function(id, error) {
            console.log("❌ Howl.js Test: LOAD ERROR -", error);
        },
        onplayerror: function() {
            console.log("❌ Howl.js Test: PLAY ERROR - Audio context issue");
        },
        onend: function() {
            console.log("✅ Howl.js Test: PLAYBACK COMPLETED");
        }
    });
    
    console.log("Starting Howl.js test playback...");
    testSound.play();
}

// 完全重新初始化音频系统
function reinitializeAudioSystem() {
    console.log("🔄 Reinitializing audio system...");
    
    // 1. 停止所有声音
    Howler.stop();
    
    // 2. 卸载所有音频
    if (Howler._howls) {
        Howler._howls.forEach(function(howl) {
            howl.unload();
        });
    }
    
    // 3. 重新创建音频上下文
    if (Howler.ctx) {
        Howler.ctx.close();
    }
    Howler.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // 4. 重置全局设置
    Howler.volume(1.0);
    
    console.log("✅ Audio system reinitialized");
    console.log("New audio context state:", Howler.ctx.state);
    
    // 5. 重新播放当前歌曲
    setTimeout(() => {
        if (player && player.playlist[player.index]) {
            var currentIndex = player.index;
            console.log("Restarting playback from index:", currentIndex);
            
            // 确保之前的音频被清理
            if (player.playlist[currentIndex].howl) {
                player.playlist[currentIndex].howl.unload();
                delete player.playlist[currentIndex].howl;
            }
            
            // 重新播放
            player.play(currentIndex, true);
        }
    }, 1000);
}

// 检查浏览器音频权限
function checkAudioPermissions() {
    console.log("=== Audio Permissions Check ===");
    
    // 检查自动播放策略
    var testAudio = new Audio();
    testAudio.src = 'https://raw.githubusercontent.com/dxwwwqc/music-assets/main/audio/th06/01.%20%E8%B5%A4%E3%82%88%E3%82%8A%E7%B4%85%E3%81%84%E5%A4%A2.mp3';
    testAudio.volume = 0.1;
    
    var promise = testAudio.play();
    
    if (promise !== undefined) {
        promise.then(() => {
            console.log("✅ Autoplay: ALLOWED");
            testAudio.pause();
        }).catch(error => {
            console.log("❌ Autoplay: BLOCKED -", error.name);
            console.log("User interaction required to play audio");
        });
    }
    
    // 检查权限API (如果可用)
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({name: 'autoplay'}).then(function(result) {
            console.log("Autoplay permission state:", result.state);
        });
    }
}

// 紧急音频修复
function emergencyAudioFix() {
    console.log("🚨 Performing emergency audio fix...");
    
    // 1. 停止所有当前播放
    if (player && player.playlist[player.index].howl) {
        player.playlist[player.index].howl.stop();
    }
    
    // 2. 关闭现有音频上下文
    if (Howler.ctx) {
        Howler.ctx.close();
        console.log("Closed existing audio context");
    }
    
    // 3. 创建新的音频上下文
    Howler.ctx = new (window.AudioContext || window.webkitAudioContext)();
    console.log("Created new audio context:", Howler.ctx.state);
    
    // 4. 设置全局音量
    Howler.volume(1.0);
    
    // 5. 重新播放当前歌曲
    setTimeout(() => {
        if (player) {
            var currentIndex = player.index;
            console.log("Restarting playback from index:", currentIndex);
            
            // 先卸载当前音频
            if (player.playlist[currentIndex].howl) {
                player.playlist[currentIndex].howl.unload();
                delete player.playlist[currentIndex].howl;
            }
            
            // 重新创建并播放
            player.play(currentIndex, true);
        }
    }, 500);
}

// 音乐文件基础 URL - 使用 GitHub Raw URL 访问音频文件
const MUSIC_BASE_URL = 'https://dxwwwqc.github.io/music-assets/';
const AUDIO_BASE_URL = 'https://raw.githubusercontent.com/dxwwwqc/music-assets/main/';

// 全局音频状态管理
var audioState = {
    currentPlaying: null,
    isPlaying: false
};

// Cache references to DOM elements.
var elms = ['track', 'timer', 'duration', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'settingBtn', 'playlistBtn', 'volumeBtn', 'progress', 'waveform', 'canvas', 'loading', 'playlist', 'list', 'volume', 'barEmpty', 'barFull', 'sliderBtn'];
elms.forEach(function (elm) {
  window[elm] = document.getElementById(elm);
});

// For Japanese title cache
let jpGameTitles = [];
let jpSongTitles = [];

/**
 * Player class containing the state of our playlist and where we are in it.
 * Includes all methods for playing, skipping, updating the display, etc.
 * @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
 */
var Player = function (playlist) {
  this.playlist = playlist;

  // URL Parser
  var url = new URL(window.location.href);
  var parser = new URLSearchParams(url.search);
  var parserIndex = parseInt(parser.get('index'));
  if (!isNaN(parserIndex) && parserIndex < playlist.length && parserIndex > 0) {
    this.index = parserIndex;
  } else {
    do {
      this.index = Math.floor(Math.random() * playlist.length);
    } while (playlist[this.index].file == null);
  }

  // Display the song title of the first track.
  track.innerHTML = playlist[this.index].title;

  var indexTemp = this.index - 1;
  while (this.playlist[indexTemp].file != null) {
    --indexTemp;
  }
  document.getElementById('series').innerHTML = this.playlist[indexTemp].title;
  changeImage(playlist[this.index].info);

  var ul = null;
  var ulth = 1;
  var pl = document.getElementById('playlist')
  // Setup the playlist display.
  playlist.forEach(function (song) {
    var li = document.createElement('li');
    li.className = 'pure-menu-item';
    if (song.file == null) {
      // Title
      if (ul != null) {
        pl.appendChild(ul);
      }
      li.innerHTML = song.title;
      jpGameTitles.push(song.title);
      li.id = song.code;
      li.className += ' pure-menu-disabled playlist-title';
      ul = document.createElement('ul');
      ul.className = 'pure-menu-list';
      if (ulth > 5) {
        ul.style.backgroundImage = 'url(\'' + MUSIC_BASE_URL + 'images/title/' + ('00' + ulth).slice(-2) + '.jpg\')';
      }
      ulth++;
    } else {
      // Song
      var a = document.createElement('div');
      a.innerHTML = song.title;
      jpSongTitles.push(song.title);
      a.className = 'pure-menu-link playlist-item';
      a.id = `${song.file}`
      a.onclick = function () {
        player.skipTo(playlist.indexOf(song));
      };
      li.appendChild(a);
    }
    ul.appendChild(li);
  });
  pl.appendChild(ul);
  gapi.client.setApiKey(googleAPI);
  gapi.client.load('youtube', 'v3');
  // For mobile user, display non-animated waveform as default
  if (mobilecheck()) {
    animatedWaveform.checked = '';
  }
};

Player.prototype = {

  lang: 'jp',
  
  /**
   * 🔴 新增：停止所有音频的方法
   */
  stopAllSounds: function() {
    var self = this;
    console.log("🛑 Stopping all sounds...");
    
    // 停止 Howler 的所有声音
    Howler.stop();
    
    // 遍历播放列表，停止所有 Howl 实例
    self.playlist.forEach(function(song) {
      if (song.howl) {
        try {
          if (song.howl.playing && song.howl.playing()) {
            song.howl.stop();
          }
          // 卸载音频以释放资源
          song.howl.unload();
        } catch (error) {
          console.log("Error stopping sound:", error);
        }
      }
    });
    
    // 重置音频状态
    audioState.isPlaying = false;
    audioState.currentPlaying = null;
  },

  /**
   * Play a song in the playlist.
   * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
   */
  play: function (index, isNewSong) {
    var self = this;
    var sound;

    // 先确保音频上下文是活跃的
    forceResumeAudioContext();

    index = typeof index === 'number' ? index : self.index;
    
    // 🔴 新增：停止所有正在播放的音频
    self.stopAllSounds();
    
    // Unload last song
    if (self.playlist[self.index].howl && self.index != index) {
      self.playlist[self.index].howl.unload();
      delete self.playlist[self.index].howl;
    }
    
    // Keep track of the index we are currently playing.
    self.index = index;

    // Skip song not exist
    var data = self.playlist[index];
    if (data.file == null) {
      self.skip('next');
      return;
    }

    // URL Parser
    var url = new URL(window.location.href);
    var parser = new URLSearchParams(url.search);
    parser.set('index', index);
    history.pushState(null, '', '?' + parser.toString());

    // Load song    
    if (data.howl) {
      sound = data.howl;
    } else {
      // 使用已经构建好的完整音频 URL
      var musicUrl = data.file;
      
      sound = data.howl = new Howl({
        src: [musicUrl],
        html5: true,
        format: ['mp3'],
        onplay: function () {
          console.log("🎵 Playback started successfully");
          // 更新音频状态
          audioState.isPlaying = true;
          audioState.currentPlaying = self;
          
          // For chorus mode
          if (chorusMode.checked && self.playlist[self.index].chorusStartTime) {
            data.howl.seek(self.playlist[self.index].chorusStartTime - 1);
            data.howl.fade(0.0, 1.0, 1000);
          }

          // Display the duration.
          duration.innerHTML = self.formatTime(Math.round(sound.duration()));

          // Start upating the progress of the track.
          requestAnimationFrame(self.step.bind(self));

          pauseBtn.style.display = 'block';
        },
        onload: function () {
          console.log("✅ Audio loaded successfully");
          loading.style.display = 'none';
        },
        onloaderror: function(id, error) {
          console.error("❌ Audio load error:", error);
          loading.style.display = 'none';
        },
        onplayerror: function() {
          console.error("❌ Playback error - audio context may be suspended");
          // 尝试恢复音频上下文
          forceResumeAudioContext();
          // 重新尝试播放
          setTimeout(() => {
            if (sound && sound.state() === 'loaded') {
              sound.play();
            }
          }, 500);
        },
        onend: function () {
          console.log("⏭️ Playback ended, skipping to next");
          audioState.isPlaying = false;
          self.skip('next');
        },
        onpause: function () {
          console.log("⏸️ Playback paused");
          audioState.isPlaying = false;
        },
        onstop: function () {
          console.log("⏹️ Playback stopped");
          audioState.isPlaying = false;
        }
      });

      // Waveform display
      var width = waveform.clientWidth;
      var height = (window.innerHeight > 0) ? window.innerHeight * 0.2 : screen.height * 0.2;
      waveform.style.bottom = (height * 0.1 + 90) + 'px';
      if (animatedWaveform.checked) {
        var accuracy = (width < 400) ? 16 : (width < 550) ? 32 : (width < 950) ? 64 : 128;
        canvas.style.display = 'block';
        waveform.style.opacity = 0.5;
        if (wavesurfer) {
          wavesurfer.destroy();
        }
        vudio = new Vudio(sound._sounds[0]._node, canvas, {
          effect: 'waveform',
          accuracy: accuracy,
          width: width,
          height: height,
          waveform: {
            maxHeight: height / 10 * 9,
            minHeight: 1,
            spacing: 4,
            color: ['#ffffff', '#e0e0e0', ' #c9c9c9'],
            shadowBlur: 1,
            shadowColor: '#939393',
            fadeSide: false,
            prettify: false,
            horizontalAlign: 'center',
            verticalAlign: 'bottom'
          }
        });
        vudio.dance();
      } else {
        canvas.style.display = 'none';
        waveform.style.opacity = 1;
        if (wavesurfer) {
          wavesurfer.destroy();
        }
        wavesurfer = WaveSurfer.create({
          container: '#waveform',
          backend: 'MediaElement',
          barWidth: 3,
          cursorColor: '#b556ff',
          cursorWidth: 1,
          progressColor: '#bf6dff',
          waveColor: '#e0e0e0',
          responsive: true
        });
        wavesurfer.load(sound._sounds[0]._node)
        wavesurfer.on('ready', function () {
          wavesurfer.play();
        });
      }
      waveform.style.cursor = 'pointer';
      var indexTemp = index - 1;
      while (self.playlist[indexTemp].file != null) {
        --indexTemp;
      }
      document.getElementById('series').innerHTML = self.playlist[indexTemp].title;
    }

    // Begin playing the sound.
    console.log("🎵 Attempting to play audio...");
    sound.play();

    // Update the track display with new song title
    this.updateTitle(index)

    // Play video
    if (videoPlayer.stopped || isNewSong) {
      mvInfo = data.info;
      mvStage = 0;
    } else if (videoPlayer.paused) {
      videoPlayer.play();
    }

    // Show the pause button.
    if (sound.state() === 'loaded') {
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'block';
    } else {
      loading.style.display = 'block';
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'none';
    }
  },

  /**
   * Pause the currently playing track.
   */
  pause: function () {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Puase the sound.
    sound.pause();

    // 更新音频状态
    audioState.isPlaying = false;

    if (videoPlayer.playing) {
      videoPlayer.pause();
    }

    // Show the play button.
    playBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
  },

  /**
   * 🔴 新增：停止当前音频
   */
  stop: function() {
    var self = this;
    var sound = self.playlist[self.index].howl;
    
    if (sound) {
      sound.stop();
    }
    
    audioState.isPlaying = false;
    
    // 显示播放按钮
    if (playBtn) playBtn.style.display = 'block';
    if (pauseBtn) pauseBtn.style.display = 'none';
  },

  /**
   * Skip to the next or previous track.
   * @param  {String} direction 'next' or 'prev'.
   */
  skip: function (direction) {
    var self = this;

    // Get the next track based on the direction of the track.
    var index = 0;
    if (direction === 'prev' && self.playlist[self.index].howl && self.playlist[self.index].howl.seek() <= 3) {
      self.playlist[self.index].howl.seek(0);
    } else {
      if (randomPlay.checked) {
        index = Math.floor(Math.random() * self.playlist.length);
      } else {
        if (direction === 'prev') {
          index = self.index - 1;
          if (index < 0) {
            index = self.playlist.length - 1;
          }
        } else {
          index = self.index + 1;
          if (index >= self.playlist.length) {
            index = 0;
          }
        }
      }
      self.skipTo(index);
    }
  },

  /**
   * Skip to a specific track based on its playlist index.
   * @param  {Number} index Index in the playlist.
   */
  skipTo: function (index) {
    var self = this;

    // Stop the current track.
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }

    // Reset progress.
    progress.style.width = '0%';
    progressNow = 0;

    // Play the new track.
    self.play(index, true);
  },

  /**
   * Set the volume and update the volume slider display.
   * @param  {Number} val Volume between 0 and 1.
   */
  volume: function (val) {
    var self = this;

    // Update the global volume (affecting all Howls).
    Howler.volume(val);

    // Update the display on the slider.
    var barWidth = (val * 90) / 100;
    barFull.style.width = (barWidth * 100) + '%';
    sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
  },

  /**
   * Seek to a new position in the currently playing track.
   * @param  {Number} per Percentage through the song to skip.
   */
  seek: function (per) {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Convert the percent into a seek position.
    sound.seek(sound.duration() * per);
  },

  /**
   * The step called within requestAnimationFrame to update the playback position.
   */
  step: function () {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Determine our current seek position.
    var seek = sound.seek() || 0;
    timer.innerHTML = self.formatTime(Math.round(seek));
    progressNow = (seek / sound.duration());
    progress.style.width = ((progressNow * 100) || 0) + '%';

    // For chorus mode
    if (!chorusFlag && chorusMode.checked &&
      self.playlist[self.index].chorusEndTime &&
      seek >= self.playlist[self.index].chorusEndTime) {
      chorusFlag = true;
      sound.fade(1.0, 0.0, 2000);
      setTimeout(function () {
        self.skip('next');
        chorusFlag = false;
      }, 2000);
    } else {
      // If the sound is still playing, continue stepping.
      requestAnimationFrame(self.step.bind(self));
    }
  },

  /**
   * Toggle the playlist display on/off.
   */
  togglePlaylist: function () {
    var self = this;
    var display = (playlist.style.display === 'block') ? 'none' : 'block';

    setTimeout(function () {
      playlist.style.display = display;
    }, (display === 'block') ? 0 : 500);
    playlist.className = (display === 'block') ? 'pure-menu pure-menu-scrollable fadein' : 'pure-menu pure-menu-scrollable fadeout';
  },

  /**
   * Toggle the volume display on/off.
   */
  toggleVolume: function () {
    var self = this;
    var display = (volume.style.display === 'block') ? 'none' : 'block';

    setTimeout(function () {
      volume.style.display = display;
    }, (display === 'block') ? 0 : 500);
    volume.className = (display === 'block') ? 'fadein' : 'fadeout';
  },

  /**
   * Toggle the setting display on/off.
   */
  toggleSetting: function () {
    var self = this;
    var display = (setting.style.display === 'block') ? 'none' : 'block';

    setTimeout(function () {
      setting.style.display = display;
    }, (display === 'block') ? 0 : 500);
    setting.className = (display === 'block') ? 'pure-menu fadein' : 'pure-menu fadeout';
  },

  /**
   * Format the time from seconds to M:SS.
   * @param  {Number} secs Seconds to format.
   * @return {String}      Formatted time.
   */
  formatTime: function (secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  },

  updateTitle: function(){
    var data = this.playlist[this.index];
    if (!window.lang || window.lang == 'jp') {
      track.innerHTML = data.title;
    }else{
      getTranslatedSong(data.file, window.lang).then((song)=>{
        if(!song) track.innerHTML = data.title;
        else track.innerHTML =song;
      })
    }
  }
};

var songList = [];
var player;
var vudio;
var wavesurfer;
var chorusFlag = false;

// Update the height of the wave animation.
var resize = function () {
  var width = waveform.clientWidth;
  var height = (window.innerHeight > 0) ? window.innerHeight * 0.2 : screen.height * 0.2;
  waveform.style.bottom = (height * 0.1 + 90) + 'px';
  canvas.width = width;
  canvas.height = height;
  
  // Update the position of the slider.
  var sound = player.playlist[player.index].howl;
  if (sound) {
    var vol = sound.volume();
    var barWidth = (vol * 0.9);
    sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
    
    if (vudio) {
      vudio.width = width;
      vudio.height = height;
      var accuracy = (width < 550) ? 32 : (width < 1000) ? 64 : 128;
      vudio.setOption({
        accuracy: accuracy,
        waveform: {
          maxHeight: height / 10 * 9,
        }
      });
    }
  }
};
window.addEventListener('resize', resize);

var move = function (event) {
  if (window.sliderDown) {
    var x = event.clientX || event.touches[0].clientX;
    var startX = window.innerWidth * 0.05;
    var layerX = x - startX;
    var per = Math.min(1, Math.max(0, layerX / parseFloat(barEmpty.scrollWidth)));
    player.volume(per);
  }
};
volume.addEventListener('mousemove', move);
volume.addEventListener('touchmove', move);

let gameObj;

firebase.database().ref('games').once('value').then(function (games) {
  gameObj = games.val();
  gameObj.forEach(game => {
    var songObj = {}
    songObj['title'] = game.name;
    songObj['file'] = null;
    songObj['code'] = game.path.replace('/audio/', '').replace('.', '');
    songList.push(songObj);
    game.songs.forEach(song => {
      var songObj = {}
      songObj['title'] = song.name.split(".")[1];
      if (songObj['title'] == ' U') {
        songObj['title'] = ' U.N.オーエンは彼女なのか？'
      }
      // 使用 GitHub Raw URL 构建音频文件路径
      var audioPath = song.path.replace('/audio/', 'audio/');
      songObj['file'] = AUDIO_BASE_URL + audioPath;
      songObj['howl'] = null;
      songObj['info'] = song;
      if (song.chorus_start_time) {
        songObj['chorusStartTime'] = song.chorus_start_time;
      }
      if (song.chorus_end_time) {
        songObj['chorusEndTime'] = song.chorus_end_time;
      }
      songList.push(songObj);
    });
  });
  // Setup our new audio player class and pass it the playlist.
  player = new Player(songList);
  resize();
});

// Bind our player controls.
playBtn.addEventListener('click', function () {
    console.log("Play button clicked");
    forceResumeAudioContext();
    
    // 延迟一点确保音频上下文已恢复
    setTimeout(() => {
        if (player) {
            player.play();
        }
    }, 100);
});
pauseBtn.addEventListener('click', function () {
  player.pause();
});
prevBtn.addEventListener('click', function () {
  player.skip('prev');
});
nextBtn.addEventListener('click', function () {
  player.skip('next');
});
waveform.addEventListener('click', function (event) {
  player.seek(event.clientX / window.innerWidth);
});
playlistBtn.addEventListener('click', function () {
  player.togglePlaylist();
});
playlist.addEventListener('click', function () {
  player.togglePlaylist();
});
volumeBtn.addEventListener('click', function () {
  player.toggleVolume();
});
volume.addEventListener('click', function () {
  player.toggleVolume();
});
closePlaylist.addEventListener('click', function () {
  player.togglePlaylist();
});
settingBtn.addEventListener('click', function () {
  player.toggleSetting();
});
animatedWaveform.addEventListener('change', function () {
  // TODO: Instant change waveform 
});

// Setup the event listeners to enable dragging of volume slider.
barEmpty.addEventListener('click', function (event) {
  var per = event.layerX / parseFloat(barEmpty.scrollWidth);
  player.volume(per);
});
sliderBtn.addEventListener('mousedown', function () {
  window.sliderDown = true;
});
sliderBtn.addEventListener('touchstart', function () {
  window.sliderDown = true;
});
volume.addEventListener('mouseup', function () {
  window.sliderDown = false;
});
volume.addEventListener('touchend', function () {
  window.sliderDown = false;
});

// Image preloader
for (var i = 6; i < 27; i++) {
  imagePreload(MUSIC_BASE_URL + 'images/title/' + ('00' + i).slice(-2) + '.jpg');
}

// i18n loading
function langChanged() {
  let langSelect = document.getElementById('langSelect');
  window.lang = langSelect.value;
  player.updateTitle();
  let divs = document.getElementsByClassName('playlist-item')
  for (let i = 0; i < divs.length; i++) {
    let div = divs[i];
    if (window.lang === 'jp') {
      div.innerText = jpSongTitles[i];
    }
    else {
      getTranslatedSong(div.id, window.lang).then((song) => {
        if (song) div.innerText = song;
      })
    }
  }

  // Translating game titles
  firebase
      .database()
      .ref('i18n-titles')
      .once('value')
      .then(function (i18n) {
        let gameTitles = document.getElementsByClassName('playlist-title');
        let translatedTitles = i18n.val()[langSelect.value];
        switch (langSelect.value) {
          case 'jp':
            for (let i = 0; i < gameTitles.length; i++) {
              gameTitles[i].innerText = jpGameTitles[i];
            }
            break;
          case 'en-gb':
            translatedTitles = i18n.val()['en'];
          default:
            for (let i = 0; i < gameTitles.length; i++) {
              let game = gameTitles[i];
              if (game.id in translatedTitles) {
                game.innerText = translatedTitles[game.id] ?? game.innerText;
              }
            }
        }
      });
}

// 工具函数
function mobilecheck() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function fixImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('.')) url = url.substring(1);
  if (!url.startsWith('/') && !url.startsWith('http')) url = '/' + url;
  return encodeURI(url).replace(/%2F/g, '/');
}

function changeImage(info) {
  console.log("Changing image with info:", info);
  if (!info || !info.character) return;
  
  firebase.database().ref('images').once('value').then(function(characters) {
    let characterFound = false;
    characters.val().some(character => {
      if (character.name === info.character) {
        characterFound = true;
        if (character.images && character.images.length > 0) {
          const randomIndex = Math.floor(Math.random() * character.images.length);
          let imageURL = character.images[randomIndex].path;
          imageURL = fixImageUrl(imageURL);
          if (!imageURL.startsWith('http')) {
            imageURL = 'https://dxwwwqc.github.io/music-assets' + imageURL;
          }
          fadeInImage('foreground', imageURL, 'background');
        } else {
          loadImageFromGoogle(info.character);
        }
        return true;
      }
      return false;
    });
    if (!characterFound) loadImageFromGoogle(info.character);
  }).catch(function(error) {
    console.error("Firebase error:", error);
    loadImageFromGoogle(info.character);
  });
}

function loadImageFromGoogle(character) {
  const cx = '009797881502979873179:yxcz0y7drxo';
  const url = `https://www.googleapis.com/customsearch/v1/siterestrict?key=${googleAPI}&cx=${cx}&q=${encodeURIComponent(character)}&searchType=image&imgSize=large&safe=medium`;
  fetch(url).then(response => response.json()).then(data => {
    if (data.items && data.items.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.items.length);
      const imageURL = data.items[randomIndex].link;
      fadeInImage('foreground', imageURL, 'background');
    }
  }).catch(error => console.error("Google image search failed:", error));
}

function getTranslatedSong(file, lang) {
  return Promise.resolve(null);
}

function imagePreload(url) {
  var img = new Image();
  img.src = encodeURI(url);
  return img;
}

function setOpacity(object, opacityPct) {
  if (object) object.style.opacity = opacityPct / 100;
}

function fadeInImage(foregroundId, imageURL, backgroundId, callback = undefined) {
  if (imageURL) imagePreload(imageURL);
  var foreground = document.getElementById(foregroundId);
  var background = document.getElementById(backgroundId);
  if (background && foreground) {
    background.style.backgroundImage = foreground.style.backgroundImage || '';
    background.style.backgroundSize = 'cover';
    background.style.backgroundPosition = 'center';
    background.style.backgroundRepeat = 'no-repeat';
  }
  setTimeout(() => {
    if (foreground) {
      setOpacity(foreground, 0);
      foreground.style.backgroundImage = "url('" + imageURL + "')";
      foreground.style.backgroundSize = 'cover';
      foreground.style.backgroundPosition = 'center';
      foreground.style.backgroundRepeat = 'no-repeat';
      setTimeout(() => {
        setOpacity(foreground, 100);
        if (callback) callback();
      }, 50);
    }
  }, 1000);
}

// 在页面加载时自动尝试恢复音频
document.addEventListener('DOMContentLoaded', function() {
    console.log("Page loaded, setting up audio recovery...");
    
    // 添加用户交互监听
    document.addEventListener('click', function() {
        console.log("User clicked, attempting to resume audio...");
        forceResumeAudioContext();
    });
    
    document.addEventListener('keydown', function() {
        console.log("User pressed key, attempting to resume audio...");
        forceResumeAudioContext();
    });
    
    // 5秒后自动尝试恢复
    setTimeout(forceResumeAudioContext, 5000);
});

// 在控制台中可以调用的调试函数
window.forceResumeAudioContext = forceResumeAudioContext;
window.audioDiagnostic = audioDiagnostic;
window.checkAudioOutput = checkAudioOutput;
window.reinitializeAudioSystem = reinitializeAudioSystem;
window.checkAudioPermissions = checkAudioPermissions;
window.emergencyAudioFix = emergencyAudioFix;

console.log("Audio player initialized with enhanced audio context recovery");