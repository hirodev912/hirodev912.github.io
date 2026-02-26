const host_server = "https://smi.lmoniexp.bosai.go.jp/";
let timeoffset = 0;
const signal_audio = new Audio();
signal_audio.src = "signal.mp3";
function syncntptime() {
    fetch('https://api.wolfx.jp/ntp.json').then(r => r.json()).then(r => {
        timeoffset = r.timestamp - Date.now();
    });
}
syncntptime();
function getnowtime(late) {
    const realtime = new Date(new Date() - late + timeoffset);
    const year = realtime.getFullYear();
    const month = ('00' + (realtime.getMonth() + 1)).slice(-2);
    const date = ('00' + realtime.getDate()).slice(-2);
    const hour = ('00' + realtime.getHours()).slice(-2);
    const minute = ('00' + realtime.getMinutes()).slice(-2);
    const second = ('00' + realtime.getSeconds()).slice(-2);
    return [year, month, date, hour, minute, second];
}
function updateImg() {
    let t = getnowtime(0);
    if (t[4] == "59" && t[5] == "57") {
        signal_audio.play();
    }
    document.getElementById('time').textContent = `${t[0]}/${t[1]}/${t[2]} ${t[3]}:${t[4]}:${t[5]}`;
    t = getnowtime(1600);
    document.getElementById('nied_image1').src = `${host_server}data/map_img/RealTimeImg/jma_s/${t[0]}${t[1]}${t[2]}/${t[0]}${t[1]}${t[2]}${t[3]}${t[4]}${t[5]}.jma_s.gif`;
    document.getElementById('nied_image2').src = `https://www.lmoni.bosai.go.jp/monitor/data/data/map_img/RealTimeImg/abrspmx_s/${t[0]}${t[1]}${t[2]}/${t[0]}${t[1]}${t[2]}${t[3]}${t[4]}${t[5]}.abrspmx_s.gif`;
    document.getElementById('nied_image3').src = `${host_server}data/map_img/EstShindoImg/eew/${t[0]}${t[1]}${t[2]}/${t[0]}${t[1]}${t[2]}${t[3]}${t[4]}${t[5]}.eew.gif`;
    document.getElementById('nied_image4').src = `${host_server}data/map_img/PSWaveImg/eew/${t[0]}${t[1]}${t[2]}/${t[0]}${t[1]}${t[2]}${t[3]}${t[4]}${t[5]}.eew.gif`;
}
setInterval(updateImg, 1000);
setInterval(syncntptime, 1800000);