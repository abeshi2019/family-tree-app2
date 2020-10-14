/*
ボタン押したときの動作とか
記号の色変更
記号の本当の色変更
*/

var subToolId = "subTool";

//サブメニュー削除したり
function SubAllNone(showTargetCreateElement){
	var subToolsDiv = document.getElementById('subTools');
	var subToolDiv = document.getElementById(subToolId)
	if(subToolDiv!=null){
		subToolsDiv.removeChild(subToolDiv);
	}
	//文字救済措置
	document.getElementById('saveDataTxt').style.display = 'none';

	circleArrayShowHide("hide");
	
	//targetCreateElement(新規作成の灰色)を表示したままにする
	if(showTargetCreateElement!=true){
		targetCreateElement.data('targetCreateElementNum',-1).hide();
	}
	
	//copyモードOFF
	paperElement.attr({'fill':'white'});
	copyRect.attr({x : 0,y : 0}).attr({'width':0,'height':0});
	copyButton.attr(buttonAttrTool);
	
	//黒くする
	var target = paper.getById(targetId);
	if(target != null){
		if(target.data('connectorType')!=null){
			paper.getById(target.data('connectorId')).attr({'stroke':'black'});
		}else{
			paper.getById(target.data('symbol')).attr({'stroke':target.data('trueColor')});
		}
	}
	targetId = -1;
}

//サブメニュー作成//引数はtypeStringだけでいいと思う
function subMenu(pointX,pointY,typeString){
	var targetEle = paper.getById(targetId);
	var subToolsDiv = document.getElementById('subTools');
	
	var subToolDiv = document.createElement("div");
	subToolDiv.id = subToolId;
	subToolDiv.className = "border";
	
	subToolsDiv.appendChild(subToolDiv);
	
	if(typeString=='Symbol'){
		var aDiv = document.createElement("div");
		aDiv.id = subToolDiv.id + "_a";
		
		var inputEle = document.createElement("input");
		inputEle.id = "textMultiple";
		inputEle.type = "text";
		inputEle.size = 30;
		
		var bDiv = document.createElement("div");
		bDiv.id = subToolDiv.id + "_b";
		
		var textEle = document.createElement("TEXTAREA");
		textEle.id = "text";
		textEle.cols = 30;
		textEle.rows = 5;
		 
		subToolDiv.appendChild(aDiv);
		subToolDiv.appendChild(inputEle);
		subToolDiv.appendChild(bDiv);
		subToolDiv.appendChild(textEle);
		newCreateTools('symbol',3,5,subToolDiv.id);
		
		splitChange(false);
		textEle.value = paper.getById(targetEle.data("id_text")).attr("text");
		inputEle.value = paper.getById(targetEle.data("id_multiple")).attr("text");
	}else if(typeString=='SymbolT'){
		var textTEle = document.createElement("TEXTAREA");
		textTEle.id = "textT";
		textTEle.cols = 30;
		textTEle.rows = 5;
		
		subToolDiv.appendChild(textTEle);
		
		newCreateTools('symbolT',2,3,subToolDiv.id);
		textTEle.value = paper.getById(targetEle.data("id_text")).attr("text");
	}else if(typeString=="MultipleGestation" || typeString=="ConnectorGenetic"){
		//子供用飛び越え線についてのdi作成
		var list = {
			"ConnectorGenetic": ["connectorGenetic",1,4],
			"MultipleGestation": ["multipleGestation",2,6]
		}

		subToolDiv.className = "";
	
		var mulPaperDiv = document.createElement("div");
		mulPaperDiv.id = "mulPaper";
		mulPaperDiv.className = "border";
	
		var childPokoDiv = document.createElement("div");
		childPokoDiv.id = "childPoko";
		childPokoDiv.className = "border";
		childPokoDiv.style.fontSize = "15px";
		childPokoDiv.innerText="子供の飛び越え線適用範囲\n\n";

		subToolDiv.appendChild(mulPaperDiv);
		subToolDiv.appendChild(childPokoDiv);
	
		var checkBoxArray = [];
		for(var i=0;i<targetEle.data("children").length;i++){
			var checkBoxEle = document.createElement("input");
			checkBoxEle.id = "checkBox"+i;
			checkBoxEle.type = "checkbox";
			checkBoxEle.style.width="25px";
			checkBoxEle.style.height="25px";
			childPokoDiv.appendChild(checkBoxEle);
			
			if(targetEle.data("childPokoList")[i]==true){
				checkBoxEle.checked = true;
			}
			
			if( (((i+1) % 5) == 0) || ((i+1) == targetEle.data("children").length)){
				var kaigyou = document.createElement("font");
				kaigyou.innerText="";
				if((i+1)==5){
					kaigyou.innerText+="0";
				}
				kaigyou.innerText += (i+1)+"\n";
				childPokoDiv.appendChild(kaigyou);
			}
		}
	
		var enterDiv = document.createElement("div");
		enterDiv.style.margin = '5px';
		enterDiv.innerText="ok";
		enterDiv.style.fontSize = "20px";
		enterDiv.className = "border";
		enterDiv.style.width="25px";
		enterDiv.onclick = childPokoEnter;
		childPokoDiv.appendChild(enterDiv);
		
		newCreateTools(list[typeString][0],
			list[typeString][1],list[typeString][2],mulPaperDiv.id);
	}else{
		var conList = {
			"Connector": ["relationships",1,4],
			"NotAvailable": ["notAvailable",1,1],
			"NoChildren": ["noChildren",1,2],
			"ConnectorGenetic": ["connectorGenetic",1,4],
			"Adoption": ["adoption",1,3]
		}
		newCreateTools(conList[typeString][0],
			conList[typeString][1],conList[typeString][2],subToolDiv.id);
	}
}

