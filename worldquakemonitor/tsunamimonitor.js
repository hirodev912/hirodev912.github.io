(async () => {
    const tsunamicolor = {'Watch': '#ff0', 'Warning': '#f00', 'MajorWarning': '#a4f' };
    const tsunamiclass = { 'Watch': '津波注意報', 'Warning': '津波警報', 'MajorWarning': '大津波警報' };
    async function p2ptsunamilog() {
        const e = document.getElementById('tsunamilog');
        e.innerHTML = "<br>";
        const data = await fetch('https://api.p2pquake.net/v2/jma/tsunami', { cache: "no-store" });
        const r = await data.json();
        const t = r[0];
        if (t.areas.length !== 0) {
            for (const d of t.areas) {
                const span = document.createElement('span');
                const name = tsunamiclass[d.grade];
                const color = tsunamicolor[d.grade];
                const time = (d.firstHeight.arrivalTime !== undefined) ? d.firstHeight.arrivalTime.substr(11, 5) + "頃" : d.firstHeight.condition;
                span.innerHTML = `<span style='text-decoration: underline 2px solid ${color}'>${d.name}</span>   ${d.maxHeight.description}   ${time}<br><hr>`;
                e.appendChild(span);
            }
        } else {
            e.innerHTML = "<br>津波情報は未発表又は解除されました";
        }
    }
    await p2ptsunamilog();
})();