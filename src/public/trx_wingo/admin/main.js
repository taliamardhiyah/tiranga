

$(window).on('load', function () {
    setTimeout(() => {
        $('#preloader').fadeOut(0);
    }, 100);
})
$(document).ready(function () {
    $(`a[href="${window.location.pathname}"]`).addClass('active');
    $(`a[href="${window.location.pathname}"]`).css('pointerEvents', 'none');
});

$('.back-to-tops').click(function() {
    $('html, body').animate({
      scrollTop: 0
    }, 800);
    return false;

});

function formatMoney(money) {
    return String(money).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

let checkID = $('html').attr('data-change');
let i = 0;
if(checkID == 1) i = 1;
if(checkID == 2) i = 3;
if(checkID == 3) i = 5;
if(checkID == 4) i = 10;
function cownDownTimer() {
    var countDownDate = new Date("2030-07-16T23:59:59.9999999+01:00").getTime();
    setInterval(function () {
        let checkID = $('html').attr('data-change');
        var now = new Date().getTime();
        var distance = countDownDate - now;
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var minute = Math.ceil(minutes % Number(checkID));
        var seconds1 = Math.floor((distance % (1000 * 60)) / 10000);
        var seconds2 = Math.floor(((distance % (1000 * 60)) / 1000) % 10);
        if(checkID != 1) {
            $(".time .time-sub:eq(1)").text(minute);
        }
        else{
            $(".time .time-sub:eq(1)").text(0);
        }
        $(".time .time-sub:eq(2)").text(seconds1);
        $(".time .time-sub:eq(3)").text(seconds2);
    }, 0);
}
cownDownTimer();

// -------------------------------------------------------------------------------------

var socket = io();
let typeid = $('html').attr('data-change');
let game = '';
if (typeid == '1') game = 'trx_wingo';
if (typeid == '2') game = 'trx_wingo3';
if (typeid == '3') game = 'trx_wingo5';
if (typeid == '4') game = 'trx_wingo10';
//$(`.container-fluid:eq(1) .row:eq(0) .info-box-content:eq(${Number(typeid) - 1}) .info-box-text`).css('color', '#e67e22');

function formatMoney(money, type) {
    return String(money).replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${type}`);
}

function formateT(params) {
    let result = (params < 10) ? "0" + params : params;
    return result;
}

function timerJoin(params = '', addHours = 0) {
    let date = '';
        if (params) {
            date = new Date(Number(params));
        } else {
            date = new Date();
        }
    
        date.setHours(date.getHours() + addHours);
    
        let years = formateT(date.getFullYear());
        let months = formateT(date.getMonth() + 1);
        let days = formateT(date.getDate());
    
        let hours = date.getHours() % 12;
        hours = hours === 0 ? 12 : hours;
        let ampm = date.getHours() < 12 ? "AM" : "PM";
    
        let minutes = formateT(date.getMinutes());
        let seconds = formateT(date.getSeconds());
    
        return years + '-' + months + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
}
const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
}

$('#manage .col-12').click(async function (e) {
    e.preventDefault();
    $('#preloader').fadeIn(0);
    $('#list-orders-hash').html('');
    let game = $(this).attr('data');
    $('html').attr('data-change', game);
    $(".direct-chat-msg").html('');
    $('.info-box-number').text('0');
    cownDownTimer();
    $.ajax({
        type: "POST",
        url: "/api/webapi/admin/totalJoin_trx",
        data: {
            typeid: game,
        },
        dataType: "json",
        success: function (response) {
            var red = 0;
            var green = 0;
            var violet = 0;
            var n0 = 0;
            var n1 = 0;
            var n2 = 0;
            var n3 = 0;
            var n4 = 0;
            var n5 = 0;
            var n6 = 0;
            var n7 = 0;
            var n8 = 0;
            var n9 = 0;
            var n = 0;
            var l = 0;
            var ns = 0;
            var length = response.datas.length;
            var datas = response.datas;
            for (let i = 0; i < length; i++) {
                if (datas[i].bet == '0') n0 += parseInt(datas[i].money);
                if (datas[i].bet == '1') n1 += parseInt(datas[i].money);
                if (datas[i].bet == '2') n2 += parseInt(datas[i].money);
                if (datas[i].bet == '3') n3 += parseInt(datas[i].money);
                if (datas[i].bet == '4') n4 += parseInt(datas[i].money);
                if (datas[i].bet == '5') n5 += parseInt(datas[i].money);
                if (datas[i].bet == '6') n6 += parseInt(datas[i].money);
                if (datas[i].bet == '7') n7 += parseInt(datas[i].money);
                if (datas[i].bet == '8') n8 += parseInt(datas[i].money);
                if (datas[i].bet == '9') n9 += parseInt(datas[i].money);
                if (datas[i].bet == 'x') green += parseInt(datas[i].money);
                if (datas[i].bet == 't') violet += parseInt(datas[i].money);
                if (datas[i].bet == 'd') red += parseInt(datas[i].money);
                if (datas[i].bet == 'l') l += parseInt(datas[i].money);
                if (datas[i].bet == 'n') n += parseInt(datas[i].money);
            }
            ns = n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9;
            $('.orderRed').text(formatMoney(red, ','));
            $('.orderViolet').text(formatMoney(violet, ','));
            $('.orderGreen').text(formatMoney(green, ','));
            $('.orderNumber:eq(0)').text(formatMoney(n0, ','));
            $('.orderNumber:eq(1)').text(formatMoney(n1, ','));
            $('.orderNumber:eq(2)').text(formatMoney(n2, ','));
            $('.orderNumber:eq(3)').text(formatMoney(n3, ','));
            $('.orderNumber:eq(4)').text(formatMoney(n4, ','));
            $('.orderNumber:eq(5)').text(formatMoney(n5, ','));
            $('.orderNumber:eq(6)').text(formatMoney(n6, ','));
            $('.orderNumber:eq(7)').text(formatMoney(n7, ','));
            $('.orderNumber:eq(8)').text(formatMoney(n8, ','));
            $('.orderNumber:eq(9)').text(formatMoney(n9, ','));
            $('.orderNumber:eq(10)').text(formatMoney(l, ','));
            $('.orderNumber:eq(11)').text(formatMoney(n, ','));
            $('.orderNumbers').text(formatMoney(ns, ','));

            $('.orderRed').attr('totalmoney', red);
            $('.orderViolet').attr('totalmoney', violet);
            $('.orderGreen').attr('totalmoney', green);
            $('.orderNumber:eq(0)').attr('totalmoney', n0);
            $('.orderNumber:eq(1)').attr('totalmoney', n1);
            $('.orderNumber:eq(2)').attr('totalmoney', n2);
            $('.orderNumber:eq(3)').attr('totalmoney', n3);
            $('.orderNumber:eq(4)').attr('totalmoney', n4);
            $('.orderNumber:eq(5)').attr('totalmoney', n5);
            $('.orderNumber:eq(6)').attr('totalmoney', n6);
            $('.orderNumber:eq(7)').attr('totalmoney', n7);
            $('.orderNumber:eq(8)').attr('totalmoney', n8);
            $('.orderNumber:eq(9)').attr('totalmoney', n9);
            $('.orderNumber:eq(10)').attr('totalmoney', l);
            $('.orderNumber:eq(11)').attr('totalmoney', n);
            $('.orderNumbers').attr('totalmoney', ns);

            response.datas.map((data) => {
                showJoinMember(data);
            });
            showListOrder3(response.list_orders);
            $(".direct-chat-warning .direct-chat-messages").animate({
                scrollTop: $(".direct-chat-msg").prop("scrollHeight")
            }, 750);
            $('.reservation-chunk-sub-num').text(response.lotterys[0].period);
            let is = ''
            if (typeid == '1') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo1 == '-1') ? 'Random' : response.setting[0].wingo1}`);
            if (typeid == '2') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo3 == '-1') ? 'Random' : response.setting[0].wingo3}`);
            if (typeid == '3') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo5 == '-1') ? 'Random' : response.setting[0].wingo5}`);
            if (typeid == '4') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo10 == '-1') ? 'Random' : response.setting[0].wingo10}`);
            
            if (typeid == '1') $('#winrate').text(`Next Result: ${(response.setting[0].bs1 == '-1') ? 'Random' : response.setting[0].bs1}`);
            if (typeid == '2') $('#winrate').text(`Next Result: ${(response.setting[0].bs3 == '-1') ? 'Random' : response.setting[0].bs3}`);
            if (typeid == '3') $('#winrate').text(`Next Result: ${(response.setting[0].bs5 == '-1') ? 'Random' : response.setting[0].bs5}`);
            if (typeid == '4') $('#winrate').text(`Next Result: ${(response.setting[0].bs10 == '-1') ? 'Random' : response.setting[0].bs10}`);
        }
    });
    $('#manage .col-12').removeClass('block-click');
    $(this).addClass('block-click');
    $('#manage .col-12').find('.info-box-content').removeClass('active-game');
    $(this).find('.info-box-content').addClass('active-game');
    $('#preloader').fadeOut(0);
});

function showJoinMember(data) {
    var game = 0;
    $('.direct-chat-msg').html("");
    if (data.game.toString().trim() == 'trx_wingo') game = 1;
    if (data.game.toString().trim() == 'trx_wingo3') game = 3;
    if (data.game.toString().trim() == 'trx_wingo5') game = 5;
    if (data.game.toString().trim() == 'trx_wingo10') game = 10;
    if(parseInt(game) == $('html').attr('data-change'))
    {
        let phone = data.phone;
        let bet = data.bet;
        let money = formatMoney(data.money + data.fee, ',');
        let name = data.bet;
        let time = timerJoin(data.time);
        let result = '';
        result += `
        <div class="direct-chat-infos clearfix">
            <span class="direct-chat-name float-left"></span>
            <span class="direct-chat-timestamp float-right text-primary">${time}</span>
        </div>
        <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
        <div class="direct-chat-text" style="background-color: ${(isNumber(bet)) ? '#007acc' : (bet == 'x') ? '#1eb93d' : (bet == 'd') ? '#f52828' : (bet == 't') ? '#ea3af0' : (bet == 'l') ? '#ffc511' : '#5cba47'}">
            Join ${((isNumber(bet)) ? bet : (bet == 'd') ? 'Red' : (bet == 'x') ? 'Green' : (bet == 't') ? 'Violet' : (bet == 'l') ? 'Big' : 'Small')} ${money}
        </div>`;
        $('.direct-chat-msg').append(result);
    }
}

function showJoinMember2(data) {
    if(parseInt(data.game) == $('html').attr('data-change'))
    {
        if (data.change == 1) return;
        let bet = data.join;
        let money = formatMoney(data.bet_amount, ',');
        let name = data.bet;
        let time = timerJoin(data.time);
        let result = '';
        result += `
          <div class="direct-chat-infos clearfix">
            <span class="direct-chat-name float-left"></span>
            <span class="direct-chat-timestamp float-right text-primary">${time}</span>
          </div>
          <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
          <div class="direct-chat-text" style="background-color: ${(isNumber(bet)) ? '#007acc' : (bet == 'x') ? '#1eb93d' : (bet == 'd') ? '#f52828' : (bet == 't') ? '#ea3af0' : (bet == 'l') ? '#ffc511' : '#5cba47'}">
            Join ${((isNumber(bet)) ? bet : (bet == 'd') ? 'Red' : (bet == 'x') ? 'Green' : (bet == 't') ? 'Violet' : (bet == 'l') ? 'Big' : 'Small')} ${money}
          </div>`;
        $('.direct-chat-msg').append(result);
    }
}


socket.on("data-server_trx", function (msg) {
    showJoinMember2(msg);  
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
    if (msg.level == 1) return;
    var red = Number($('.orderRed').attr('totalmoney'));
    var green = Number($('.orderViolet').attr('totalmoney'));
    var violet = Number($('.orderGreen').attr('totalmoney'));
    var n0 = Number($('.orderNumber:eq(0)').attr('totalmoney'));
    var n1 = Number($('.orderNumber:eq(1)').attr('totalmoney'));
    var n2 = Number($('.orderNumber:eq(2)').attr('totalmoney'));
    var n3 = Number($('.orderNumber:eq(3)').attr('totalmoney'));
    var n4 = Number($('.orderNumber:eq(4)').attr('totalmoney'));
    var n5 = Number($('.orderNumber:eq(5)').attr('totalmoney'));
    var n6 = Number($('.orderNumber:eq(6)').attr('totalmoney'));
    var n7 = Number($('.orderNumber:eq(7)').attr('totalmoney'));
    var n8 = Number($('.orderNumber:eq(8)').attr('totalmoney'));
    var n9 = Number($('.orderNumber:eq(9)').attr('totalmoney'));
    var n = Number($('.orderNumber:eq(10)').attr('totalmoney'));
    var l = Number($('.orderNumber:eq(11)').attr('totalmoney'));
    var ns = Number($('.orderNumbers').attr('totalmoney', ns));

    // if (msg.join == '0') n0 += msg.money - (msg.money * 0.02);
    // if (msg.join == '1') n1 += msg.money - (msg.money * 0.02);
    // if (msg.join == '2') n2 += msg.money - (msg.money * 0.02);
    // if (msg.join == '3') n3 += msg.money - (msg.money * 0.02);
    // if (msg.join == '4') n4 += msg.money - (msg.money * 0.02);
    // if (msg.join == '5') n5 += msg.money - (msg.money * 0.02);
    // if (msg.join == '6') n6 += msg.money - (msg.money * 0.02);
    // if (msg.join == '7') n7 += msg.money - (msg.money * 0.02);
    // if (msg.join == '8') n8 += msg.money - (msg.money * 0.02);
    // if (msg.join == '9') n9 += msg.money - (msg.money * 0.02);
    // if (msg.join == 'x') green += msg.money - (msg.money * 0.02);
    // if (msg.join == 't') violet += msg.money - (msg.money * 0.02);
    // if (msg.join == 'd') red += msg.money - (msg.money * 0.02);
    // if (msg.join == 'l') l += msg.money - (msg.money * 0.02);
    // if (msg.join == 'n') n += msg.money - (msg.money * 0.02);
    // ns = n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9;


    if (msg.join == '0') n0 += msg.money;
    if (msg.join == '1') n1 += msg.money;
    if (msg.join == '2') n2 += msg.money;
    if (msg.join == '3') n3 += msg.money;
    if (msg.join == '4') n4 += msg.money;
    if (msg.join == '5') n5 += msg.money;
    if (msg.join == '6') n6 += msg.money;
    if (msg.join == '7') n7 += msg.money;
    if (msg.join == '8') n8 += msg.money;
    if (msg.join == '9') n9 += msg.money;
    if (msg.join == 'x') green += msg.money;
    if (msg.join == 't') violet += msg.money;
    if (msg.join == 'd') red += msg.money;
    if (msg.join == 'l') l += msg.money;
    if (msg.join == 'n') n += msg.money;
    ns = n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9;

    $('.orderRed').text(formatMoney(red, ','));
    $('.orderViolet').text(formatMoney(violet, ','));
    $('.orderGreen').text(formatMoney(green, ','));
    $('.orderNumber:eq(0)').text(formatMoney(n0, ','));
    $('.orderNumber:eq(1)').text(formatMoney(n1, ','));
    $('.orderNumber:eq(2)').text(formatMoney(n2, ','));
    $('.orderNumber:eq(3)').text(formatMoney(n3, ','));
    $('.orderNumber:eq(4)').text(formatMoney(n4, ','));
    $('.orderNumber:eq(5)').text(formatMoney(n5, ','));
    $('.orderNumber:eq(6)').text(formatMoney(n6, ','));
    $('.orderNumber:eq(7)').text(formatMoney(n7, ','));
    $('.orderNumber:eq(8)').text(formatMoney(n8, ','));
    $('.orderNumber:eq(9)').text(formatMoney(n9, ','));
    $('.orderNumber:eq(10)').text(formatMoney(l, ','));
    $('.orderNumber:eq(11)').text(formatMoney(n, ','));
    $('.orderNumbers').text(formatMoney(ns, ','));

    $('.orderRed').attr('totalmoney', red);
    $('.orderViolet').attr('totalmoney', green);
    $('.orderGreen').attr('totalmoney', violet);
    $('.orderNumber:eq(0)').attr('totalmoney', n0);
    $('.orderNumber:eq(1)').attr('totalmoney', n1);
    $('.orderNumber:eq(2)').attr('totalmoney', n2);
    $('.orderNumber:eq(3)').attr('totalmoney', n3);
    $('.orderNumber:eq(4)').attr('totalmoney', n4);
    $('.orderNumber:eq(5)').attr('totalmoney', n5);
    $('.orderNumber:eq(6)').attr('totalmoney', n6);
    $('.orderNumber:eq(7)').attr('totalmoney', n7);
    $('.orderNumber:eq(8)').attr('totalmoney', n8);
    $('.orderNumber:eq(9)').attr('totalmoney', n9);
    $('.orderNumber:eq(10)').attr('totalmoney', n);
    $('.orderNumber:eq(11)').attr('totalmoney', l);
    $('.orderNumbers').attr('totalmoney', ns);
});

function showListOrder4(list_orders, x) {
    let htmls = "";
    let result = list_orders.map((list_orders) => {
        return (htmls += `
                    <div data-v-a9660e98="" class="c-tc item van-row">
                        <div data-v-a9660e98="" class="van-col van-col--8">
                            <div data-v-a9660e98="" class="c-tc goItem">${list_orders.period}</div>
                        </div>
                        <div data-v-a9660e98="" class="van-col van-col--5">
                            <div data-v-a9660e98="" class="c-tc goItem">
                                <!---->
                                <span data-v-a9660e98="" class="${list_orders.result % 2 == 0 ? "red" : "green"}"> ${list_orders.result} </span>
                            </div>
                        </div>
                        <div data-v-a9660e98="" class="van-col van-col--5">
                            <div data-v-a9660e98="" class="c-tc goItem">
                                <span data-v-a9660e98=""> ${list_orders.result < 5 ? "Small" : "Big"} </span>
                                <!---->
                            </div>
                        </div>
                        <div data-v-a9660e98="" class="van-col van-col--6">
                            <div data-v-a9660e98="" class="goItem c-row c-tc c-row-center">
                                <div data-v-a9660e98="" class="c-tc c-row box c-row-center">
                                    <span data-v-a9660e98="" class="li ${list_orders.result % 2 == 0 ? "red" : "green"}"></span>
                                    ${list_orders.result == 0 || list_orders.result == 5 ? '<span data-v-a9660e98="" class="li violet"></span>' : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    `);
    });
    $(`#list-orders`).html(htmls);
}