//ハッシュ使えばまとめられそう

//子供用の飛び越え線設定適用ボタン
var childPokoEnter = function(){
	var target = paper.getById(targetId);
	var array=[];
	
	for(var i=0;i<target.data("childPokoList").length;i++){
		var checkBoxEle = document.getElementById("checkBox"+i);
		array[i] = checkBoxEle.checked;
	}
	target.data("childPokoList",array);
	//線の再描画
	drawPathLine(target.data('connectorType'),target.id);

}


//一般的なコネクタ・多胎妊娠：ポコ表示非表示
//ポコ用接点の色を変更(noneとそれ以外)することで表示非表示
function showHidePoko(color){
	var center = paper.getById(obj.id);
	var targetPoko = paper.getById(center.data("pokoCircleList")[color]);

	if(targetPoko.attr('fill')=='none'){
		targetPoko.attr({'fill': color});
	}else{
		targetPoko.attr({'fill':'none'});
	}
	//線の再描画
	drawPathLine(center.data('connectorType'),center.id);
}

//divの表示非表示
function showHideTool(targetName){
	SubAllNone();
	var target = document.getElementById(targetName);
	var targetStyle = target;

	if(target.style.display == 'block'){
		target.style.display='none';
	}else if(target.style.display == 'none'){
		target.style.display='block';
	}
}

//ツールバーの子供の数の増減
function childUpDown(upORdown,childNumText,upDownType){
	var num=0;
	if(upDownType == "genetic"){
		num = childNum;
	}else if(upDownType=="multiple"){
		num = multipleChild;
	}
	if(upORdown == "up"){
		num+=1;
	}else if(upORdown == "down"){
		if((upDownType=="multiple"&& num == 2) || (upDownType=="genetic"&&num==1)){
		}else{
			num-=1;
		}
	}
	if(upDownType == "genetic"){
		childNum = num;
	}else if(upDownType=="multiple"){
		multipleChild=num;
	}
	childNumText.attr({text : num});
}

