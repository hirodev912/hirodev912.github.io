const host_server = "https://smi.lmoniexp.bosai.go.jp/";
let timeoffset = 0;
function syncntptime() {
    fetch('https://api.wolfx.jp/ntp.json').then(r => r.json()).then(r => {
        timeoffset = r.timestamp - Date.now();
    });
}
syncntptime();
function getnowtime() {
    const realtime = new Date(new Date() - 2000 + timeoffset);
    const year = realtime.getFullYear();
    const month = ('00' + (realtime.getMonth() + 1)).slice(-2);
    const date = ('00' + realtime.getDate()).slice(-2);
    const hour = ('00' + realtime.getHours()).slice(-2);
    const minute = ('00' + realtime.getMinutes()).slice(-2);
    const second = ('00' + realtime.getSeconds()).slice(-2);
    return [year, month, date, hour, minute, second];
}
function updateImg() {
    const t = getnowtime();
    document.getElementById('time').textContent = `${t[0]}/${t[1]}/${t[2]} ${t[3]}:${t[4]}:${t[5]}`;
    document.getElementById('nied_image1').src = `${host_server}data/map_img/RealTimeImg/acmap_s/${t[0]}${t[1]}${t[2]}/${t[0]}${t[1]}${t[2]}${t[3]}${t[4]}${t[5]}.acmap_s.gif`;
    document.getElementById('nied_image2').src = `${host_server}data/map_img/RealTimeImg/acmap_b/${t[0]}${t[1]}${t[2]}/${t[0]}${t[1]}${t[2]}${t[3]}${t[4]}${t[5]}.acmap_b.gif`;
}
setInterval(updateImg, 1000);
setInterval(syncntptime, 3600000);