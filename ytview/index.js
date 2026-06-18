function getvideoid() {
    let id = document.getElementById("url").value;
    const id_index_start = id.indexOf("v=");
    const id_index_end = id.indexOf("&");
    if (id_index_start == -1) {
        return false;
    }
    if (id_index_end == -1) {
        id = id.substr(id_index_start + 2);
    } else {
        id = id.substr(id_index_start + 2);
        id = id.substr(0, id_index_end - id_index_start - 2);
    }
    console.log(id)
    makeplayer(id);
}
function makeplayer(videoid) {//プレーヤー設定
    const host_url = (document.getElementById("url_1").checked) ? "https://www.youtube.com/" : "https://www.youtube-nocookie.com/";
    document.getElementById("player").src = host_url + "embed/" + videoid;
}
document.getElementById("submit").addEventListener("click", getvideoid);