//コネクタの接点の表示非表示
function circleArrayShowHide(showORhide){
	if(showORhide == "show"){
		var obj = paper.getById(targetId);
		circleArray = obj.data("circleIDs");
		//養子以外
		if(obj.data("connectorType")!="Adoption"){
			for (var i = 0; i <obj.data("circleIDs").length; i ++) {
				paper.getById(obj.data("circleIDs")[i]).show();
			}
		}//養子
		else{
			var inOutArray=['in','out'];
			for(var i=0; i < inOutArray.length; i++){
			 	if (obj.data("show_"+inOutArray[i]+"Line")==true){
			 		paper.getById(obj.data("id_"+inOutArray[i]+"Circle")).show();
			 	}
			}
		}
	}else if(showORhide == "hide"){
		for (var i = 0; i <circleArray.length; i ++) {
			paper.getById(circleArray[i]).hide();
		}
		circleArray = [];
	}
}


//養子コネクタの表示非表示
	function showHideAdoption(inORout){
		var obj = paper.getById(targetId);
		var circle = "id_" + inORout + "Circle";
		var line = "id_" + inORout + "Line";
		var lineWhite = "id_" + inORout + "LineWhite";
		var show = "show_" + inORout + "Line";

		if(obj.data(show) == false){
			paper.getById(obj.data(circle)).show();
			obj.data(show,true);
		}else{
			paper.getById(obj.data(circle)).hide();
			obj.data(show,false);
		}
		drawPathLine(obj.data('connectorType'),obj.id);
	}

//こどもがいない夫婦の表示非表示（不妊）
	function showHideNoChildren(){
		var  obj = paper.getById(targetId);
		if(obj.data("show_infertility") == false){
			obj.data("show_infertility",true);
		}
		else{
			obj.data("show_infertility",false);
		}
		drawPathLine(obj.data('connectorType'),obj.id);
}

//多胎妊娠の表示非表示
function changeMultipleType(type){
	paper.getById(targetId).data("multipleType",type);
	drawPathLine(obj.data('connectorType'),obj.id);
}

//婚姻関係：離婚の表示非表示
	function showHideConnector(){
	//右、左、消すの順番
	var  obj = paper.getById(targetId);
	var RLHash = {"hide":"right","right":"left","left":"hide"};
	obj.data("breakLineRLH",RLHash[obj.data("breakLineRLH")]);
	drawPathLine(obj.data('connectorType'),obj.id);
}
	
	
//婚姻関係：｜＿｜
function changeRemodelingMode(){
	var  obj = paper.getById(targetId);
	if(obj.data("remodelingMode") == false){
		obj.data("remodelingMode",true);
	}
	else{
		obj.data("remodelingMode",false);
	}
	//再描画
	drawPathLine('Connector',obj.id);
	connectorInsertBefore(obj.id);
}
//婚姻関係：婚約線(点線)かそうでないか
function engagement(){
	var strokeDasharray = {"":". ",". ":""};
	var  obj = paper.getById(targetId);
	var connector = paper.getById(obj.data("connectorId"));

	connector.attr({"stroke-dasharray":strokeDasharray[connector.attr("stroke-dasharray")]})

	//再描画
	drawPathLine('Connector',obj.id);
	connectorInsertBefore(obj.id);
}

//記号のオプションの表示非表示を行う
	function showHide(optType,show){
		var  obj = paper.getById(targetId);
		if(obj.data(show) == false){
			paper.getById(obj.data(optType)).show();
			obj.data(show,true);
			return true;
		}
		else{
			paper.getById(obj.data(optType)).hide();
			obj.data(show,false);
			return false;
		}
	}


//文字入力
function textInOut(areaName){
	var  obj = paper.getById(targetId);
	paper.getById(obj.data("id_text"))
		.attr({"text" : document.getElementById(areaName).value});
	paper.getById(obj.data("id_text")).show();
	
	var symbol = paper.getById(obj.data("symbol"));
	var symbolX = symbol.getBBox().x
	var symbolWidth = symbol.getBBox().width;
	var symbolY = symbol.getBBox().y
	var symbolHeight = symbol.getBBox().height;
	
	paper.getById(obj.data("id_text"))
		.attr({y : symbolY + symbolHeight  + (paper.getById(obj.data("id_text")).getBBox().height/2)+5});
	if(obj.data('triangle') != true && obj.data("show_arrow")==true){
		paper.getById(obj.data("id_text"))
			.attr({x : paper.getById(obj.data("id_arrow")).getBBox().x 
				+ paper.getById(obj.data("id_arrow")).getBBox().width
				+ 5});
	}else{
		paper.getById(obj.data("id_text")).attr({x : symbolX + symbolWidth/2
		 - paper.getById(obj.data("id_text")).getBBox().width/2});
	}
	
	
	obj.data("show_text",true);
}

