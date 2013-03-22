const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Soup = imports.gi.Soup;
const Tweener = imports.ui.tweener;
const _httpSession = new Soup.SessionAsync();

let text, button;

function _getStatusRepeat() {
    _getStatus();
    Mainloop.timeout_add_seconds(10, _getStatusRepeat);
}

function _getStatus() {
    let message = Soup.Message.new("GET", "http://mpengu.in:12000/");
    _httpSession.queue_message(message, function(session, message) {
        var j = JSON.parse(message.response_body.data);
        var text = _generateText(j); 
        _updateText(text);
    });
}

function _updateText(text) {
    button.destroy_all_children();
    button.set_child(text);
}

function _generateText(data) {
    var hdd_perc = parseInt((data.hdd_used / data.hdd_total) * 100);
    var hdd = new St.BoxLayout({style_class:"BySH-hdd-status"});
    var hddIcon = new St.Icon({ icon_name: "drive-harddisk-system-symbolic", style_class: "system-status-icon BySH-icon" });
    var hddText = new St.Label({"text": hdd_perc + "%"});
    if (hdd_perc > 90) {
        hddIcon.style_class += " red";
    } else if (hdd_perc > 70) {
        hddIcon.style_class += " orange";
    } else {
        hddIcon.style_class += " green";
    }
    hdd.add_actor(hddIcon);
    hdd.add_actor(hddText);

    var mem_perc = parseInt((data.mem_used / data.mem_total) * 100);
    var mem = new St.BoxLayout({style_class:"BySH-mem-status"});
    var memIcon = new St.Icon({ icon_name: "system-run-symbolic", style_class: "system-status-icon BySH-icon" });
    var memText = new St.Label({"text": mem_perc + "%"});
    if (mem_perc > 80) {
        memIcon.style_class += " red";
    } else if (mem_perc > 50) {
        memIcon.style_class += " orange";
    } else {
        memIcon.style_class += " green";
    }
    mem.add_actor(memIcon);
    mem.add_actor(memText);

    var load = new St.BoxLayout({style_class:"BySH-load-status"});
    var loadIcon = new St.Icon({ icon_name: "utilities-system-monitor-symbolic", style_class: "system-status-icon BySH-icon" });
    var loadText = new St.Label({"text": data.load_avg1 + ", " + data.load_avg5 + ", " + data.load_avg15}); 
    if (data.load_avg1 > 2.0) {
        loadIcon.style_class += " red";
    } else if (data.load_avg1 > 1.0) {
        loadIcon.style_class += " orange";
    } else {
        loadIcon.style_class += " green";
    }
    load.add_actor(loadIcon);
    load.add_actor(loadText);

    var container = new St.BoxLayout(); 
    container.add_actor(hdd);
    container.add_actor(mem);
    container.add_actor(load);
    return container;
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
    let label = new St.Label({ "text": "Loading..." });
    button.set_child(label);
    _getStatus();
    button.connect("button-press-event", _getStatus);
}

function enable() {
    children = Main.panel._leftBox.get_children();
    Main.panel._leftBox.insert_child_at_index(button, children.length+1);
    Mainloop.timeout_add_seconds(10, _getStatusRepeat);
}

function disable() {
    Main.panel._leftBox.remove_child(button);
}
