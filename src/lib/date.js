
function pad(num) {
    num = String(num);
    return num.length === 1 ? ('0' + num) : num;
}

exports.getLocalTime = function(d) {
    d = d || new Date();
    return d.getFullYear() +
        '-' + pad(d.getMonth() + 1) +
        '-' + pad(d.getDate()) +
        'T' + pad(d.getHours()) + 
        ':' + pad(d.getMinutes()) +
        ':' + pad(d.getSeconds()) +
        '.' + String((d.getMilliseconds()/1000).toFixed(3)).slice(2, 5) +
        'Z';
}

exports.format = function(date) {
    var dateObj = new Date(date);
    return pad(dateObj.getDate()) +
        '-' + pad((dateObj.getMonth()+1)) +
        '-' + dateObj.getFullYear() +
        ' ' + pad(dateObj.getHours()) +
        ':' + pad(dateObj.getMinutes()) +
        ':' + pad(dateObj.getSeconds());
}