socket.on("data-server-trx-wingo", function (msg) {
    if (msg.data[0].game != game) return;
    $(".direct-chat-msg").html('');
    $('.info-box-number').text('0');
    let data1 = msg.data[0]; // lấy ra cầu mới nhất
    $(".reservation-chunk-sub-num").text(data1.period);
    let data2 = []; // lấy ra cầu cũ
    let data3 = data2.push(msg.data[1]);
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
    $.ajax({
        type: "POST",
        url: "/api/webapi/admin/totalJoin_trx",
        data: {
            typeid: typeid,
        },
        dataType: "json",
        success: function (response) {
            var red = 0;
            var green = 0;
            var violet = 0;
            var n0 = 0;
            var n1 = 0;
            var n2 = 0;
            var n3 = 0;
            var n4 = 0;
            var n5 = 0;
            var n6 = 0;
            var n7 = 0;
            var n8 = 0;
            var n9 = 0;
            var n = 0;
            var l = 0;
            var ns = 0;
            var length = response.datas.length;
            var datas = response.datas;
            for (let i = 0; i < length; i++) {
                if (datas[i].bet == '0') n0 += parseInt(datas[i].money);
                if (datas[i].bet == '1') n1 += parseInt(datas[i].money);
                if (datas[i].bet == '2') n2 += parseInt(datas[i].money);
                if (datas[i].bet == '3') n3 += parseInt(datas[i].money);
                if (datas[i].bet == '4') n4 += parseInt(datas[i].money);
                if (datas[i].bet == '5') n5 += parseInt(datas[i].money);
                if (datas[i].bet == '6') n6 += parseInt(datas[i].money);
                if (datas[i].bet == '7') n7 += parseInt(datas[i].money);
                if (datas[i].bet == '8') n8 += parseInt(datas[i].money);
                if (datas[i].bet == '9') n9 += parseInt(datas[i].money);
                if (datas[i].bet == 'x') green += parseInt(datas[i].money);
                if (datas[i].bet == 't') violet += parseInt(datas[i].money);
                if (datas[i].bet == 'd') red += parseInt(datas[i].money);
                if (datas[i].bet == 'l') l += parseInt(datas[i].money);
                if (datas[i].bet == 'n') n += parseInt(datas[i].money);
            }
            ns = n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9;
            $('.orderRed').text(formatMoney(red, ','));
            $('.orderViolet').text(formatMoney(violet, ','));
            $('.orderGreen').text(formatMoney(green, ','));
            $('.orderNumber:eq(0)').text(formatMoney(n0, ','));
            $('.orderNumber:eq(1)').text(formatMoney(n1, ','));
            $('.orderNumber:eq(2)').text(formatMoney(n2, ','));
            $('.orderNumber:eq(3)').text(formatMoney(n3, ','));
            $('.orderNumber:eq(4)').text(formatMoney(n4, ','));
            $('.orderNumber:eq(5)').text(formatMoney(n5, ','));
            $('.orderNumber:eq(6)').text(formatMoney(n6, ','));
            $('.orderNumber:eq(7)').text(formatMoney(n7, ','));
            $('.orderNumber:eq(8)').text(formatMoney(n8, ','));
            $('.orderNumber:eq(9)').text(formatMoney(n9, ','));
            $('.orderNumber:eq(10)').text(formatMoney(l, ','));
            $('.orderNumber:eq(11)').text(formatMoney(n, ','));
            $('.orderNumbers').text(formatMoney(ns, ','));

            $('.orderRed').attr('totalmoney', red);
            $('.orderViolet').attr('totalmoney', violet);
            $('.orderGreen').attr('totalmoney', green);
            $('.orderNumber:eq(0)').attr('totalmoney', n0);
            $('.orderNumber:eq(1)').attr('totalmoney', n1);
            $('.orderNumber:eq(2)').attr('totalmoney', n2);
            $('.orderNumber:eq(3)').attr('totalmoney', n3);
            $('.orderNumber:eq(4)').attr('totalmoney', n4);
            $('.orderNumber:eq(5)').attr('totalmoney', n5);
            $('.orderNumber:eq(6)').attr('totalmoney', n6);
            $('.orderNumber:eq(7)').attr('totalmoney', n7);
            $('.orderNumber:eq(8)').attr('totalmoney', n8);
            $('.orderNumber:eq(9)').attr('totalmoney', n9);
            $('.orderNumber:eq(10)').attr('totalmoney', l);
            $('.orderNumber:eq(11)').attr('totalmoney', n);
            $('.orderNumbers').attr('totalmoney', ns);

            response.datas.map((data) => {
                showJoinMember(data);
            });
            showListOrder3(response.list_orders);
            $(".direct-chat-warning .direct-chat-messages").animate({
                scrollTop: $(".direct-chat-msg").prop("scrollHeight")
            }, 750);
            $('.reservation-chunk-sub-num').text(response.lotterys[0].period);
            let is = ''
            if (typeid == '1') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo1 == '-1') ? 'Random' : response.setting[0].wingo1}`);
            if (typeid == '2') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo3 == '-1') ? 'Random' : response.setting[0].wingo3}`);
            if (typeid == '3') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo5 == '-1') ? 'Random' : response.setting[0].wingo5}`);
            if (typeid == '4') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo10 == '-1') ? 'Random' : response.setting[0].wingo10}`);
            
            if (typeid == '1') $('#winrate').text(`Next Result: ${(response.setting[0].bs1 == '-1') ? 'Random' : response.setting[0].bs1}`);
            if (typeid == '2') $('#winrate').text(`Next Result: ${(response.setting[0].bs3 == '-1') ? 'Random' : response.setting[0].bs3}`);
            if (typeid == '3') $('#winrate').text(`Next Result: ${(response.setting[0].bs5 == '-1') ? 'Random' : response.setting[0].bs5}`);
            if (typeid == '4') $('#winrate').text(`Next Result: ${(response.setting[0].bs10 == '-1') ? 'Random' : response.setting[0].bs10}`);
        }
    });
});
function showListOrder3(list_orders, x) {
    let htmls = "";
    let result = list_orders.map((list_orders) => {
        return (htmls += `
                    <div data-v-a9660e98="" class="c-tc item van-row">
                        <div data-v-a9660e98="" class="van-col van-col--8">
                            <div data-v-a9660e98="" class="c-tc goItem">${list_orders.period}</div>
                        </div>
                        <div data-v-a9660e98="" class="van-col van-col--5">
                            <div data-v-a9660e98="" class="c-tc goItem">
                                <!---->
                                <span data-v-a9660e98="" class="${list_orders.result % 2 == 0 ? "red" : "green"}"> ${list_orders.result} </span>
                            </div>
                        </div>
                        <div data-v-a9660e98="" class="van-col van-col--5">
                            <div data-v-a9660e98="" class="c-tc goItem">
                                <span data-v-a9660e98=""> ${list_orders.result < 5 ? "Small" : "Big"} </span>
                                <!---->
                            </div>
                        </div>
                        <div data-v-a9660e98="" class="van-col van-col--6">
                            <div data-v-a9660e98="" class="goItem c-row c-tc c-row-center">
                                <div data-v-a9660e98="" class="c-tc c-row box c-row-center">
                                    <span data-v-a9660e98="" class="li ${list_orders.result % 2 == 0 ? "red" : "green"}"></span>
                                    ${list_orders.result == 0 || list_orders.result == 5 ? '<span data-v-a9660e98="" class="li violet"></span>' : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    `);
    });
    $(`#list-orders`).html(htmls);
    // $(`.game-list .con-box:eq(${x}) .hb .c-tc`).last().remove();
}


