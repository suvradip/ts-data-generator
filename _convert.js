var headers,
	lineReader = require('line-reader'),
	fs = require('fs'),
	i = 0,
	body = [],
	allTh = [];

function main (cb) {
	lineReader.eachLine('uber-raw.csv', function(line, last) {
		if (!i) { i++; return; }
		
		var th = getTimeComp(line.split(',')[0]);
		allTh.push(th);
		
		if (last) { cb(process(allTh)); }
	});	
}

function getTimeComp (datestamp) {
	var tsArr = datestamp.match(/\d+/g).map(d => parseInt(d, 10)),
		temp,
		jsDate;

	temp = tsArr[1];
	tsArr[1] = tsArr[0];
	tsArr[0] = temp;

	tsArr.push(new Date(tsArr[2], tsArr[1], tsArr[0], tsArr[3], tsArr[4], tsArr[5]));
	return tsArr;
}

function createHistogram (arr) {
	var eVal,
		lk,
		i = 0,
		histObj = {},
		histDS = [],
		histVal = [],
		_minCounter = 0,
		_hCounter = 0;

	for(var _ii =0; _ii<arr.length; _ii++) {

		var key,
			arrV = arr[_ii],
			_day = arrV[0] * 1,
			_month = arrV[1] * 1,
			_year = arrV[2] * 1,
			_mint = arrV[4] * 1,
			_hour = arrV[3] * 1;

		if(  _mint < _minCounter) {
			eVal =  histObj[key = _day + '-' + _month + '-' + _year + '-' + _hour + '-' + _mint + '-' + '0'];
		}

			if(_mint === _minCounter ) {
				eVal =  histObj[key = _day + '-' + _month + '-' + _year + '-' + _hCounter + '-' + _minCounter + '-' + '0'];
			} else {
				eVal =  histObj[key = _day + '-' + _month + '-' + _year + '-' + _hCounter + '-' + _minCounter + '-' + '0'];
				_ii --;
			}
		histObj[key] = (eVal || 0) + 1;
		if(_minCounter === 59){
			if(_hCounter === 23){
				_hCounter = 0;
			} else {
				_hCounter ++;
			}
			_minCounter = 0;			
		} else{
			_minCounter++;
		}
	}


	//fs.writeFileSync('next.json', JSON.stringify(objectSort(histObj), null, 4));
	for (var key in histObj) {
		if (!i) {
			i++;
			lk = key;
			continue;
		} 

		generateForRandomSlot(histObj, lk.split('-'), key.split('-'), histObj[key]);
		lk = key;	
	}

	histObj = objectSort(histObj);

	for (var key in histObj) {
		histDS.push(key);
		histVal.push(histObj[key]);
	}

	return {
		histDS: histDS,
		histVal: histVal,
		obj: histObj
	};
}

function generateForRandomSlot(obj, fromKey, toKey, valTarget) {
	var i = 1,
		n = 12,
		slotReach = Math.floor(valTarget / n),
		reach;

		while(i < n) {
			reach = Math.floor(Math.random() * slotReach);
			obj[(fromKey[5] = i * 5), fromKey.join('-')] = reach;
			slotReach = Math.floor((valTarget = (valTarget - reach)) / (n - i));
			i++;
		}

		obj[toKey.join('-')] = valTarget;
}

function objectSort (obj) {
	var sobj = {},
		keys = Object.keys(obj),
	  	i, 
	  	len = keys.length,
	  	k;

	keys.sort(function (a, b) {
		var aa = a.split('-'),
			ba = b.split('-');

		return new Date(aa[2], aa[1], aa[0], aa[3], aa[4], aa[5]).getTime() -
			new Date(ba[2], ba[1], ba[0], ba[3], ba[4], ba[5]).getTime();

	});

	for (i = 0; i < len; i++) {
	  k = keys[i];
	  sobj[k] = obj[k];
	}

	return sobj;
}

function process(times) {
	times = times.sort(function(a, b) { 
		return a[a.length - 1].getTime() - b[b.length - 1].getTime();
	});

	var histObj = createHistogram(times),
		response = {},
		str = '';

	for (key in histObj.obj) {
		str += key + ', ' + histObj.obj[key] + '\n';
	}

	
	fs.writeFile('output.json', str, 'utf-8');
	return histObj;
}

module.exports = main;
