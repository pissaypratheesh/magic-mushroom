export function isPassiveSupported() {
    let passiveSupported = false;
    try {
    let options = Object.defineProperty({}, "passive", {
        get: function() {
        passiveSupported = true;
        }
    });

    window.addEventListener("test", null, options);
    return true;
    } catch(err) {
        return false;
    }
}