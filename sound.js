class SoundManager {
	constructor() {
		this.sounds = {};
		this.music = null;
	}

	loadSound(name, url) {
		const audio = new Audio(url);
		this.sounds[name] = audio;
	}

	playSound(name) {
		if (this.sounds[name]) {
			this.sounds[name].currentTime = 0;
			this.sounds[name].play().catch((error) => {
				console.error("Error playing sound:", error);
			});
		} else {
			console.warn(`Sound ${name} not loaded!`);
		}
	}

	loadMusic(url) {
		this.music = new Audio(url);
		this.music.loop = true;
	}

	playMusic() {
		if (this.music) {
			this.music.currentTime = 0;
			this.music.play().catch((error) => {
				console.error("Error playing music:", error);
			});
		} else {
			console.warn("Music not loaded!");
		}
	}

	pauseMusic() {
		if (this.music) {
			this.music.pause();
		}
	}

	stopMusic() {
		if (this.music) {
			this.music.pause();
			this.music.currentTime = 0;
		}
	}

	setSoundVolume(volume) {
		for (const sound in this.sounds) {
			this.sounds[sound].volume = volume;
		}
	}

	setMusicVolume(volume) {
		if (this.music) {
			this.music.volume = volume;
		}
	}
}

const soundManager = new SoundManager();

soundManager.loadSound("email", resouceUrl + "Audio/sfx_emailnotif.mp3")
