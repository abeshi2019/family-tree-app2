//新規作成ボタン
var ContactR = (symbolSize/2)-2.5;//コネクタの接点の半径
var attrs = {"stroke": "black", "stroke-width": 3};//線のattr
var attrsWhite = {"stroke": "white", "stroke-width": symbolSize,"opacity" : 0.01};//線の縁取りのattr
var attrsCircle = {"fill": "white", "stroke": "black", "stroke-width": 2,"stroke-dasharray" :"- "};//接点のattr
var attrsCircleAfter = {"fill": "red", "stroke": "black", "stroke-width": 2,"stroke-dasharray" :"- "};//接着済みの接点のattr

//新規作成時のeleDataを作成する
function newCreateEleData(hashData){
	var inputX = hashData['inputX'];
	var inputY = hashData['inputY'];
	var classType  = hashData['class'];
	var type   = hashData['type'];
	var color  = hashData['color'];
	var outputData = {'center':{'cx': inputX, 'cy': inputY, 'type':type}};

	
	if(classType=='symbol'){
		if(type=='triangle'){
			outputData['center']['color'] = color;
		}else{
			outputData['color'] = color;
		}
	}else if(classType=='connector'){
		var typeHash = {
			'relationships'     : 'Connector',
			'consanguinity'     : 'Connector',
			'genetic'           : 'ConnectorGenetic',
			'multipleGestation' : 'MultipleGestation',
			'notAvailable'      : 'NotAvailable',
			'noChildren'        : 'NoChildren',
			'infertility'       : 'NoChildren',
			'adoption'          : 'Adoption'};
		
		outputData['center']['type'] = typeHash[type];
		
		var consanguinity = {'relationships':false, 'consanguinity':true};
		var infertility = {'noChildren': false, 'infertility': true};

		if(type=='relationships' || type=='consanguinity'){
			outputData['center']['consanguinity'] = consanguinity[type];
		}else if(type=='noChildren' || type=='infertility'){
			outputData['center']['infertility'] = infertility[type];
		}
	}
	//DEBUG
	//console.log("outputData:");
	//console.log(outputData);
	return outputData;
}
//新規作成を呼び出す
function newCreateElement(eleData){
	elementType = eleData['center']['type'];
	if(elementType=='Adoption'){
		adoption(eleData);//養子
	}else if(elementType=='NoChildren'){
		noChildren(eleData);//子供のいない夫婦
	}else if(elementType=='NotAvailable'){
		notAvailable(eleData);//家族関係が不明
	}else if(elementType=='MultipleGestation' || elementType=='ConnectorGenetic'){
		geneticOrMultiple(eleData);//多胎妊娠・一般的なコネクタ
	}else if(elementType=='Connector'){
		connector(eleData);//婚姻関係
	}else if(elementType=='circle' || elementType=='rect' || elementType=='diamond'||elementType=='triangle'){
		symbol(eleData);
	}
}

//コネクタの新規作成：重複しているところがあるので、下の関数をここにまとめる
function newCreateConnector(eleData){
}

