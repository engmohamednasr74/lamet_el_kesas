document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const storyId = urlParams.get('id') || urlParams.get('story');
    const story = stories[storyId];

    if (story) {
        // تحديث العنوان والوصف
        document.getElementById('story-title').textContent = story.title;
        if (story.description) document.getElementById('story-description').textContent = story.description;

        const episodeList = document.getElementById('episode-list');
        const videoPlayer = document.getElementById('videoPlayer');
        const currentTitleDisplay = document.getElementById('current-episode-title');
        const videoContainer = videoPlayer.closest('.video-container');
        const playOverlay = document.querySelector('.play-overlay');

        let currentEpisode = null; // متغير: تتبع الحلقة الحالية
        let wasPlaying = false; // متغير: لتتبع ما إذا كان الفيديو شغال قبل الـ seeking

        // توليد الأزرار
        story.episodes.forEach((episode, index) => {
            const button = document.createElement('button');
            button.className = 'w-full text-right p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.01] hover:shadow-card bg-card border-border hover:border-primary/50 animate-fade-in-up';
            button.style.animationDelay = `${index * 0.1}s`;

            button.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color:#e4c567;">
                            <polygon points="6 3 20 12 6 21 6 3"></polygon>
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase" style="color:#fff;">الحلقة ${episode.num}</span>
                            <div class="flex items-center gap-1 text-xs opacity-60">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                <span>${episode.duration} 'غير محددد'</span>
                            </div>
                        </div>
                        <h3 class="font-bold text-base truncate text-foreground" style="color:#e4c567;">${episode.title}</h3>
                        <h5 class=" truncate text-sm text-muted-foreground">${episode.eps_des}</h5>
                    </div>
                </div>
            `;

            button.addEventListener('click', () => {
                playEpisode(episode, button);
            });

            episodeList.appendChild(button);
        });

        // الـ overlay click يشغل الفيديو الحالي لو موجود، أو الأولى لو مفيش
        if (playOverlay) {
            playOverlay.addEventListener('click', (e) => {
                e.stopPropagation();
                if (videoPlayer.src && currentEpisode) {
                    videoPlayer.play().catch(e => console.log("Auto-play prevented"));
                    if (videoContainer) videoContainer.classList.add('playing');
                } else if (story.episodes.length > 0) {
                    const firstButton = episodeList.querySelector('button');
                    playEpisode(story.episodes[0], firstButton);
                }
            });
        }

        // إخفاء/إظهار الـ overlay حسب حالة الفيديو
        videoPlayer.addEventListener('play', () => {
            videoPlayer.controls = false; // تأكيد إخفاء الـ default controls
            if (videoContainer) videoContainer.classList.add('playing');
        });

        videoPlayer.addEventListener('pause', () => {
            videoPlayer.controls = false; // تأكيد إخفاء
            if (videoContainer && videoPlayer.currentTime < videoPlayer.duration - 1) {
                videoContainer.classList.remove('playing');
            }
        });

        videoPlayer.addEventListener('ended', () => {
            videoPlayer.controls = false; // تأكيد إخفاء
            if (videoContainer) videoContainer.classList.remove('playing');
        });

        // التعامل مع الـ seeking لمنع الوقوف الدائم
        videoPlayer.addEventListener('seeking', () => {
            wasPlaying = !videoPlayer.paused; // احفظ إذا كان شغال قبل الـ seeking
        });

        videoPlayer.addEventListener('seeked', () => {
            if (wasPlaying) {
                videoPlayer.play().catch(e => console.log("Auto-play prevented after seek"));
                if (videoContainer) videoContainer.classList.add('playing');
            }
        });

        // إضافات جديدة للـ custom controls
        const playPauseBtn = document.getElementById('play-pause-btn');
        const timeDisplay = document.getElementById('time-display');
        const progressBar = document.getElementById('progress-bar');
        const volumeBtn = document.getElementById('volume-btn');
        const volumeSlider = document.getElementById('volume-slider');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        const playIcon = playPauseBtn.querySelector('.play-icon');
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        const volumeHighIcon = volumeBtn.querySelector('.volume-high-icon');
        const volumeMuteIcon = volumeBtn.querySelector('.volume-mute-icon');
        const fullscreenEnterIcon = fullscreenBtn.querySelector('.fullscreen-enter-icon');
        const fullscreenExitIcon = fullscreenBtn.querySelector('.fullscreen-exit-icon');

        // Update time and progress
        videoPlayer.addEventListener('timeupdate', () => {
            const current = formatTime(videoPlayer.currentTime);
            const duration = formatTime(videoPlayer.duration);
            timeDisplay.textContent = `${current} / ${duration}`;

            const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
            progressBar.value = progress;
        });

        // Seek on progress bar change
        progressBar.addEventListener('input', () => {
            const seekTime = (progressBar.value / 100) * videoPlayer.duration;
            videoPlayer.currentTime = seekTime;
        });

        // Play/Pause button
        playPauseBtn.addEventListener('click', () => {
            if (videoPlayer.paused) {
                videoPlayer.play();
            } else {
                videoPlayer.pause();
            }
        });

        // Update play/pause icon
        videoPlayer.addEventListener('play', () => {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            if (videoContainer) videoContainer.classList.add('playing');
        });

        videoPlayer.addEventListener('pause', () => {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            if (videoContainer && videoPlayer.currentTime < videoPlayer.duration - 1) {
                videoContainer.classList.remove('playing');
            }
        });

        // Volume button (mute/unmute)
        volumeBtn.addEventListener('click', () => {
            videoPlayer.muted = !videoPlayer.muted;
            if (videoPlayer.muted) {
                volumeHighIcon.classList.add('hidden');
                volumeMuteIcon.classList.remove('hidden');
                volumeSlider.value = 0;
            } else {
                volumeHighIcon.classList.remove('hidden');
                volumeMuteIcon.classList.add('hidden');
                volumeSlider.value = videoPlayer.volume;
            }
        });

        // Volume slider change
        volumeSlider.addEventListener('input', () => {
            videoPlayer.volume = volumeSlider.value;
            videoPlayer.muted = (volumeSlider.value === 0);
            if (videoPlayer.muted) {
                volumeHighIcon.classList.add('hidden');
                volumeMuteIcon.classList.remove('hidden');
            } else {
                volumeHighIcon.classList.remove('hidden');
                volumeMuteIcon.classList.add('hidden');
            }
        });

        // Fullscreen button
        fullscreenBtn.addEventListener('click', toggleFullscreen);

        // Double click on video for fullscreen
        videoContainer.addEventListener('dblclick', toggleFullscreen);

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                videoContainer.requestFullscreen();
                fullscreenEnterIcon.classList.add('hidden');
                fullscreenExitIcon.classList.remove('hidden');
            } else {
                document.exitFullscreen();
                fullscreenEnterIcon.classList.remove('hidden');
                fullscreenExitIcon.classList.add('hidden');
            }
        }

        // Format time (00:00)
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        function playEpisode(episode, btnElement) {
            // إظهار نص التحميل فورًا
            const loadingText = document.getElementById('loading-text');
            if (loadingText) loadingText.style.display = 'flex';

            // تغيير مصدر الفيديو
            videoPlayer.src = episode.video;
            videoPlayer.load(); // بدء التحميل

            // عندما يتحمل metadata (أسرع حدث)
            videoPlayer.onloadedmetadata = () => {
                if (loadingText) loadingText.style.display = 'none'; // إخفاء التحميل
                videoPlayer.play().catch(e => console.log("Auto-play prevented:", e));
                if (videoContainer) videoContainer.classList.add('playing');
            };

            // احتياطي لو metadata مش جاهز فورًا
            videoPlayer.oncanplay = () => {
                if (loadingText) loadingText.style.display = 'none';
                videoPlayer.play().catch(e => console.log("Auto-play prevented:", e));
            };

            // باقي الكود بتاعك (تحديث العنوان، تمييز الزر، إلخ)
            currentTitleDisplay.textContent = `أنت تشاهد الآن: ${episode.title}`;

            document.querySelectorAll('#episode-list button').forEach(b => {
                b.classList.remove('bg-primary/10', 'border-primary/50', 'ring-2', 'ring-primary/20');
            });
            if (btnElement) {
                btnElement.classList.add('bg-primary/10', 'border-primary/50', 'ring-2', 'ring-primary/20');
            }

            currentEpisode = episode;
        }

    } else {
        document.getElementById('story-title').textContent = 'عذراً، القصة غير موجودة!';
    }
});