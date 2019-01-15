var i=0, title='';
var urls = ['https://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/h/hsbc-world-selection-adventurous-portfolio-c-income/invest',
		'https://uk.reuters.com/business/markets/index/.FTSE',
		'https://uk.reuters.com/business/markets/index/.DJI',
		'https://uk.reuters.com/business/currencies/quote?srcAmt=1&srcCurr=GBP&destAmt=&destCurr=USD'];
var pat = [/bid price-divide" >(\d+.\d+)/, //fund: price
	       /<span class="(\w+) change/, //direction
	       /change" >\W*(\d+.\d+)&#37/, //change percentage
	       /(Prices as at\W*\d+\W*\w+\W*\d{4})/, //date
	       /span class="dataParenthetical change(\w+)">\((\W*\d+.\d+%)/, //ftse100 & djia change dir and perc
	       /GBP\/USD<\/a><\/td>\W*<td class="data bold">\W*\d+.\d+<\/td>\W*<td class="data data\w+\W* bold">\W*((-|\+)\d+.\d+%)/] //GPBUSD change perc
var col = {green: [122, 186, 122, 255],
	   red: [255, 0, 0, 255]}


function match(text,pat,num=1){
    if (text.match(pat)) return text.match(pat)[num]
    else return 0
}
    

function send(url) {
    var req = new XMLHttpRequest();
    //req.addEventListener("load", reqListener);
    req.onload = reqListener;
    req.open('GET', url);
    req.send();
}


function time(){
    var d = new Date();
    mins = d.getMinutes()>9 ? d.getMinutes() : '0'+d.getMinutes();
    tm = d.getHours()+':'+mins;
    //console.log(tm);
    return tm;
}


function reqListener() {
    //console.log(this.responseText);
    if (this.status === 200 && this.readyState === 4) {
	//console.log('got responce for i='+i);
	var r = this.responseText.toString();
	switch (i){
	case 0:
	    title += match(r, pat[0]) + '\ngoing ' +  match(r, pat[1]) + ' at ' +  match(r, pat[2]) + '%\n' +
		match(r, pat[3]) + '\nas for ' + time();
	    color = match(r, pat[1]) == 'positive' ? col.green : col.red;
	    chrome.browserAction.setBadgeBackgroundColor({ color: color })
	    chrome.browserAction.setBadgeText({text: match(r, pat[2])});
	    i = 1;
	    send(urls[i]);
	    break;
	case 1:
	    title += '\nFTSE going ' +  match(r, pat[4]) + ' at ' +  match(r, pat[4], 2);
	    i = 2;
	    send(urls[i]);
	    break;
	case 2:
	    //console.log(r);
	    title += '\nDJIA going ' + match(r, pat[4]) + ' at ' + match(r, pat[4], 2);
	    i = 3;
	    send(urls[i]);
	    break;
	case 3:
	    title += '\nGBPUSD doing ' + match(r, pat[5]);
	}
	chrome.browserAction.setTitle({title: title});
    }}


send(urls[0]);
setInterval(function(){title = ''; i = 0; send(urls[i])}, 600000);
