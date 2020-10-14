var paper,paperElement;					//キャンバスとキャンバス代わりのエレメント
var gridLine,gridLineOn=true;//グリッド線
var targetId=-1,symbolId;					//subContentsで処理を行うノードのID
var circleArray = new Array();		//操作中のコネクタの接点

var paperHeightMin=570,paperWidthMin=900;
var paperHeight=570,paperWidth=900;//キャンバスのサイズ 1024,768
var paperHeightMax=570*2,paperWidthMax=900*2;

//記号の大きさ基準
var symbolSize = 35;
//マス目の大きさ
var gridX = symbolSize/2,gridY = symbolSize;

//arabic2romanを使用したかったけど、うまくいかなかった
var romaNumArray = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX","X"];

//子供の数:デフォルト2
var multipleChild = 2;
var childNum = 2;

//キャンバス代わりのエレメント作成
var changePaperSize;
var copyRect;
//var paperCopy;
var judgeCopy=false;
var borderCircle;//記号とコネクタの境目の丸

//centerを格納する配列
var centerIdArray = [];
function inOutCenterIdArray(type,id){
	if(type=='add'){
		//追加
		centerIdArray[centerIdArray.length] = id;
	}else if(type=='remove'){
		//除去【考えとく】
		for(var i = 0; i < centerIdArray.length; i++){
			if(centerIdArray[i] == id){
				centerIdArray.splice(i,1);
			}
		}
	}else if(type=='clear'){
		//一括消去
		centerIdArray=[];
	}
}
//記号(symbol)のidを格納する配列・個体番号も作成する
var symbolIdArray = new Array();
var individualNumIdArray = [];//個体番号
var generationNumArray=[];//世代番号
function inOutSymbolIdArray(type,id){
	if(type=='add'){
		//追加
		symbolIdArray[symbolIdArray.length] = id;
		//個体番号の作成
		var individual = paper.text(0,0, "?")
			.attr({"font-size": 15 , "stroke": "black", "stroke-width": 0}).hide();
		individualNumIdArray[individualNumIdArray.length] = individual.id;
	}else if(type=='remove'){
		//除去
		for(var i = 0; i < symbolIdArray.length; i++){
			if(symbolIdArray[i] == id){
				symbolIdArray.splice(i,1);
				paper.getById(individualNumIdArray[i]).remove();
				individualNumIdArray.splice(i,1);
			}
		}
	}else if(type=='clear'){
		//一括消去
		symbolIdArray=[];
		individualNumIdArray=[];
	}
}
//接点のIDを格納する配列
var contactIdArray = [];
function inOutContactIdArray(type,idArray){
	if(type=='add'){
		//追加
		for(var i=0; i < idArray.length; i++){
			contactIdArray[contactIdArray.length] = idArray[i];
		}
	}else if(type=='remove'){
		//除去【考えとく】
		for(var i = 0; i < contactIdArray.length; i++){
			for(var j = 0; j < idArray.length; j++){
				if(contactIdArray[i] == idArray[j]){
					contactIdArray.splice(i,1);
				}
			}
		}
	}else if(type=='clear'){
		//一括消去
		contactIdArray=[];
	}
}

/*
paperの初期設定
*/
function createPaperElement(){
	//【キャンバスのサイズ変更ボタン】
	changePaperSize = paper.circle(paperWidth-25,paperHeight-25,20,20)
		.attr({'stroke':'none','fill':'gray',"opacity" : 0.5})
		.drag(dragMoveChangePaperSize,dragStartChangePaperSize,dragEndChangePaperSize);

	//【コピー用範囲指定】
	copyRect = paper.rect(0,0,0,0).attr({"stroke-width": 0,"fill":"red","fill-opacity" : 0.5});

	//【グリッド線作成】(コピペの動作)
	gridLine = paper.path("")
		.attr({"stroke-width": 1,"stroke": "black","stroke-opacity" : 0.25,"fill-opacity" : 0.25,"fill":"white"})
		.drag(dragMoveGridLine,dragStartGridLine,dragEndGridLine);

	//【paper代わりのrect】
	paperElement = paper.rect(0,0,paperWidth,paperHeight)
		.attr({"stroke-width": 2,"stroke": "black", "fill":"white","fill-opacity" : 0.01})
		.click(function(e,x,y){paperOnClick(x,y);});

	//記号とコネクタの境界線の丸作成
	borderCircle = paper.circle(5,5,2).hide();

	//サイズ変更ボタンを上に
	changePaperSize.insertAfter(paperElement);
	gridLineOnOff(false);
}