$.ajax({
    type: "POST",
    url: "/api/webapi/admin/totalJoin_trx",
    data: {
        typeid: typeid,
    },
    dataType: "json",
    success: function (response) {
        var red = 0;
        var green = 0;
        var violet = 0;
        var n0 = 0;
        var n1 = 0;
        var n2 = 0;
        var n3 = 0;
        var n4 = 0;
        var n5 = 0;
        var n6 = 0;
        var n7 = 0;
        var n8 = 0;
        var n9 = 0;
        var n = 0;
        var l = 0;
        var ns = 0;
        var length = response.datas.length;
        var datas = response.datas;
        for (let i = 0; i < length; i++) {
            if (datas[i].bet == '0') n0 += parseInt(datas[i].money);
            if (datas[i].bet == '1') n1 += parseInt(datas[i].money);
            if (datas[i].bet == '2') n2 += parseInt(datas[i].money);
            if (datas[i].bet == '3') n3 += parseInt(datas[i].money);
            if (datas[i].bet == '4') n4 += parseInt(datas[i].money);
            if (datas[i].bet == '5') n5 += parseInt(datas[i].money);
            if (datas[i].bet == '6') n6 += parseInt(datas[i].money);
            if (datas[i].bet == '7') n7 += parseInt(datas[i].money);
            if (datas[i].bet == '8') n8 += parseInt(datas[i].money);
            if (datas[i].bet == '9') n9 += parseInt(datas[i].money);
            if (datas[i].bet == 'x') green += parseInt(datas[i].money);
            if (datas[i].bet == 't') violet += parseInt(datas[i].money);
            if (datas[i].bet == 'd') red += parseInt(datas[i].money);
            if (datas[i].bet == 'l') l += parseInt(datas[i].money);
            if (datas[i].bet == 'n') n += parseInt(datas[i].money);
        }
        ns = n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9;
        $('.orderRed').text(formatMoney(red, ','));
        $('.orderViolet').text(formatMoney(violet, ','));
        $('.orderGreen').text(formatMoney(green, ','));
        $('.orderNumber:eq(0)').text(formatMoney(n0, ','));
        $('.orderNumber:eq(1)').text(formatMoney(n1, ','));
        $('.orderNumber:eq(2)').text(formatMoney(n2, ','));
        $('.orderNumber:eq(3)').text(formatMoney(n3, ','));
        $('.orderNumber:eq(4)').text(formatMoney(n4, ','));
        $('.orderNumber:eq(5)').text(formatMoney(n5, ','));
        $('.orderNumber:eq(6)').text(formatMoney(n6, ','));
        $('.orderNumber:eq(7)').text(formatMoney(n7, ','));
        $('.orderNumber:eq(8)').text(formatMoney(n8, ','));
        $('.orderNumber:eq(9)').text(formatMoney(n9, ','));
        $('.orderNumber:eq(10)').text(formatMoney(l, ','));
        $('.orderNumber:eq(11)').text(formatMoney(n, ','));
        $('.orderNumbers').text(formatMoney(ns, ','));

        $('.orderRed').attr('totalmoney', red);
        $('.orderViolet').attr('totalmoney', violet);
        $('.orderGreen').attr('totalmoney', green);
        $('.orderNumber:eq(0)').attr('totalmoney', n0);
        $('.orderNumber:eq(1)').attr('totalmoney', n1);
        $('.orderNumber:eq(2)').attr('totalmoney', n2);
        $('.orderNumber:eq(3)').attr('totalmoney', n3);
        $('.orderNumber:eq(4)').attr('totalmoney', n4);
        $('.orderNumber:eq(5)').attr('totalmoney', n5);
        $('.orderNumber:eq(6)').attr('totalmoney', n6);
        $('.orderNumber:eq(7)').attr('totalmoney', n7);
        $('.orderNumber:eq(8)').attr('totalmoney', n8);
        $('.orderNumber:eq(9)').attr('totalmoney', n9);
        $('.orderNumber:eq(10)').attr('totalmoney', l);
        $('.orderNumber:eq(11)').attr('totalmoney', n);
        $('.orderNumbers').attr('totalmoney', ns);

        response.datas.map((data) => {
            showJoinMember(data);
        });
        showListOrder3(response.list_orders);
        $(".direct-chat-warning .direct-chat-messages").animate({
            scrollTop: $(".direct-chat-msg").prop("scrollHeight")
        }, 750);
        $('.reservation-chunk-sub-num').text(response.lotterys[0].period);
        let is = ''
        if (typeid == '1') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo1 == '-1') ? 'Random' : response.setting[0].wingo1}`);
        if (typeid == '2') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo3 == '-1') ? 'Random' : response.setting[0].wingo3}`);
        if (typeid == '3') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo5 == '-1') ? 'Random' : response.setting[0].wingo5}`);
        if (typeid == '4') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo10 == '-1') ? 'Random' : response.setting[0].wingo10}`);

        if (typeid == '1') $('#winrate').text(`Next Result: ${(response.setting[0].bs1 == '-1') ? 'Random' : response.setting[0].bs1}`);
        if (typeid == '2') $('#winrate').text(`Next Result: ${(response.setting[0].bs3 == '-1') ? 'Random' : response.setting[0].bs3}`);
        if (typeid == '3') $('#winrate').text(`Next Result: ${(response.setting[0].bs5 == '-1') ? 'Random' : response.setting[0].bs5}`);
        if (typeid == '4') $('#winrate').text(`Next Result: ${(response.setting[0].bs10 == '-1') ? 'Random' : response.setting[0].bs10}`);
    }
});

