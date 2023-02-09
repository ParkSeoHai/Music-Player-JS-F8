
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const cd = $('.cd');
const heading = $('header h2');
const cdThumd = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextSongBtn = $('.btn-next');
const prevSongBtn = $('.btn-prev');
const randomSongBtn = $('.btn-random');
const repeatSongBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    songs: [
        {
            name: 'Bình yên nơi đâu',
            singer: 'MTP',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jfif'
        },
        {
            name: 'Cũng đành thôi',
            singer: 'Đức Phúc',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpg'
        },
        {
            name: 'Là anh',
            singer: 'Meeme',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpg'
        },
        {
            name: 'Như Anh Đã Thấy Em',
            singer: 'Lost Frequencies',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jfif'
        }
    ],

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })

        playList.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth; //Lấy ra kích thước mặc định

        // Xử lí CD quay / dừng
        const cdThumdAnimate = cdThumd.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        })
        cdThumdAnimate.pause();

        // Xử lí phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = document.documentElement.scrollTop || window.scrollY;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lí khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumdAnimate.play();
        }

        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumdAnimate.pause();
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua song
        progress.onchange = function(e) {
            const seekTime = e.target.value * audio.duration / 100;
            audio.currentTime = seekTime;
        }

        // Khi next bài hát
        nextSongBtn.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollActiveSong();
        }

        // Khi Prev song
        prevSongBtn.onclick = function() { 
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollActiveSong();
        }

        // Khi bật / tắt random song
        randomSongBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            randomSongBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lí khi repeat song
        repeatSongBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            repeatSongBtn.classList.toggle('active', _this.isRepeat);
        }
        
        // Xử lí next song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            } else {
                nextSongBtn.click();
            }
        }

        // Lắng nghe hành vi click vào playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                // Xử lí khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // Xử lí khi click vào option
                if (e.target.closest('.option')) {}
            }
        }
    },
    // Scroll active song into view
    scrollActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 200)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumd.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    randomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        //Render playlist
        this.render();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy app
        this.loadCurrentSong();

    }
}

app.start();