/*
キャンバスの大きさを変更する丸
*/
var dragStartChangePaperSize =
	function(x,y){
		saveOpenUndoData('save');
		this.ox=this.attr('cx');
		this.oy=this.attr('cy');
		this.attr({"opacity" : 0.25});
	};
var dragMoveChangePaperSize =
	function(dx,dy){
		if(paperWidthMin <= ((this.ox+dx)+25) && ((this.ox+dx)+25) < paperWidthMax){
			changePaperSize.attr({'cx' :this.ox+dx});
			paperWidth = changePaperSize.getBBox().x + changePaperSize.getBBox().width+5;
		}
		if(paperHeightMin <= ((this.oy+dy)+25) && ((this.oy+dy)+25) < paperHeightMax){
			changePaperSize.attr({'cy' :this.oy+dy});
			paperHeight = changePaperSize.getBBox().y + changePaperSize.getBBox().height+5;
		}
		paperSetSize(paperWidth,paperHeight);//大きさを変更する処理
	};
var dragEndChangePaperSize =
	function(){
		this.attr({"opacity" : 0.5});
	};
function paperSetSize(width,height){
	paperWidth=width;
	paperHeight=height;
	paper.setSize(width,height);
	gridLine.attr({'path':gridLinePathString(true)});
	paperElement.attr({"width":width,"height":height});
	changePaperSize.attr({'cx':paperWidth-25,'cy':paperHeight-25});
}

/*
gridLineについてのドラッグ（copy,cut時のpaperに対するドラッグ）
*/
var dragMoveGridLine = function(dx,dy){
	judgeCopy=false;
	var trueX = 0 + (Math.round((this.data('startX')+dx) / gridX) * gridX);
	//0とmaxはダメ
	if(trueX > paperWidth){
		trueX = gridX * Math.floor( (paperWidth/gridX) );
	}else if(trueX <= 0){
		trueX = gridX;
	}
	var trueY = 0 + (Math.round((this.data('startY')+dy) / gridY) * gridY);
	//0とmaxはダメ
	if(trueY > paperHeight){
		trueY = gridY * Math.floor( (paperHeight/gridY) );
	}else if(trueY <= 0){
		trueY = gridY;
	}
	if(this.data('startX')<=trueX){
		copyRect.attr({x : this.data('startX')});
	}else{
		copyRect.attr({x : trueX});
	}
	if(this.data('startY')<=trueY){
		copyRect.attr({y : this.data('startY')});
	}else{
		copyRect.attr({y : trueY});
	}
	copyRect.attr({'width':Math.abs(this.data('startX')-trueX),'height':Math.abs(this.data('startY')-trueY)});
}
var dragStartGridLine = function(x,y){
	var trueX = 0 + (Math.round(x / gridX) * gridX);
	//0とmaxはダメ
	if(trueX > paperWidth){
		trueX = gridX * Math.floor( (paperWidth/gridX) );
	}else if(trueX <= 0){
		trueX = gridX;
	}
	var trueY = 0 + (Math.round(y / gridY) * gridY);
	//0とmaxはダメ
	if(trueY > paperHeight){
		trueY = gridY * Math.floor( (paperHeight/gridY) );
	}else if(trueY <= 0){
		trueY = gridY;
	}
	this.data('startX',trueX);
	this.data('startY',trueY);
	this.data('x',x);
	this.data('y',y);
	if(copyRect.attr('width')==0 && copyRect.attr('height')==0){
		copyRect.attr({x : trueX,y : trueY}).attr({'width':0,'height':0}).show();
	}
	if(this.data('beforeXY')==null){
		this.data('beforeXY',{'x':x,'y':y});
	}else{
		this.data('afterXY',{'x':trueX,'y':trueY});
	}
	judgeCopy=true;
}
var dragEndGridLine = function(){
	if(judgeCopy==true){
		if(!(copyRect.attr('width')==0 && copyRect.attr('height')==0)){
			this.data('beforeXY',{
				'x': 0 + (Math.round( (copyRect.getBBox().x + copyRect.getBBox().width/2) / gridX) * gridX),
				'y':0 + (Math.round( (copyRect.getBBox().y + copyRect.getBBox().height/2) / gridY) * gridY)
			});
			copyCreateSymbol(this.data('beforeXY'),this.data('afterXY'),serchCopyCenter());
			copyRect.attr({'width':0,'height':0});
		}else{
			SubAllNone();
		}
		//xyの初期化
		this.data('beforeXY',{'x':null,'y':null});
		this.data('afterXY',{'x':null,'y':null});
	}
	judgeCopy=false;
}