function generateResultByHash(hash) {
    const hashItemList = hash.split("");
  
    let Result = "";
    for (let index = 0; index < hashItemList.length; index++) {
      const hashItem = hashItemList[hashItemList.length - 1 - index];
  
      const NUMBER_LIST = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
      const isNumber = NUMBER_LIST.includes(hashItem);
      if (isNumber) {
        Result = hashItem;
        break;
      }
    }
  
    return Result;
  };


$('#btn_manual_results').click(function (e) {
    e.preventDefault();
    fetch("https://apilist.tronscanapi.com/api/block?sort=-balance&start=0&limit=20&producer=&number=&start_timestamp=&end_timestamp=")
    .then((response) => response.json())
    .then((data) => {
        $('#list-orders-hash').html('');
        if(parseInt($('html').attr('data-change')) == 1 || parseInt($('html').attr('data-change')) == 5)
        {
            let html = '';
            for (let i=0; i< 10; i++)
            {
                var result = generateResultByHash(data.data[i].hash);
                html += ` <div data-v-a9660e98="" class="c-tc van-row" style="text-align: center;border-bottom: 1px solid;padding: 6px">
                <div data-v-a9660e98="" class="van-col van-col--8">`+data.data[i].number+`</div>
                <div data-v-a9660e98="" class="van-col van-col--5">`+data.data[i].hash+`</div>
                <div data-v-a9660e98="" class="van-col van-col--5">`+result+`</div>
                <div data-v-a9660e98="" class="van-col van-col--6"> <a class="btn btn-success btn-sm manage_result" data-number="${data.data[i].number}" data-hash="${data.data[i].hash}" data-result="${result}" data-time="${data.data[i].timestamp}"><i class="fas fa-check"></i></a></div>
                </div>`;
            }
            $('#list-orders-hash').html(html);
        }
        else if(parseInt($('html').attr('data-change')) == 3 || parseInt($('html').attr('data-change')) == 10)
        {
            let html = '';
            for (let i=10; i< 20; i++)
            {
                var result = generateResultByHash(data.data[i].hash);
                html += ` <div data-v-a9660e98="" class="c-tc van-row" style="text-align: center;border-bottom: 1px solid;padding: 6px">
                <div data-v-a9660e98="" class="van-col van-col--8">`+data.data[i].number+`</div>
                <div data-v-a9660e98="" class="van-col van-col--5">`+data.data[i].hash+`</div>
                <div data-v-a9660e98="" class="van-col van-col--5">`+result+`</div>
                <div data-v-a9660e98="" class="van-col van-col--6"> <a class="btn btn-success btn-sm manage_result" data-number="${data.data[i].number}" data-hash="${data.data[i].hash}" data-result="${result}" data-time="${data.data[i].timestamp}"><i class="fas fa-check"></i></a></div>
                </div>`;
            }
            $('#list-orders-hash').html(html);
        }
    });
});