//【開発中：文字入力】【複数のシンボル】
//これも上にくっつけたい
function multiple(){
	var  obj = paper.getById(targetId);
	paper.getById(obj.data("id_multiple"))
		.attr({"text" : document.getElementById("textMultiple").value});
	paper.getById(obj.data("id_multiple")).show();
	obj.data("show_multiple",true);
}

//テキストの大きさ変更
function textSizeChange(){
	var obj = paper.getById(targetId);
	var textSize = {15:18,18:21,21:12,12:15};
	paper.getById(obj.data("id_text")).attr({"font-size": textSize[paper.getById(obj.data("id_text")).attr("font-size")]});
	var symbol = paper.getById(obj.data("symbol"));
	var symbolX = symbol.getBBox().x
	var symbolWidth = symbol.getBBox().width;
	var symbolY = symbol.getBBox().y
	var symbolHeight = symbol.getBBox().height;
	
	paper.getById(obj.data("id_text"))
		.attr({y : symbolY + symbolHeight  + (paper.getById(obj.data("id_text")).getBBox().height/2)+5});
	if(obj.data('triangle') != true && obj.data("show_arrow")==true){
		paper.getById(obj.data("id_text"))
			.attr({x : paper.getById(obj.data("id_arrow")).getBBox().x 
				+ paper.getById(obj.data("id_arrow")).getBBox().width
				+ 5});
	}else{
		paper.getById(obj.data("id_text")).attr({x : symbolX + symbolWidth/2
		 - paper.getById(obj.data("id_text")).getBBox().width/2});
	}
}

/*
ここから色変更関係
*/