var colorString = "";//婚姻関係のcenterのfill
//グリッド線のOnOff管理→編集モードのONOFF
function gridLineOnOff(change){
	if(change==true){
		if(gridLineOn==true){
			gridLineOn=false;
		}else{
			gridLineOn=true;
		}
	}

	if(gridLineOn==true){
		//個体番号の表示非表示
		colorString = 'gray';
		showHideIndividual('hide');

		gridLine.attr({'path':gridLinePathString(true)});
		changePaperSize.show();
		editButton.attr({"fill": "red","fill-opacity":0.5});
		// - -> copy
		copyButton.data('text').attr({"text": "Copy"});
		// - ->undo
		undoButton.data('text').attr({"text": "Undo"});
		 showHideWrapPaper(false)
	}else{
		colorString = 'none';
		showHideIndividual('show');
		gridLine.attr({'path':gridLinePathString(false)});
		changePaperSize.hide();
		editButton.attr({"fill": "white","fill-opacity":0.01});

		//copy-> -
		copyButton.data('text').attr({"text": "-"});
		//undo -> -
		undoButton.data('text').attr({"text": "-"});
		showHideWrapPaper(true);
	}
	//婚姻関係のcenterの色変更
	for(var i=0;i < contactIdArray.length;i++){
		var contact = paper.getById(contactIdArray[i]);
		var contactCenter = paper.getById(contact.data('centerId'));
		if(contactCenter.data('connectorType')=='Connector'
			&& contactCenter.id == contact.id
		){
			contact.attr({'fill' : colorString});
		}
	}

	SubAllNone();
}

//グリッド線pathString
function gridLinePathString(showGridLine){
	//グリッド線のテスト
	var pathString="";
	//ぐるっと囲む
	pathString = 'M 0,0 L ' + paperWidth + ',0 L ' + paperWidth + ','+ paperHeight + ' L0,' + paperHeight;
	if(showGridLine==true){
		//横線引く
		for(var i=gridY;i < (paperHeight); i+=gridY){
			pathString += 'M 0,' + i + 'L ' + paperWidth + ','+ i +'z';
		}
		//縦線引く
		for(var i=gridX;i < (paperWidth) ; i+=gridX){
			pathString += 'M '+ i+ ',' + 0 + 'L ' +i +','+ paperHeight +'z';
		}
	}
	return pathString;
}

//キャンバスをクリック
var elementTypeList = [
	{type: 'rect',				class: 'symbol',	color: {split: 1, type: [0,0,0,0]}},
	{type: 'rect',				class: 'symbol',	color: {split: 1, type: [1,1,1,1]}},
	{type: 'circle',			class: 'symbol',	color: {split: 1, type: [0,0,0,0]}},
	{type: 'circle',			class: 'symbol',	color: {split: 1, type: [1,1,1,1]}},
	{type: 'diamond',			class: 'symbol',	color: {split: 1, type: [0,0,0,0]}},
	{type: 'triangle',			class: 'symbol',	color: 0},
	{type: 'triangle',			class: 'symbol',	color: 1},
	{type: 'relationships',		class: 'connector'},
	{type: 'consanguinity',		class: 'connector'},
	{type: 'genetic',			class: 'connector'},
	{type: 'multipleGestation',	class: 'connector'},
	{type: 'notAvailable',		class: 'connector'},
	{type: 'noChildren',		class: 'connector'},
	{type: 'infertility',		class: 'connector'},
	{type: 'adoption',			class: 'connector'}
];
function paperOnClick(x,y){//記号の新規作成でもある
	//クリックされた座標を調整
	var trueX = 0 + (Math.round(x / gridX) * gridX);
	//0とmaxはダメ
	if(trueX > paperWidth){
		trueX = gridX * Math.floor( (paperWidth/gridX) );
	}else if(trueX <= 0){
		trueX = gridX;
	}
	var trueY = 0 + (Math.round(y / gridY) * gridY);
	//0とmaxはダメ
	if(trueY > paperHeight){
		trueY = gridY * Math.floor( (paperHeight/gridY) );
	}else if(trueY <= 0){
		trueY = gridY;
	}

	if( !(targetCreateElement.data('targetCreateElementNum') == -1 || gridLineOn==false) ){
		var kari = {'num':{1:0,2:1,3:2,4:3,5:4,6:5,7:6,8:7,9:8,10:9,12:10,14:11,15:12,16:13,17:14}};//数値補正
		var trueNum = kari['num'][targetCreateElement.data('targetCreateElementNum')];
		var inputData = elementTypeList[trueNum]
		inputData['inputX'] = trueX;
		inputData['inputY'] = trueY;
		saveOpenUndoData('save');

		//console.log("inputData:");
		//console.log(inputData);
		// DEBUG
		newCreateElement(newCreateEleData(inputData));
	}

	SubAllNone(true);
}