$(document).off('click', '.manage_result').on("click", '.manage_result', function(e){
    e.preventDefault();
    let hash_number = $(this).attr('data-number');
    let hash_hash = $(this).attr('data-hash');
    let hash_result = $(this).attr('data-result');
    let hash_time = $(this).attr('data-time');
    $.ajax({
        type: "POST",
        url: "/api/webapi/trx_wingo/manageResult",
        data: {
            hash_number: hash_number,
            hash_hash: hash_hash,
            hash_result: hash_result,
            hash_time:hash_time,
            typeid: $('html').attr('data-change'),
        },
        dataType: "json",
        success: function (response) {
            $('#list-orders-hash').html('');
        }
    });
});

$('.start-order').click(function (e) {
    e.preventDefault();
    let value = $('#editResult').val(); 
    let arr = value.split('|');
    for (let i = 0; i < arr.length; i++) {
        let check = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(String(arr[i]));
        if (arr[i] == "" || arr[i].length > 1 || !check) {
            alert("Please enter the correct format (e.g., 1|4|5|1|5)");
            return false;
        }
    }
    if (value != '') {
        $.ajax({
            type: "POST",
            url: "/api/webapi/admin/trx_change",
            data: {
                type: 'change-wingo1',
                value: value,
                typeid: typeid,
            },
            dataType: "json",
            success: function (response) {
                Swal.fire(
                    'Good job!',
                    `${response.message}`,
                    'success'
                );
                $('#ketQua').text(`Next Result: ${value}`);
            }
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
        })
    }
});

// $('.editWinRate').click(function (e) {
//     e.preventDefault();
//     let value = $('#editWinRate').val();
//     let arr = value.split('|');
//     for (let i = 0; i < arr.length; i++) {
//         if (arr[i] == "" || arr[i].length > 1 || arr[i] != 0 && arr[i] != '1') {
//             alert("Vui lòng nhập đúng định dạng (VD: 1|0|0|1|1)");
//             return false;
//         }
//     }
//     if (value != '') {
//         $.ajax({
//             type: "POST",
//             url: "/api/webapi/admin/change",
//             data: {
//                 type: 'change-win_rate',
//                 value: value,
//                 typeid: typeid,
//             },
//             dataType: "json",
//             success: function (response) {
//                 Swal.fire(
//                     'Good job!',
//                     `${response.message}`,
//                     'success'
//                 );
//                 $('#ketQua').text(`Next Result: ${value}`);
//             }
//         });
//     } else {
//         Swal.fire({
//             icon: 'error',
//             title: 'Oops...',
//             text: 'Something went wrong!',
//         })
//     }
// });