var d = new Date();
var timestamp = `${d.getFullYear()}${(d.getMonth() + 1)}${d.getDate()}${d.getHours()}${d.getMinutes()}${d.getSeconds()}`
var WEBtimestamp = `${d.getFullYear()}년${(d.getMonth() + 1)}월${d.getDate()}일${d.getHours()}시${d.getMinutes()}분${d.getSeconds()}초`
console.log(timestamp);
console.log(WEBtimestamp);
console.log('현재 년: ' + d.getFullYear() + '<br />');
console.log('현재 월: ' + (d.getMonth() + 1) + '<br />');
console.log('현재 일: ' + d.getDate() + '<br />');
console.log('<br />'); // 줄바꿈
console.log('현재 시: ' + d.getHours() + '<br />');
console.log('현재 분: ' + d.getMinutes() + '<br />');
console.log('현재 초: ' + d.getSeconds() + '<br />');
console.log('<br />');
console.log('오늘 요일: ' + d.getDay() + '<br />'); // 일요일 = 0