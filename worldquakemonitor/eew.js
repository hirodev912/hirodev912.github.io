import { enablespeak, startspeech } from "./setup.js";
let lastannounceId = null, eewtxt = document.getElementById('eewtxt');
function geteew() {
    fetch('https://api.wolfx.jp/jma_eew.json', { cache: "no-store" }).then(r => r.json()).then(r => {
        if (lastannounceId !== r.AnnouncedTime) {
            const title = r.Title, quakeTime = r.OriginTime, hypocenter = r.Hypocenter, maxint = r.MaxIntensity, magnitude = r.Magunitude, depth = r.Depth, num = r.Serial;
            eewtxt.innerHTML = `${title}#${num}${(r.isFinal) ? "（最終）" : ""}<br>${hypocenter} M${magnitude}<br>最大震度${maxint.replace('-', '弱').replace('+', '強')} 深さ${depth}KM`;
            if (enablespeak) startspeech(hypocenter + "、マグニチュード" + magnitude + "、最大震度" + maxint.replace('-', '弱').replace('+', '強'));
        }
        lastannounceId = r.AnnouncedTime;
    });
}
geteew();
setInterval(geteew, 5000);