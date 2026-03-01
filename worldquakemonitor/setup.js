export let supportspeech = false, enablespeak = false;
export function startspeech(txt) {
    const uttr = new SpeechSynthesisUtterance(txt);
    uttr.voice = voiceId;
    speechSynthesis.speak(uttr);
}
let voices = [], voiceId = "";
if ('speechSynthesis' in window) supportspeech = true;
document.getElementById('speaker').addEventListener('click', function () {
    if (!enablespeak) {
        if (supportspeech) {
            enablespeak = true;
            document.getElementById('speaker').src = "images/speaker.png";
        } else {
            alert('このブラウザでは音声読み上げがサポートされていません');
        }
    } else {
        document.getElementById('speaker').src = "images/mute.png";
        enablespeak = false;
    }
});
speechSynthesis.onvoiceschanged = () => {
    voices = speechSynthesis.getVoices();
    voices.forEach((e, num) => {
        if (e.lang == "ja-JP") {
            const voiceselect = document.createElement('option');
            voiceselect.selected = e.default;
            voiceselect.value = num;
            if (e.default) voiceId = voices[num];
            voiceselect.text = e.name;
            document.getElementById('voices').appendChild(voiceselect);
        }
    });
}
document.getElementById('voices').addEventListener('change', (e) => {
    voiceId = voices[e.target.value];
});
document.getElementById('testspeech').addEventListener('click', function() {
    if (enablespeak) startspeech('テスト音声です。');
});