//コネクタ：養子
function adoption(eleData){
	/*【引数】
	eleData ={
		center   : {cx:xxx, cy:xxx, type:xxx},
		inCircle : {cx:xxx, cy:xxx, show:xxx}
		outCircle: {cx:xxx, cy:xxx, show:xxx}
	}
	*/
	
	//【定義】
	var connector = paper.path("").attr(attrs).insertBefore(borderCircle);				//養子線
	var inLine = paper.path("").attr(attrs).insertBefore(borderCircle);					//in線
	var outLine = paper.path("").attr(attrs).attr({"stroke-dasharray" :". "})			//out線
			.insertBefore(borderCircle);
	var connectorWhite = paper.path("").attr(attrsWhite).insertBefore(borderCircle);		//養子線縁取り

	var center = paper.circle(eleData['center']['cx'],eleData['center']['cy'], 30)
		.insertBefore(borderCircle).hide();	//中心点
	
	var inCircle = paper.circle(center.attr("cx"), center.attr("cy")-(gridY*2),ContactR)		//in用接点
		.attr(attrsCircle).insertBefore(borderCircle).hide();
	var outCircle = paper.circle(center.attr("cx")+(gridX*2),center.attr("cy")-(gridY*2),ContactR)	//out用接点
		.attr(attrsCircle).insertBefore(borderCircle).hide();

	//【centerIDを登録】
	connectorWhite.data("centerId",center.id);
	inCircle.data("centerId",center.id);
	outCircle.data("centerId",center.id);

	//【centerにdata登録】
	center.data("centerId",center.id)
		.data("id_inCircle",inCircle.id).data("id_inLine",inLine.id).data("show_inLine",true)
		.data("id_outCircle",outCircle.id).data("id_outLine",outLine.id).data("show_outLine",true)
		.data("connectorId",connector.id)
		.data("connectorWhiteId",connectorWhite.id)
		.data('connectorType','Adoption')
		.data("circleIDs",[inCircle.id,outCircle.id])//接点のID
		.data("IDs",[connector.id,inLine.id,outLine.id,connectorWhite.id,inCircle.id,outCircle.id]);//自分以外の全てのID

	//【copy】in,outCircleについて
	if(eleData['inCircle']!=null){
		var inOutCircle = {'in':inCircle,'out':outCircle};
		for(var i in inOutCircle){
			inOutCircle[i].attr({
				'cx' : eleData[i+'Circle']['cx'],
				'cy' : eleData[i+'Circle']['cy']
			});
			center.data("show_"+i+"Line",eleData[i+'Circle']['show']);
		}
	}

	//【接点のIDをcontactIdArrayに登録】
	inOutContactIdArray('add',center.data("circleIDs"));
	inOutCenterIdArray('add',center.id);
	//【ドラッグ】
	inCircle.drag(dragMoveCircle,dragStartCircle,dragEndCircle);
	outCircle.drag(dragMoveCircle,dragStartCircle,dragEndCircle);
	connectorWhite.drag(dragMoveConnector,dragStartConnector,dragEndConnector);
	//【描画】
	drawPathLine(center.data('connectorType'),center.id);
}


//コネクタ：こどもがいない夫婦,不妊症
function noChildren(eleData){
	/*【引数】
		eleData = {
			center: {cx: xxx, cy: xxx, type: xxx, infertility: xxx}
		}
	*/
	//【定義】
	var connector = paper.path("").attr(attrs).insertBefore(borderCircle);//コネクタ
	var connectorWhite = paper.path("").attr(attrsWhite).insertBefore(borderCircle);//コネクタ縁取り
	var center = paper.circle(eleData['center']['cx'],eleData['center']['cy'],ContactR)
		.attr(attrsCircle).insertBefore(borderCircle).hide();//中心点

	//【centerIDを登録】
	connectorWhite.data("centerId",center.id);

	//【centerにdataを登録】
	center.data("centerId",center.id)
		.data("connectorId",connector.id)
		.data("connectorWhiteId",connectorWhite.id)
		.data('connectorType','NoChildren')
		.data("circleIDs",[center.id])//接点のID
		.data("IDs",[connector.id,connectorWhite.id])//自分以外全てのID
		.data('show_infertility',eleData['center']['infertility'])//不妊症かそうでないか

	//【接点のIDをcontactIdArrayに登録】
	inOutContactIdArray('add',[center.id]);
	inOutCenterIdArray('add',center.id);

	//【ドラッグ】
	center.drag(dragMoveCircle,dragStartCircle,dragEndCircle);
	connectorWhite.drag(dragMoveConnector,dragStartConnector,dragEndConnector);

	//【描画】
	drawPathLine(center.data('connectorType'),center.id);
}

