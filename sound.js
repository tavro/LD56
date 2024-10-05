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

/*
NOTE: Use it like this:
const soundManager = new SoundManager();

soundManager.loadSound("test", "res/Audio/test.wav");
soundManager.loadMusic("res/Audio/music.mp3");

soundManager.setSoundVolume(0.5);
soundManager.setMusicVolume(0.3);

You have to trigger things like for example 
soundManager.playSound("test") and soundManager.playMusic() with a listener to bypass the rights to play sound
*/
