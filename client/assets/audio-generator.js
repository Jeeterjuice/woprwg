// Audio Generator for WOPR sound effects
export function generateAudioFile(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'keypress':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
                
            case 'alert':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
                
            case 'launch':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(110, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 2);
                break;
        }
    } catch (error) {
        console.warn('Audio playback failed:', error);
    }
}

// Usage:
// generateAudioFile('keypress');
// generateAudioFile('alert');
// generateAudioFile('launch');