//コネクタ：家族関係が不明
function notAvailable(eleData){
/*【引数】
		var object = {
			center: {
				cx: node.attr('cx')+plusX,
				cy: node.attr('cy')+plusY,
				type: node.data('connectorType'),
			}
		}
*/
	//【定義】
	var connector = paper.path("").attr(attrs).insertBefore(borderCircle);//コネクタ
	var connectorWhite = paper.path("").attr(attrsWhite).insertBefore(borderCircle);//コネクタ縁取り
	var center = paper
			.circle(eleData['center']['cx'], eleData['center']['cy'],ContactR)
			.attr(attrsCircle).insertBefore(borderCircle).hide();//中心点
	var unknown = paper.text(center.attr('cx'),center.attr('cy') - 65, "?")
			.attr({"font-size": 25 , "stroke": "black", "stroke-width": 0}).insertBefore(borderCircle);//？マーク

	//【centerのIDを登録】
	connectorWhite.data("centerId",center.id);
	unknown.data("centerId",center.id);

	//【centerにdataを登録】
	center.data("centerId",center.id)
		.data("connectorWhiteId",connectorWhite.id)
		.data("connectorId",connector.id)
		.data("unknownId",unknown.id)
		.data('connectorType','NotAvailable')
		.data("IDs",[connector.id,connectorWhite.id,unknown.id])
		.data("circleIDs",[center.id]);

	//【接点のIDをcontactIdArrayに登録】
	inOutContactIdArray('add',[center.id]);
	inOutCenterIdArray('add',center.id);

	//【ドラッグ】
	connectorWhite.drag(dragMoveConnector,dragStartConnector,dragEndConnector);
	center.drag(dragMoveCircle,dragStartCircle,dragEndCircle);
	//【描画】
	drawPathLine(center.data('connectorType'),center.id);
}

