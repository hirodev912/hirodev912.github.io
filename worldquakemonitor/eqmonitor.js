(async () => {
    const eqm_backColor = { "1": "rgb(142, 142, 155)", "2": "rgb(0, 170, 255)", "3": "rgb(0, 65, 255)", "4": "rgb(250, 160, 110)", "5-": "rgb(255, 120, 0)", "5+": "rgb(230, 90, 0)", "6-": "rgb(255, 40, 0)", "6+": "rgb(165, 0, 33)", "7": "rgb(180, 0, 104)" };
    const map = L.map('map').setView([38.40, 136], 5);
    const eqlayer = L.layerGroup().addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    async function jmaeqlog() {
        const e = document.getElementById('eqlog');
        const data = await fetch('https://www.jma.go.jp/bosai/quake/data/list.json', { cache: "no-store" });
        const r = await data.json();
        e.innerHTML = "";
        const count_date = {};
        const count_magnitude = {};
        let cumulative = 0;
        const count_shindo = { "1": 0, "2": 0, "3": 0, "4": 0, "5-": 0, "5+": 0, "6-": 0, "6+": 0, "7": 0 };
        let count_total = 0;
        const graph1 = document.getElementById('tokei_graph1').getContext('2d');
        const graph2 = document.getElementById('tokei_graph2').getContext('2d');
        const graph3 = document.getElementById('tokei_graph3').getContext('2d');
        const graph4 = document.getElementById('tokei_graph4').getContext('2d');
        for (const d of r) {
            if (d.ttl == "震源・震度情報" || d.ttl == "震源に関する情報" || d.ttl == "震度速報") {
                let text = "";
                const mag = d.mag;
                const time = d.eid.substr(6, 2) + "日" + d.eid.substr(8, 2) + "時" + d.eid.substr(10, 2) + "分";
                text = "<hr>" + time + " " + d.anm + " 最大震度" + ((d.maxi !== "") ? d.maxi.replace('-', '弱').replace('+', '強') : "不明") + " M" + ((mag !== "") ? mag : "不明");
                e.innerHTML += text;
                if (d.ttl == "震源・震度情報") {
                    const latitude = Number(d.cod.substr(1, 4));
                    const longitude = Number(d.cod.substr(6, 5));
                    const date = d.eid.substr(4, 2) + d.eid.substr(6, 2);
                    const maxi = d.maxi;
                    if (count_date[date] == null) count_date[date] = 0;
                    count_date[date]++;
                    count_total++;
                    if (count_shindo[maxi] == null)  count_shindo[maxi] = 0;
                    if (count_magnitude[mag.substr(0, 1)] == null || count_magnitude[mag.substr(0, 1)] == undefined) count_magnitude[mag.substr(0, 1)] = 0;
                    count_magnitude[mag.substr(0, 1)] ++;
                    count_shindo[maxi]++;
                    L.circle([latitude, longitude], {
                        radius: 1000 + mag * 5000,
                        color: eqm_backColor[d.maxi],
                        fillColor: eqm_backColor[d.maxi],
                        fillOpacity: 0.5
                    }).addTo(eqlayer).bindPopup(text);
                }
            }
        }
        const date_now = ('00' + (new Date().getMonth() + 1)).slice(-2) + ('00' + new Date().getDate()).slice(-2);
        if (count_date[date_now] == null || count_date[date_now] == undefined) count_date[date_now] = 0;
        let date_yesterday = new Date();
        date_yesterday.setDate(date_yesterday.getDate() - 1);
        date_yesterday = ('00' + (date_yesterday.getMonth() + 1)).slice(-2) + ('00' + date_yesterday.getDate()).slice(-2);
        if (count_date[date_yesterday] == null || count_date[date_yesterday] == undefined) {
            count_date[date_yesterday] = 0;
        }
        let date_before_yesterday = new Date();
        date_before_yesterday.setDate(date_before_yesterday.getDate() - 2);
        date_before_yesterday = ('00' + (date_before_yesterday.getMonth() + 1)).slice(-2) + ('00' + date_before_yesterday.getDate()).slice(-2);
        if (count_date[date_before_yesterday] == null || count_date[date_before_yesterday] == undefined) {
            count_date[date_before_yesterday] = 0;
        }
        const count_comp = count_date[date_now] - count_date[date_yesterday];
        document.getElementById('count_today').innerHTML = "今日:<span style='font-size: 36px;'>" + count_date[date_now] + "</span>回<br>昨日:<span style='font-size: 36px;'>" + count_date[date_yesterday] + "</span>回<br>一昨日:<span style='font-size: 36px;'>" + count_date[date_before_yesterday] + "</span>回<br>前日比:<span style='font-size: 36px;'>" + ((count_comp > 0) ? "+" : "") + count_comp + "</span>回";
        document.getElementById('count_total').innerHTML = "合計:<span style='font-size: 36px;'>" + count_total + `</span>回<br>震度1:${count_shindo['1']}回<br>震度2:${count_shindo['2']}回<br>震度3:${count_shindo['3']}回<br>震度4:${count_shindo['4']}回<br>震度5弱:${count_shindo['5-']}回<br>震度5強:${count_shindo['5+']}回<br>震度6弱:${count_shindo['6-']}回<br>震度6強:${count_shindo['6+']}回<br>震度7:${count_shindo['7']}回`;
        let last_y = 190;
        let last_y2 = 190;
        graph1.clearRect(0, 0, 223, 205);
        graph3.clearRect(0, 0, 223, 205);
        for (let i = 0; i < 193; i += 16) {
            graph1.font = '10px "SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace';
            graph1.fillStyle = "#fff";
            graph1.fillText(i, 0, 193 - i);
            graph1.strokeStyle = "#fff";
            graph1.beginPath();
            graph1.moveTo(10 + (i > 99) * 5, 190 - i);
            graph1.lineTo(223, 190 - i);
            graph1.stroke();
            graph3.font = '10px "SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace';
            graph3.fillStyle = "#fff";
            graph3.fillText(Math.round(count_total * (i / 180)), 0, 193 - i);
            graph3.strokeStyle = "#fff";
            graph3.beginPath();
            graph3.moveTo(10 + (i > 99) * 5, 190 - i);
            graph3.lineTo(223, 190 - i);
            graph3.stroke();
        }
        for (let i = -30; i < 1; i++) {
            let date_shift = new Date();
            date_shift.setDate(date_shift.getDate() + i);
            date_shift = ('00' + (date_shift.getMonth() + 1)).slice(-2) + ('00' + date_shift.getDate()).slice(-2);
            if (count_date[date_shift] == null || count_date[date_shift] == undefined) {
                count_date[date_shift] = 0;
            }
            if (((i + 30) % 5) == 2) {
                graph1.fillText(date_shift.substr(0, 2) + "/" + date_shift.substr(2, 2), (i + 30) * 7.43 - 12, 205);
                graph3.fillText(date_shift.substr(0, 2) + "/" + date_shift.substr(2, 2), (i + 30) * 7.43 - 12, 205);
            }
            cumulative += count_date[date_shift];
            graph1.stroke();
            graph1.strokeStyle = "#2f2";
            graph1.beginPath();
            graph1.moveTo((i + 30) * 7, last_y);
            graph1.lineTo((i + 30) * 7 + 7, 190 - count_date[date_shift]);
            last_y = 190 - count_date[date_shift];
            graph1.stroke();
            graph3.stroke();
            graph3.strokeStyle = "#2f2";
            graph3.beginPath();
            graph3.moveTo((i + 30) * 7, last_y2);
            graph3.lineTo((i + 30) * 7 + 7, 190 - (190 * (cumulative / count_total)));
            last_y2 = 190 - (190 * (cumulative / count_total));
            graph3.stroke();
        }
        graph2.clearRect(0, 0, 223, 205);
        graph4.clearRect(0, 0, 223, 205);
        let o = 0;
        for (const i of ['1', '2', '3', '4', '5-', '5+', '6-', '6+', '7']) {
            graph2.fillStyle = eqm_backColor[i];
            const ratio = count_shindo[i] / count_total;
            graph2.fillRect(o * 24, 190 * (1 - ratio), 22, 190 * ratio);
            graph2.fillStyle = "#fff";
            graph2.font = '13px "SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace';
            graph2.fillText(Math.ceil(ratio * 100) + "%", o * 24, 204);
            o++;
        }
        for (let i = 0; i < 10; i++) {
            if (count_magnitude[i] == undefined || count_magnitude[i] == null) count_magnitude[i] = 0;
            graph4.fillStyle = "#fff";
            graph4.font = '13px "SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace';
            graph4.fillText("M" + i + "~", i * 22, 204);
            graph4.fillRect(i * 22, 190 * (1 - count_magnitude[i] / count_total), 19, 190 * count_magnitude[i] / count_total);
            graph4.fillStyle = "lightblue";
            graph4.fillText(Math.round((count_magnitude[i] / count_total) * 100) + "%", i * 22, 10);
        }
    }
    async function usgseqlog() {
        const e = document.getElementById('usgslog');
        const data = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson', { cache: "no-store" });
        const r = await data.json();
        e.innerHTML = "";
        for (const d of r.features) {
            const span = document.createElement('span');
            const mag = (Math.round(d.properties.mag * 10)) / 10;
            const fontcolor = (mag > 6.9) ? "#f00" : (mag > 5.9) ? "#ff0" : "#fff";
            span.style.color = fontcolor;
            span.innerHTML = "<hr>" + d.properties.title;
            e.append(span);
            L.circle([d.geometry.coordinates[1], d.geometry.coordinates[0]], {
                radius: 1000 + mag * 5000,
                color: '#fff',
                fillColor: '#fff',
                fillOpacity: 0.5
            }).addTo(eqlayer).bindPopup(d.properties.title);
        }
    }
    setInterval(async function () {
        eqlayer.clearLayers();
        await jmaeqlog();
        await usgseqlog();
    }, 60000);
    eqlayer.clearLayers();
    await jmaeqlog();
    await usgseqlog();
})();