//色分割初期化
function pathStringSplitInit(split3or4,from0to3,symbolId){
	var symbol = paper.getById(symbolId);
	var pathString="";

	var bBoxXY = [symbol.getBBox().x,symbol.getBBox().y];
	var bBoxW = symbol.getBBox().width;
	var bBoxH = symbol.getBBox().height;
	var centerXY = [bBoxXY[0]+(bBoxW/2) , bBoxXY[1]+(bBoxH/2)];
	var symbolR = bBoxW/2;

	//上下左右の真ん中の座標
	var xyArray =[[ bBoxXY[0]+(bBoxW/2) , bBoxXY[1]            ]
				 ,[ bBoxXY[0]           , bBoxXY[1] + (bBoxH/2)]
				 ,[ bBoxXY[0]+ bBoxW    , bBoxXY[1] + (bBoxH/2)]
				 ,[ bBoxXY[0]+(bBoxW/2) , bBoxXY[1] + bBoxH    ]];

	//要素の形式(丸・四角・ひし形(path))
	if(symbol.type=="circle"){
		//4分割か3分割か
		if(split3or4==4){
			//丸_4分割
			if(from0to3==0){
				//左上
				pathString = "M" + centerXY[0] + " " + (centerXY[1]-symbolR)
					+ "A" + symbolR + " " + symbolR + " " + 0 + " " + 0 + " " + 0 + " "
					+ (centerXY[0]-symbolR) + " " + centerXY[1]
					+ "L" + centerXY[0] + " " + centerXY[1]+"Z";
			}else if(from0to3==1){
				//右上
				pathString = "M" + centerXY[0] + " " + (centerXY[1]-symbolR)
					+ "A" + symbolR + " " + symbolR + " " + 0 + " " + 0 + " " + 1 + " "
					+ (centerXY[0]+symbolR) + " " + centerXY[1]
					+ "L" + centerXY[0] + " " + centerXY[1]+"Z";
			}else if(from0to3==2){
				//左下
				pathString = "M" + centerXY[0] + " " + (centerXY[1]+symbolR)
					+ "A" + symbolR + " " + symbolR + " " + 0 + " " + 0 + " " + 1 + " "
					+ (centerXY[0]-symbolR) + " " + centerXY[1]
					+ "L" + centerXY[0] + " " + centerXY[1]+"Z";
			}else if(from0to3==3){
				//右下
				pathString = "M" + centerXY[0] + " " + (centerXY[1]+symbolR)
					+ "A" + symbolR + " " + symbolR + " " + 0 + " " + 0 + " " + 0 + " "
					+ (centerXY[0]+symbolR) + " " + centerXY[1]
					+ "L" + centerXY[0] + " " + centerXY[1]+"Z";
			}
		}else if(from0to3==3){
			//丸_3分割
		
		}
	}else if(symbol.type=="rect"){
		if(split3or4==4){
			//四角_4分割
			if(from0to3==0){
				//左上
				 pathString = "M" + xyArray[0][0] + " " + xyArray[0][1]
					+ "L" + bBoxXY[0] + " " + bBoxXY[1]
					+ "L" + xyArray[1][0] + " " + xyArray[1][1]
					+ "L" + centerXY[0] + " " + centerXY[1]
					+ "L" + xyArray[0][0] + " " + xyArray[0][1];
			}else if(from0to3==1){
				//右上
				pathString = "M" + xyArray[0][0] + " " + xyArray[0][1]
					+ "L" + (bBoxXY[0] + bBoxW) + " " + bBoxXY[1]
					+ "L" + xyArray[2][0] + " " + xyArray[2][1]
					+ "L" + centerXY[0]+ " " + centerXY[1]
					+ "L" + xyArray[0][0] + " " + xyArray[0][1];
			}else if(from0to3==2){
				//左下
				pathString = "M" + xyArray[3][0] + " " + xyArray[3][1]
					+ "L" + bBoxXY[0] + " " + (bBoxXY[1] + bBoxH)
					+ "L" + xyArray[1][0] + " " + xyArray[1][1]
					+ "L" + centerXY[0] + " " + centerXY[1]
					+ "L" + xyArray[3][0] + " " + xyArray[3][1];
			}else if(from0to3==3){
				//右下
				pathString = "M" + xyArray[3][0] + " " + xyArray[3][1]
					+ "L" + (bBoxXY[0] + bBoxW) + " " + (bBoxXY[1] + bBoxH)
					+ "L" + xyArray[2][0] + " " + xyArray[2][1]
					+ "L" + centerXY[0]+ " " + centerXY[1]
					+ "L" + xyArray[3][0] + " " + xyArray[3][1];
			}
		}
		else if(split3or4==3){
		//四角_3分割
		}
	}
	else if(symbol.type=="path"){
		if(split3or4==4){
		//ひし形_4分割
			if(from0to3 <= 1){
				//左上・右上
				 pathString = "M" + xyArray[0][0] + " " + xyArray[0][1]
					+ "L" + xyArray[from0to3+1][0] + " " + xyArray[from0to3+1][1]
					+ "L" + centerXY[0] + " " + centerXY[1]
					+ "L" + xyArray[0][0] + " " + xyArray[0][1];
			}
			else if(from0to3 >= 2){
				//左下・右下
				pathString = "M" + xyArray[3][0] + " " + xyArray[3][1]
					+ "L" + xyArray[from0to3-1][0] + " " + xyArray[from0to3-1][1]
					+ "L" + centerXY[0] + " " + centerXY[1]
					+ "L" + xyArray[3][0] + " " + xyArray[3][1];
			}
		}
		else if(split3or4==3){
		//ひし形_3分割
		}
	}
	return pathString;
}