//コネクタ：多胎妊娠or一般的なコネクタ
function geneticOrMultiple(eleData){
	/*【引数】
	eleData = {
		center: {cx:xxx, cy:xxx, type:xxx, multipleType:xxx(多胎妊娠のみ)},
		descentCircle: {cx: xxx, cy: xxx,},
		children: [{cx:xxx, cy:xxx, flexX:xxx(血縁関係のみ)}, ... ,{}],
		poko[{cx:xxx ,cy:xxx ,color:xxx}, ... ,{}]
	}
*/
	//【初期化的なもの】
	var type=eleData['center']['type'];
	var childLength;//子供の数
	if(type=='MultipleGestation'){
		childLength = multipleChild;
	}else if(type=='ConnectorGenetic'){
		childLength = childNum;
	}

	//【copy】こどもの数
	if(eleData['children'] != null){
		childLength = eleData['children'].length;
	}

	var interval = gridY;						//等間隔
	var sibshipLine = (childLength - 1) * interval;	//【同胞の線の長さ】(子供の数-1)＊interval

	//【線要素など定義】
	if(type=='MultipleGestation'){
		var unknown = paper.text(0,0, "?").attr({"font-size": 20 , "stroke": "black", "stroke-width": 0})
			.insertBefore(borderCircle).hide();//卵生タイプ：不明の？
	}
	var connector = paper.path("").attr(attrs).insertBefore(borderCircle);//コネクタ
	var connectorWhite = paper.path("").attr(attrsWhite).insertBefore(borderCircle);//コネクタ後ろ線

	//【丸要素定義】
	var center = paper
		.ellipse(eleData['center']['cx'],eleData['center']['cy'],ContactR*2/3,ContactR)
		.insertBefore(borderCircle)
		.attr({"fill": "black", "stroke": "black", "stroke-width": 1,"opacity" : 0.5}).hide();
	//血族関係の接点
	var descentCircle = paper.circle(center.attr('cx'), center.attr('cy') - interval,ContactR)
			.attr(attrsCircle).insertBefore(borderCircle).hide();

	//【poko定義】
	var colorArray=["red","blue"],pokoCircleList={},pokoWhiteList=[];
	for(var i=0;i<colorArray.length;i++){
		var ele = paper.path("").attr({"stroke": "white", "stroke-width": 11}).insertBefore(connector);
		pokoWhiteList[i] = ele.id;
		var ele = paper.circle(center.attr('cx'),center.attr('cy')-20, 15)
			.attr({'stroke' : 'none','fill':'none',"opacity" : 0.5}).insertBefore(borderCircle)
			.data('centerId',center.id);
		ele.drag(dragMovePoko,dragStartPoko,dragEndPoko).hide();
		pokoCircleList[colorArray[i]]=ele.id;
	}
	//【子供用のpoko作成】
	var childPoko = paper.ellipse(center.attr('cx'),center.attr('cy')+gridY,0,15)
		.attr({'stroke':'none','fill':'none',"opacity" : 0.5})
		.data("centerId",center.id).insertBefore(borderCircle)
		.drag(dragMovePoko,dragStartPoko,dragEndPoko).hide();
	pokoCircleList['green']=childPoko.id;
	
	//【copy】descentCircle、poko定義
	if(eleData['descentCircle']!=null){
		descentCircle.attr({'cx' : eleData['descentCircle']['cx'],'cy' : eleData['descentCircle']['cy']});
		for (var i in pokoCircleList){
			var newPoko = paper.getById(pokoCircleList[i]);
			newPoko.attr({'fill': eleData['poko'][i]['color']})
				.attr({"cx" : eleData['poko'][i]['cx'],"cy" : eleData['poko'][i]['cy']});
		}
	}

	//【子供用接点新規作成】
	var x= (center.attr('cx') - (sibshipLine)),y = center.attr('cy');
	var children= [], childCircle;
	for(var i = 0 ; i < childLength; i++){
		//子供用の接点
		childCircle = paper.circle(x, y+interval,ContactR).attr(attrsCircle)
				.data("centerId",center.id).insertBefore(borderCircle).hide();
		childCircle.drag(dragMoveCircle,dragStartCircle,dragEndCircle);
		children[i] =  childCircle.id;
		
		//copy,子供の接点の座標
		if(eleData['children']!=null){
			childCircle.attr({'cx' : eleData['children'][i]['cx'],'cy' : eleData['children'][i]['cy']});
		}
		//伸縮用のx
		if(type=='ConnectorGenetic'){
			childCircle.data("flexX",childCircle.attr('cx'));
			//copy,flexXについて
			 if(eleData['children']!=null){
				childCircle.data("flexX",eleData['children'][i]['flexX']);
			}
		}
		
		x += interval*2;
	}

	
	//【中心点のIDを登録】
	connectorWhite.data("centerId",center.id);
	descentCircle.data("centerId",center.id);

	//【中心に点にdataを登録】
	center
		.data("children",children)//子供の接点のID
		.data("centerId",center.id)//中心点
		.data('connectorType',type)//コネクタの種類
		.data("connectorWhiteId",connectorWhite.id)//コネクタ後ろ線
		.data("connectorId",connector.id)//コネクタ
		.data("pokoCircleList",pokoCircleList)
		.data("pokoWhiteList",pokoWhiteList)
		.data("childPoko",childPoko.id)
		.data("descentCircleId",descentCircle.id)//血族の接点

	var childPokoList = [];
	for(var i=0;i<childLength;i++){
		if(eleData['center']['childPokoList']!=null){
			childPokoList[i] = eleData['center']['childPokoList'][i];
		}else{
			childPokoList[i] = true;
		}
	}
	center.data("childPokoList",childPokoList);
	
	
	if(type=='MultipleGestation'){
		center
			.data("multipleType","dizygotic")//一卵性or二卵性or不明：デフォルト二卵性
			.data("unknownId",unknown.id)//不明の？
			.data("IDs",[unknown.id,pokoWhiteList[0],pokoWhiteList[1],connector.id,connectorWhite.id
					,pokoCircleList[colorArray[0]],pokoCircleList[colorArray[1]],descentCircle.id])
		//copy:卵生のタイプ
		if(eleData['center']['multipleType']!=null){
			center.data("multipleType",eleData['center']['multipleType']);
		}
	}else if(type=='ConnectorGenetic'){
		center
			.data("IDs",[pokoWhiteList[0],pokoWhiteList[1],connector.id,connectorWhite.id
					,pokoCircleList[colorArray[0]],pokoCircleList[colorArray[1]],childPoko.id,descentCircle.id]);//全てのID
	}
	center.data("circleIDs",[center.id,descentCircle.id,childPoko.id,pokoCircleList[colorArray[0]],pokoCircleList[colorArray[1]]]);//接点用ID


	//ID登録：子供の接点関連
	for(i = 0; i < center.data("children").length; i++){
		center.data("IDs")[center.data("IDs").length] = paper.getById(center.data("children")[i]).id;
		center.data("circleIDs")[center.data("circleIDs").length] = paper.getById(center.data("children")[i]).id;
	}

	//【接点のIDをcontactIdArrayに登録】
	inOutContactIdArray('add',[descentCircle.id]);
	inOutContactIdArray('add',center.data("children"));
	inOutCenterIdArray('add',center.id);

	//【ドラッグ】
	center.drag(dragMoveTwoCenter,dragStartTwoCenter,dragEndTwoCenter);
	descentCircle.drag(dragMoveCircle,dragStartCircle,dragEndCircle);
	connectorWhite.drag(dragMoveConnector,dragStartConnector,dragEndConnector);

	//【pathなどの設定】
	drawPathLine(center.data('connectorType'),center.id);

}