//世代・個体番号の表示非表示
function showHideIndividual(showORhide){
	if(showORhide=='show'){
		//リセット
		for(var i=0;i < individualNumIdArray.length;i++){
			var symbolCenter = paper.getById(paper.getById(symbolIdArray[i]).data('centerId'));
			var individual = paper.getById(individualNumIdArray[i]);
			/*if(symbolCenter.data("individualNumPositionNum")==0){
				individual.attr({'text':"",'x': symbolCenter.attr('cx')-(gridX+10),'y':symbolCenter.attr('cy')-(gridY/2)});
			}else if(symbolCenter.data("individualNumPositionNum")==1){
				individual.attr({'text':"",'x': symbolCenter.attr('cx')+(gridX+10),'y':symbolCenter.attr('cy')-(gridY/2)});
			}else if(symbolCenter.data("individualNumPositionNum")==2){
				individual.attr({'text':"",'x': symbolCenter.attr('cx')+(gridX+10),'y':symbolCenter.attr('cy')+(gridY/2)});
			}else if(symbolCenter.data("individualNumPositionNum")==3){
				individual.attr({'text':"",'x': symbolCenter.attr('cx')-(gridX+10),'y':symbolCenter.attr('cy')+(gridY/2)});
			}*/
			individual.attr({'text':"",'x': symbolCenter.attr('cx')-(gridX+10),'y':symbolCenter.attr('cy')-(gridY/2)});
			individual.show();
		}
		var newSymbolArray={};
		var geneNum=0;
		//初期化
		for(var i=gridY; i < paperHeight; i+=gridY){
			newSymbolArray[i]=[];
		}
		for(var i=0;i < symbolIdArray.length;i++){
			var targetSymbolCenter = paper.getById(paper.getById(symbolIdArray[i]).data('centerId'));
			newSymbolArray[targetSymbolCenter.attr('cy')].push([i,targetSymbolCenter.attr('cx')]);
		}
		for(var i=gridY; i < paperHeight; i+=gridY){
			var targetArray = newSymbolArray[i];
			if(targetArray.length!=0){
				var numText = paper.text(gridX*2,i,romaNumArray[geneNum])
					.attr({"font-size": symbolSize , "fill":"black","stroke-width": 0})
					.insertBefore(gridLine);
				generationNumArray[generationNumArray.length] = numText.id;//格納
				geneNum++;
				targetArray.sort(function(a,b){return((a[1]-b[1]));});
				var plusNum = 0;
				for(var j=0;j<targetArray.length;j++){
					var targetSymbolCenter
						= paper.getById(paper.getById(symbolIdArray[targetArray[j][0]]).data('centerId'));
					var targetNum = paper.getById(individualNumIdArray[targetArray[j][0]]);
					if(targetSymbolCenter.data('triangle')==true){
						targetNum.attr({'text' : j+1+plusNum});
					}else{
						var strNum = parseInt(paper.getById(targetSymbolCenter.data("id_multiple")).attr('text'),10);
						if(isNaN(strNum)==false){
							targetNum
								.attr({'text' : (j+1+plusNum)+'~'+(j+strNum+plusNum)});
							plusNum += strNum-1;
						}else{
							targetNum.attr({'text' : j+1+plusNum});
						}
					}
					targetNum.attr({'x': targetSymbolCenter.attr('cx') - (gridX + 5 + targetNum.getBBox().width/2)});
				}
			}
		}
	}else if(showORhide=='hide'){
		for(var i=0;i < individualNumIdArray.length;i++){
			var individual = paper.getById(individualNumIdArray[i]);
			individual.hide();
		}
		//世代番号remove
		for(var i=0;i<generationNumArray.length;i++){
			paper.getById(generationNumArray[i]).remove();
		}
		generationNumArray = [];

	}
}

