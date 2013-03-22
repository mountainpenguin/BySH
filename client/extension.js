const St = imports.gi.St;
const Main = imports.ui.main;
const Soup = imports.gi.Soup;
const Tweener = imports.ui.tweener;
const _httpSession = new Soup.SessionSync();

let text, button;

function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _getStatus() {
    let message = Soup.Message.new("GET", "http://mpengu.in:12000/");
    _httpSession.send_message(message);
    return JSON.parse(message.response_body.data);
}

function _updateText() {
    label = button.get_children()[0];
    label.set_text(_generateText(_getStatus()));
}

function _generateText(data) {
    let text = ""; 
    text += "L: " + data.load_avg1 + ", " + data.load_avg5 + ", " + data.load_avg15;
    text += " H: " + parseInt((data.hdd_used / data.hdd_total) * 100) + "%";
    text += " M: " + parseInt((data.mem_used / data.mem_total) * 100) + "%";
    text += " U: " + _parseUptime(data.uptime);
    return text;
}

function _parseUptime(seconds) {
    var s = parseInt(seconds);
    return _toFixed((s / (60*60*24)), 1) + " days"
}

function _toFixed(value, precision) {
    var precision = precision || 0,
    neg = value < 0,
    power = Math.pow(10, precision),
    value = Math.round(value * power),
    integral = String((neg ? Math.ceil : Math.floor)(value / power)),
    fraction = String((neg ? -value : value) % power),
    padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');
    return precision ? integral + '.' +  padding + fraction : integral;
}

function init() {
    button = new St.Bin({
        style_class: 'panel-button',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true
    });
    let initial = _getStatus();
    let label = new St.Label({ "text": _generateText(_getStatus()) });
    button.set_child(label);
    button.connect("button-press-event", _updateText);
}

function enable() {
    children = Main.panel._leftBox.get_children();
    Main.panel._leftBox.insert_child_at_index(button, children.length+1);
}

function disable() {
    Main.panel._leftBox.remove_child(button);
}