//コネクタ：婚姻関係
function connector(eleData){
/*【引数】
	eleData = {
		center: {
			cx:xxx, cy: xxx, type: xxx,
			breakLine: xxx, consanguinity: xxx,
			remodelingMode: xxx,remodelingNum: xxx
		},
		Start: {cx:xxx, cy;xxx},
		End:   {cx:xxx, cy:xxx}
	}
*/
	//【定義】
	var center = paper
		.ellipse(eleData['center']['cx'],eleData['center']['cy'],(gridX*2),ContactR/2)
		.attr({"stroke": "none",'fill':colorString,"opacity" : 0.5}).insertBefore(borderCircle);

	var connector = paper.path("").insertBefore(borderCircle).attr(attrs);
	var whitePath;
	
	if(eleData['center']['consanguinity'] == true){
		connector.attr({"stroke-width": 9});
		whitePath = paper.path("").attr({"stroke": "white", "stroke-width": 3}).insertBefore(borderCircle);
	}
	
	var breakLine = paper.path("").attr({"stroke": "black", "stroke-width": 8})
		.insertBefore(borderCircle);//.hide();

	var breakLineWhite = paper.path("").attr({"stroke": "white", "stroke-width": 2})
			.insertBefore(borderCircle);//.hide();
	var connectorWhite = paper.path("").attr(attrsWhite)
			.insertBefore(borderCircle).insertBefore(borderCircle);

	var connectorStart =  paper.circle(center.attr('cx')-(gridX*2),center.attr('cy'),ContactR)
			.attr(attrsCircle).insertBefore(borderCircle).hide();
	var connectorEnd = paper.circle(center.attr('cx')+(gridX*2),center.attr('cy'),ContactR)
			.attr(attrsCircle).insertBefore(borderCircle).hide();

	//【centerのIDを登録】
	connectorWhite.data("centerId",center.id);
	connectorStart.data("centerId",center.id);
	connectorEnd.data("centerId",center.id);

	//【centerにdataを登録】
	 center.data("centerId",center.id)
		.data("connectorStartId",connectorStart.id)
		.data("connectorEndId",connectorEnd.id)
		.data("connectorId",connector.id)
		.data("connectorWhiteId",connectorWhite.id)
		.data("id_breakLine",breakLine.id)
		.data("id_breakLineWhite",breakLineWhite.id)
		//.data("show_breakLine",false)
		.data("breakLineRLH","hide")//right,left
		.data("consanguinity",eleData['center']['consanguinity'])//trueかfalse
		.data('connectorType','Connector')
		.data('remodelingMode',false)
		.data('remodelingNum',2);//|_|こんなん

	if(eleData['Start'] != null){
		var strEnd = {"Start" : connectorStart,"End" : connectorEnd};
		for (var i in strEnd){
			var newCircle = strEnd[i];
			newCircle.attr({'cx' : eleData[i]['cx'],'cy' : eleData[i]['cy']});
		}
		connector.attr('stroke-dasharray',eleData['center']['stroke-dasharray'])
		center//.data("show_breakLine",eleData['center']['breakLine'])
			.data('remodelingMode',eleData['center']['remodelingMode'])
			.data('remodelingNum',eleData['center']['remodelingNum'])
			.data("breakLineRLH",eleData['center']["breakLineRLH"]);
	}

	if(eleData['center']['consanguinity'] == true){
		center.data("whitePathId",whitePath.id);
	}
	center.data("circleIDs",[connectorStart.id,connectorEnd.id]);

	if(eleData['center']['consanguinity'] == false){
		center.data("IDs",[connector.id,breakLine.id,breakLineWhite.id,connectorWhite.id
				,connectorEnd.id,connectorStart.id]);
	}else{
		center.data("IDs",[connector.id,whitePath.id,breakLine.id,breakLineWhite.id,connectorWhite.id
				,connectorEnd.id,connectorStart.id]);
	}

	//【接点のIDをcontactIdArrayに登録】
	inOutContactIdArray('add',[center.id]);
	inOutContactIdArray('add',center.data("circleIDs"));
	inOutCenterIdArray('add',center.id);
	
	//【ドラッグ】
	connectorWhite.drag(dragMoveConnector,dragStartConnector,dragEndConnector);
	connectorStart.drag(dragMoveCircle,dragStartCircle,dragEndCircle);
	connectorEnd.drag(dragMoveCircle,dragStartCircle,dragEndCircle);
	center.drag(dragMoveConnectorCenter,dragStartConnectorCenter,dragEndConnectorCenter);

	//【描画】
	drawPathLine(center.data('connectorType'),center.id);
}