//色変更
function pathStringColor(split3or4,changeType,changeTrueType,eleId,symbolId){
	var ele = paper.getById(eleId);//計算用
	var symbol = paper.getById(symbolId);
	
	
	var bBoxXY = [symbol.getBBox().x,symbol.getBBox().y];
	var centerXY = [bBoxXY[0] + (symbol.getBBox().width/2) , bBoxXY[1] + (symbol.getBBox().height/2)];

	var point,num=0,pathString="";
	var iMax;
	if(symbol.type=="rect"){
		iMax=12;
	}else{
		iMax=9;
	}
	if(split3or4==3){
		//3分割
	}
	else if(split3or4==4){
		//4分割
		ele.attr({"fill":"white"});
		if(changeType==0){
			//白
		}else if(changeType==1){
			//黒
			pathString = ele.attr("path");
			ele.attr({"fill":changeTrueType,"stroke":changeTrueType});
		}
		else if(changeType>=2){
			for(var i=0;i<iMax;i++){
				point = ele.getPointAtLength(num);
				if(changeType==2 || changeType==4){
					pathString += "M"+point.x+","+point.y+"L" + point.x+" "+ centerXY[1];//縦線
				}
				if(changeType==3 || changeType==4){
					if(i<5 && symbol.type=="rect"){
					}else{
						pathString += "M"+point.x+","+point.y+"L" + centerXY[0] +" "+point.y;//横線
					}
				}
				num += 5;
			}
		}
		return pathString;
	}
}

//色変更
//pushNumの1,2,3,4に右上、右下、左上、左下と対応している　多分
function colorChange(pushNum,change,targetCenterId){
	var obj = paper.getById(targetCenterId);
	
	var typeArray = obj.data("colorType");
	var colorId = obj.data("colorId");
	var split = obj.data("split");
	var symbol = paper.getById(obj.data("symbol"));
	var nextColorType;
	var nextTrueColorType = obj.data("trueColor");
	
	if(change==true){
		if(typeArray[pushNum]==4){
			nextColorType=0;
		}else {
			nextColorType = typeArray[pushNum] + 1;
		}
	}else{
		nextColorType = typeArray[pushNum];
	}
	
	if(split==1 || split==2 || split==4){
		//白→黒→縦→横→格子→白
		for(var i=pushNum;i<colorId.length;i+=split){
			paper.getById(colorId[i])
				.attr({"path": pathStringSplitInit(4,i,symbol.id)});
			paper.getById(colorId[i])
				.attr({"path":pathStringColor(4,nextColorType,nextTrueColorType,colorId[i],symbol.id)});
			typeArray[i]=nextColorType;
		}
		obj.data("colorType",typeArray);
	}
	else if(split==3){
		//3分割(左側)
		//後回し
	}
}

//type 0:白 1:黒 2:縦線 3:横線 4:チェック
function colorChageTriangle(change,targetCenterId){
	var targetCenter = paper.getById(targetCenterId);
	var type = targetCenter.data("colorType");
	var trueColor = targetCenter.data("trueColor");
	var symbol = paper.getById(targetCenter.data("symbol"));
	var point,pathString="",num=5,pointArray=[];
	//色の変更を行う
	if(change==true){
		if(type==4){
			type= 0;
		}else{
			type++;
		}
	}
	if(type==0){
		symbol.attr({"fill":"white"});
	}else if(type==1){
		symbol.attr({"fill":trueColor});
	}else if(2<=type && type<=4){
		symbol.attr({"fill":"white"});
		for(var i=0;i<12;i++){
			point = symbol.getPointAtLength(num);
			pointArray[i] = [point.x,point.y];
			//縦線
			if(type==2||type==4){
				pathString += "M"+ point.x +","+ point.y 
					+"L"+ point.x +","+ (symbol.getBBox().y + symbol.getBBox().height) +"z";
			}
			num+=5;
		}
		//横線
		if(type==3||type==4){
			for(var j=0;j<4;j++){
				pathString += "M"+ pointArray[j][0] +","+ pointArray[j][1] 
					+ ",L"+ pointArray[pointArray.length-(1+j+3)][0] +","+ pointArray[j][1] +"z";
			}
		}
	}
	paper.getById(targetCenter.data("symbolColorId")).attr({"path":pathString,"fill":trueColor,"stroke":trueColor}).show();
	targetCenter.data("colorType",type);
}