//【特定の要素を消去】
//要素とそれのオプション要素.data("IDs")を消去
function remove(targetCenterId){
	circleArray = [];
	var obj;
	if(targetCenterId == null){
		obj = paper.getById(targetId);
	}else{
		obj = paper.getById(targetCenterId);
	}

	//ペア解除
	if(obj.data("colorId")!=null || obj.data("symbolColorId")!=null){
	}else{
		//コネクタ-記号のペア解除（？）
		var circleIDs = obj.data('circleIDs'),circleID;
		//接点のIDを消去
		inOutContactIdArray('remove',obj.data('circleIDs'));
		inOutContactIdArray('remove',[obj.id]);
	}
	inOutSymbolIdArray('remove',obj.data('symbol'));
	inOutCenterIdArray('remove',obj.id);

	for (var i = 0; i <obj.data("IDs").length; i ++) {
		paper.getById(obj.data("IDs")[i]).remove();
	}

	//色の消去
	if(obj.data("colorId")!=null){//コネクタのときはここを通らない
		for (var i = 0; i <obj.data("colorId").length; i ++) {
			paper.getById(obj.data("colorId")[i]).remove();
		}
	}
	obj.remove();
	SubAllNone();
}

//clearボタン押下
function clear() {
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	saveOpenUndoData('save')
	paperClear();

}

//一括消去を行う関数
function paperClear(){
	inOutSymbolIdArray('clear',-1);
	inOutContactIdArray('clear',-1);
	inOutCenterIdArray('clear',-1);
	circleArray = [];
	paper.clear();
	wrapPaper.clear();
	SubAllNone();
	generationMaxCircleArray = []//世代用配列
	createPaperElement();//キャンバス代わりの要素再描画
	initWrapPaper();
}

//【画面ロード時】関数に収めたい
window.onload = function () {
	// Clear svg Element when you start application.
	// it is just for temp, you need to reset all components.
	$('svg').remove();

	//キャンバスを指定
	paper = Raphael("paper", paperWidth, paperHeight);
	
	//createWrapPaper()
	createTools();
	//キャンバス代わりの要素
	createPaperElement();
	initWrapPaper();

	

//ここから先開発途中のなごり
	//四角
	/*
	var pathString;
	var point,p_point;
	var testR = paper.rect(290-30, 290-30 , 44 , 44);
	*/

	//paper.path("M150 20 A20 20 0 1 1 100.1 20.1Z");

	//【3分割テスト】
	/*
	var pathString;
	var point,p_point;
	var pointArray=new Array();
	//円を書く
	var testC = paper.path("M290,268 a22 22 0 1 0 1 0").hide();
	//alert(testC.getTotalLength());

	//3分割
	point = testC.getPointAtLength(46);
	pathString = "M290 268 A22 22 0 0 0 "+ point.x+ " " + point.y +" L 290 290 L 290 268Z";
	var split3_1 = paper.path(pathString);
	//横線
	for(var i=0;i<18;i++){
		p_point = split3_1.getPointAtLength(i*5);
		pointArray[i]=[p_point.x,p_point.y];

		//paper.circle(p_point.x,p_point.y,1);
	}
	for(var i=1;i<pointArray.length/2;i++){
		pathString += "M"+pointArray[i][0] + " " +pointArray[i][1]
			+"L"+( pointArray[pointArray.length-i][0])+ " " +pointArray[i][1];
	}
	paper.path(pathString);
	*/

	/*
	pathString = "M"+ point.x + " " + point.y;
	point = testC.getPointAtLength(46*2);
	pathString += " A22 22 0 0 0 "+ point.x+ " " + point.y +" L 290 290 Z M 290 290 L "+ point.x+ " " + point.y +"Z";
	var split3_2 = paper.path(pathString);

	pathString = "M"+ point.x + " " + point.y;
	pathString += " A22 22 0 0 0 290 268" +" L 290 290 Z M 290 290 L "+ point.x+ " " + point.y +"Z";
	var split3_3 = paper.path(pathString);
	*/

	//var split3_2 = paper.path(pathString);
	//point = testC.getPointAtLength(46*2);
	//paper.circle(point.x,point.y,2);
	//point = testC.getPointAtLength(46);
	//pathString = "M290 268 A22 22 0 0 0 "+ point.x+ " " + point.y +" L 290 290 L 290 268Z";
	//var split3_2 = paper.path(pathString);

	/*
	for(var i=0;i<=138;i+=46){
		paper.circle(point.x,point.y,2);
	}
	*/
	//Element.getTotalLength;
	//var num=5,point,pathString="";
};