//記号の新規作成

//記号：四角・丸・菱形
function symbol(eleData) {
/*
	eleData = {
		center   : {cx: xxx,cy: xxx,type: xxx,},
		color    : {sprit: xxx,type: xxx},
		text     : xxx,
		multiple : xxx,
		show     : [{'xxx',xxx},..,{'xxx',xxx}]
	}
*/

/*ver0_1_5での変更点
	eleData = {
		center   : {cx: xxx,cy: xxx,type: xxx,},
		color    : {split: xxx,type: xxx,color: xxx},
		text     : {text: xxx,x: xxx,y: xxx,size: xxx},
		multiple : xxx,
		show     : [{'xxx',xxx},..,{'xxx',xxx}]
	}
*/

	var symbolType = eleData['center']['type'];//丸・四角・菱形・三角
	var symbol;
	
	var node = paper
		.circle(eleData['center']['cx'], eleData['center']['cy'], 10).hide();//center
	var split1,split2,split3,split4;//分割用

	var underWhite;
	//ver0_1_5に追加ここから
	//色の保存の呼び出しを行う
	var trueColor = "black";
	if(eleData['color']!=null){
		if(eleData['color']['color']!=null){
			trueColor = eleData['color']['color'];
		}
	}
	//個体番号の位置の保存の呼び出しを行う
	var individualNumPositionNum = 0;
	if(eleData['individualNumPositionNum']!=null){
		individualNumPositionNum = eleData['individualNumPositionNum'];
	}
	//ver0_1_5に追加ここまで
	if (symbolType == "rect"){
		underWhite = paper.rect(0,0,symbolSize,symbolSize);//【正方形】
		symbol = paper.rect(0,0, symbolSize,symbolSize);
	}else if(symbolType == "circle"){
		underWhite = paper.circle(0,0, symbolSize/2);//【円】
		symbol = paper.circle(0,0, symbolSize/2);
	}else if(symbolType == "diamond"){
		underWhite = paper.path("");//【菱型】
		symbol = paper.path("");
		
	}else if(symbolType == "triangle"){//【三角】
		symbol = paper.path("")
			.attr({"fill": "white", "stroke": trueColor, "stroke-width": 3})
			.drag(dragMoveSymbol,dragStartSymbol,dragEndSymbol)
			.data("centerId",node.id)
			.data('symbolType','triangle');

	}
	//console.log("symbol");
	//console.log(symbol);
	
	if(underWhite != null){
		underWhite.attr({"fill": "white", "stroke": "none", "stroke-width": 3});
	}
	
	var colorId = [];
	var symbolColor;
	if(symbolType != "triangle"){
		//【色分割初期化
		for(var i=0;i<4;i++){
			var split = paper.path("");
			colorId[i] = split.id;
		}
		node.data("colorId",colorId)
		if(eleData['color'] != null){
			if(eleData['color']['sprit']!=null){
				//スペルミスの名残。いつか消す、splitに統一する。
				node.data("split",eleData['color']['sprit'])
			}else{
				node.data("split",eleData['color']['split'])
			}
			
			var typeArray=[];
			for(var i=0;i<eleData['color']['type'].length;i++){
			 typeArray[i] = eleData['color']['type'][i]
			}
			node.data("colorType",typeArray);
		}else{
			node.data("split",1).data("colorType",[0,0,0,0]);
		}
	}else{
		//色(三角)
		symbolColor = paper.path("")
			.data("centerId",node.id)
			.drag(dragMoveSymbol,dragStartSymbol,dragEndSymbol);
		
		if(eleData['center']['color']!=null){
			//ver0.1.4以前
			node.data("colorType",eleData['center']['color']);
		}else if(eleData['color']['type']!=null){
			//ver0.1.5以後
			node.data("colorType",eleData['color']['type']);
		}
		
		//console.log("symbolColor");
		//console.log(symbolColor);

	}
	
	/* 
		色設定：分割数1(分割なし)~4
		[左上,右上,左下,右下]
		分割なしの時： 全部同じ数
		2分割のとき ： 0と2、1と3が同じ数
		3分割のとき ： 最後は-1
	*/
	
	if(symbolType != "triangle"){
		
		//オプション
		var textAttrs = {"font-size": 20 , "fill":trueColor,"stroke": "while", "stroke-width": 0};
		//【斜線】
		var slash = paper.path("").attr({"stroke": trueColor, "stroke-width": 2}).hide();
		//【点】
		var circle = paper.circle(0,0, (symbolSize/2)-10)
			.attr({"fill": "black", "stroke": trueColor, "stroke-width": 1}).hide();
		//【米印】
		var asterisk = paper.text(0,0, "＊").attr(textAttrs).attr({"font-size": 25}).hide();
		//【縦線】
		var verticalLine =  paper.path("").attr({"stroke": trueColor, "stroke-width": 3}).hide();
		//【妊娠】
		var pregnancy = paper.text(0,0, "P").attr(textAttrs).hide();
		//【ドナー】
		var donor = paper.text(0,0, "D").attr(textAttrs).hide();
		//【代理人】
		var surrogate = paper.text(0,0, "S").attr(textAttrs).hide();
		//【矢印：左端】相談者or発端者
		var arrow = paper.path("").attr({"stroke": trueColor, "stroke-width": 2}).hide();
		//【発端者を表すP】
		var proband = paper.text(0,0, "P").attr(textAttrs).hide();
	
		// text関連オプションの描画 ※SBとかETCとかどうしよう
		//【文字】
		var text = paper.text(0,0, "").attr(textAttrs).attr({"font-size": 15,'text-anchor' : "start"}).hide()
				.drag(dragMoveText,dragStartText,dragEndText);
		//【複数の個体】
		var multiple = paper.text(0,0, "n").attr(textAttrs).hide();
	}else{
		//斜線
		var slash = paper.path("").attr({"stroke": trueColor, "stroke-width": 2})
				 .hide();
		//【複数の個体】
		//var multiple = paper.text(0,0, "n").attr(textAttrs).hide();
		//文字
		var text = paper.text(0,0,"")
				.attr({"font-size": 15 ,"fill":trueColor,"stroke": "white", "stroke-width": 0,'text-anchor' : "start"})
				.hide().drag(dragMoveText,dragStartText,dragEndText);
	}

	//三角以外の場合
	if(symbolType != "triangle"){
		//symbolの設定
		symbol.insertAfter(multiple).data("centerId",node.id)
				.attr({"fill": "white", "stroke": trueColor, "stroke-width": 3,"fill-opacity":0.01})
				.drag(dragMoveSymbol,dragStartSymbol,dragEndSymbol);
		//nodeの設定
		node.data("centerId",node.id)
			.data("symbol",symbol.id)
			.data('symbolType',symbolType)
			.data("underWhite",underWhite.id)
			.data("id_circle",circle.id)
			.data("id_text",text.id)
			.data("id_slash",slash.id)
			.data("id_asterisk",asterisk.id)
			.data("id_verticalLine",verticalLine.id)
			.data("id_multiple",multiple.id)
			.data("id_pregnancy",pregnancy.id)
			.data("id_donor",donor.id)
			.data("id_surrogate",surrogate.id)
			.data("id_arrow",arrow.id)
			.data("id_proband",proband.id)
			.data("trueColor",trueColor)
			.data("individualNumPositionNum",individualNumPositionNum);
		
		//表示非表示
		var dataArray = ["circle","text","slash","asterisk","verticalLine"
			,"multiple","pregnancy","donor","surrogate","arrow","proband"];
		if(eleData['show']!=null){
			for(var i = 0; i < dataArray.length; i++){
				node.data("show_"+dataArray[i],eleData['show'][dataArray[i]]);
			}
			//ver0_1_5でテキストの保存形式を変更したための分岐
			if(eleData['text']['text']==null){
				//ver0_1_4でテキストの保存形式ではこっち
				text.attr({'text': eleData['text']});
				
			}else{
				//ver0_1_5でテキストの保存形式ではこっち
				text.attr({'text': eleData['text']['text'],
					'x': eleData['text']['x'],'y': eleData['text']['y'],
					'font-size': eleData['text']['size']});
			}
			multiple.attr({'text': eleData['multiple']});
		}else{
			for(var i = 0; i < dataArray.length; i++){
				node.data("show_"+dataArray[i],false);
			}
		}
		node.data("IDs",new Array(symbol.id,underWhite.id,circle.id 
			, slash.id , text.id , asterisk.id , verticalLine.id
			, multiple.id , pregnancy.id , donor.id , surrogate.id , arrow.id , proband.id));
		
	}else{//三角の場合
		//設定
		node.data("centerId",node.id)
			.data('symbolType','triangle')
			.data("symbolColorId",symbolColor.id)
			.data("id_text",text.id)
			.data("id_slash",slash.id)
			.data("symbol",symbol.id)
			.data("IDs",[symbol.id,slash.id,text.id,symbolColor.id])
			.data('triangle',true)
			.data("trueColor",trueColor)
			.data("individualNumPositionNum",individualNumPositionNum).hide();
		
		//【copy】
		var dataArray=["text","slash"];
		if(eleData['text']!=null){
			for(var i = 0; i < dataArray.length; i++){
				node.data("show_"+dataArray[i],eleData['show'][dataArray[i]]);
			}
			//ver0_1_5でテキストの保存形式を変更したための分岐
			if(eleData['text']['text']==null){
				//ver0_1_4でテキストの保存形式ではこっち
				text.attr({'text': eleData['text']});
			}else{
				//ver0_1_5でテキストの保存形式ではこっち
				text.attr({'text': eleData['text']['text'],
					'x': eleData['text']['x'],'y': eleData['text']['y'],
					'font-size': eleData['text']['size']});
			}
		}else{
			for(var i = 0; i < dataArray.length; i++){
				node.data("show_"+dataArray[i],false);
			}
		}
		//console.log("node");
		//console.log(node);
	}
	//symbolIdArrayに格納
	inOutSymbolIdArray('add',symbol.id);
	inOutCenterIdArray('add',node.id);
	//描画
	dragAll( 'start', [node.id], -1, -1, -1, -1);
	dragAll( 'move' , [node.id], -1, -1,  0,  0);
	dragAll( 'end'  , [node.id], -1, -1, -1, -1);
	
	//他に設計方法がありませんでした。
	if(eleData['show']!=null){
		if(eleData['text']['text']==null){
			//ver0_1_4でテキストの保存形式ではこっち
			var symbol = paper.getById(node.data("symbol"));
			var symbolX = symbol.getBBox().x
			var symbolWidth = symbol.getBBox().width;
			var symbolY = symbol.getBBox().y
			var symbolHeight = symbol.getBBox().height;
			
			text.attr({y : symbolY + symbolHeight  + (paper.getById(node.data("id_text")).getBBox().height/2)+5});
			if(node.data('triangle') != true && node.data("show_arrow")==true){
				text.attr({x : arrow.getBBox().x + arrow.getBBox().width + 5});
			}else{
				text.attr({x : symbolX + symbolWidth/2
				 - text.getBBox().width/2});
			}
		}
	}
}
