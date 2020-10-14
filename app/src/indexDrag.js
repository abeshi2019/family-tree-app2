//接点の適切な位置と接点-接点の制限をどんどん追加していくこと

var obj;//centerオブジェクトを代入(targetIDと同じ働きじゃね？)
var symb;//記号エレメント
var dragBoolean = false;//サブメニューを表示するか否か
var saveX,saveY;//最初の座標を保存

//接点：接点にくっついているかどうかを調べる
function searchMoveCircleArray(circleId){
	var thisCircle = paper.getById(circleId);
	var idArray = [];
	for(var i=0; i < contactIdArray.length; i++){
		var targetCircle = paper.getById(contactIdArray[i]);
		//自分と相手のコネクタのタイプが同じなら登録しない
		//※自動的に自分も登録しないことになる
		if(paper.getById(thisCircle.data('centerId')).data('connectorType')
			!= paper.getById(targetCircle.data('centerId')).data('connectorType')
		){
			//thisCircleが婚姻関係のcenterのとき
			if(thisCircle.id == thisCircle.data('centerId') 
				&& paper.getById(thisCircle.data('centerId')).data('connectorType')=='Connector'
			){
				if(judgeInclud(targetCircle.id,thisCircle.id) == true ){
					idArray[idArray.length] = targetCircle.id;
				}
			}else{
				if(judgeInclud(thisCircle.id,targetCircle.id) == true){
					idArray[idArray.length] = targetCircle.id;
				}
			}
		}
	}
	if(idArray.length!=0){
		thisCircle.attr({'fill':'blue'});
	}
	return idArray;
}

//接点：記号にくっついているのかどうかを調べる
function searchMoveSymbol(circleId,allCenter){
	var thisCircle = paper.getById(circleId);
	//thisCicleが婚姻関係のcenterならスルー
	if(thisCircle.id == thisCircle.data('centerId') 
		&& paper.getById(thisCircle.data('centerId')).data('connectorType')=='Connector'
	){
	}else{
		for(var i=0; i < symbolIdArray.length; i++){
			var target = paper.getById(symbolIdArray[i]);
			if(judgeInclud(thisCircle.id,target.id) == true){
				bondTargetPointMove(thisCircle.id,target.id,allCenter);
				dragAllCircle('end',thisCircle.id,-1,-1,-1,-1);
				thisCircle.attr({'fill':'red'});
				return target.id;
			}
		}
	}
	return -1;
}

//記号：一緒に移動する接点を探す&登録
function searchMoveCircle(symbolId,allCenter){
	//同じ中心座標の接点を調整
	var thisSymbol = paper.getById(symbolId);
	var thisCenter = paper.getById(thisSymbol.data('centerId'));
	//記号：一緒に移動する接点を探す&登録
	var idArray = [];
	for(var i=0; i < contactIdArray.length; i++){
		var target = paper.getById(contactIdArray[i]);
		if(judgeInclud(target.id,thisSymbol.id) == true){
			if(target.id == target.data('centerId')
				&& paper.getById(target.data('centerId')).data('connectorType')=='Connector'
			){
			}else{
				//接点が婚姻関係のcenterならスルー
				idArray[idArray.length] = target.id;
			}
		}
	}
	return idArray;
}

//記号に結合・結合する接点をユーザが操作できる位置に移動
function bondTargetPointMove(targetPointId,setPopId,allCenter){
	var targetPoint = paper.getById(targetPointId);
	var targetPointCenter = paper.getById(targetPoint.data('centerId'))
	var targetConnectorType = targetPointCenter.data('connectorType');
	
	var setpop=paper.getById(setPopId);
	var topORbottomORcenter=null;
	if(allCenter==true){
		//全て(接点を記号の)真ん中に持ってくるか、適当な位置にするか
		topORbottomORcenter='center';
	}else{
		//エレメントが三角形なら、ひっつけられるのは上部だけ！
		if(setpop.data('symbolType')=='triangle'){
			topORbottomORcenter='top';
		}//婚姻関係の線
		else if(targetConnectorType == 'Connector' && targetPointCenter.data('remodelingMode')==true){
			topORbottomORcenter='bottom';
		}//一般的なコネクタと多胎妊娠
		else if( (targetConnectorType == 'MultipleGestation' || targetConnectorType == 'ConnectorGenetic')){
			if(targetPointCenter.data('descentCircleId') != targetPointId){
				topORbottomORcenter='top';
			}else{
				topORbottomORcenter='bottom';
			}
		}//家族関係不明
		else if(targetConnectorType == 'NotAvailable'){
			topORbottomORcenter='top';
		}//子供のいない夫婦
		else if(targetConnectorType == 'NoChildren'){
			topORbottomORcenter='bottom';
		}//養子
		else if(targetConnectorType=='Adoption'){
			if(targetPoint.data('centerId') == targetPointId){
				topORbottomORcenter='center';
			}else{
				topORbottomORcenter='bottom';
			}
		}
	}
	if(topORbottomORcenter!=null){
		if(topORbottomORcenter=='center'){
			targetPoint.attr({'cx':center("x",setpop.id),'cy':center("y",setpop.id)});
		}else{
			targetPoint.attr({ cx : centerTbrl(topORbottomORcenter,'x',setpop.id),
					cy : centerTbrl(topORbottomORcenter,'y',setpop.id)});
		}
	}else{
		targetPoint.attr({ cx : centerTbrl(pythagoras(setpop.id,targetPoint.data('centerId')),'x',setpop.id),
				cy : centerTbrl(pythagoras(setpop.id,targetPoint.data('centerId')),'y',setpop.id)});
	}
}

//結合している全てのcenterIdを取得
function searchLeader(targetcircleId){
	var allCenterId=[];//ここに登録
	var allCenterIdBefor=[];//一次保存
	var pairContactIdArray;

	//この接点の真ん中
	var tergetCenter = paper.getById(paper.getById(targetcircleId).data('centerId'));
	//まずは、この接点の真ん中を登録
	allCenterIdBefor[allCenterIdBefor.length] = tergetCenter.id;

	//allCenterIdBefor[0]を参照
	while(allCenterIdBefor.length != 0){
		var targetBefor = paper.getById(allCenterIdBefor[0]);
		//これがすでに登録されているか確認
		var judge = true;
		for(var i = 0; i < allCenterId.length; i++){
			if(allCenterId[i] == targetBefor.id){
				judge=false;
				break;
			}
		}
		if(judge == true){
		//登録されていない
			//これが記号がコネクタか
			if(targetBefor.data('connectorType') != null){
				//コネクタ:くっついている記号1つor接点達を探す
				var pairId=-1;
				for(var i=0;i<contactIdArray.length;i++){
					var targetCircle = paper.getById(contactIdArray[i]);
					if(targetCircle.data('centerId') == targetBefor.data('centerId')){
						pairId = searchMoveSymbol(targetCircle.id,true);
						if(pairId != -1){
								allCenterIdBefor[allCenterIdBefor.length] =  paper.getById(pairId).data('centerId');
						}else{
							var idArray = searchMoveCircleArray(targetCircle.id);
							for(var j=0; j < idArray.length; j++){
								allCenterIdBefor[allCenterIdBefor.length] =  paper.getById(idArray[j]).data('centerId');
							}
						}
					}
				}
				//養子のコネクタの真ん中
				if(targetBefor.data('connectorType')=='Adoption'){
					var adoptionPairId = searchMoveSymbol(targetBefor.id,true);
					if(adoptionPairId != -1){
						allCenterIdBefor[allCenterIdBefor.length] =  paper.getById(adoptionPairId).data('centerId');
					}
				}
			}else{
				//記号：一緒に移動する接点を探す&登録
				var idArray = searchMoveCircle(targetBefor.data('symbol'),true);
				for(var i=0; i < idArray.length; i++){
					var id = paper.getById(idArray[i]);
					allCenterIdBefor[allCenterIdBefor.length] =  id.data('centerId');
				}
			}
			//登録
			allCenterId[allCenterId.length] = targetBefor.id;
		}
		//消去
		allCenterIdBefor.splice(0,1);
	}
	return allCenterId;
}

/*
コネクタのドラッグ
*/
var dragStartConnector = 
function(x,y){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない

	initDragStart(x,y,this.data("centerId"),paper.getById(this.data('centerId')).data('connectorType'));
	paper.getById(obj.data("connectorId")).attr({"opacity" : 0.5});

	this.data('searchLeaderArray',searchLeader(this.id));
	dragAll('start',this.data('searchLeaderArray'),x,y,-1,-1);

	circleArrayShowHide("show");
}

var dragMoveConnector =
function(dx,dy,x,y){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	
	initDragMove(dx,dy,x,y,this.id);
	dragAll('move',this.data('searchLeaderArray'),-1,-1,dx,dy);
}

var dragEndConnector =
function(){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない

	initDragEnd(obj.data('connectorType'));
	paper.getById(obj.data("connectorId")).attr({"opacity" : 1});

	dragAll('end',this.data('searchLeaderArray'),-1,-1,-1,-1);//やめる
	
	//接点の位置を調整
	for(var i=0;i<contactIdArray.length;i++){
		var circle = paper.getById(contactIdArray[i]);
		if(circle.data('centerId') == this.data('centerId')){
			searchMoveSymbol(circle.id,false);
		}
	}
}

//シンボルとテキストの差
var symbolToTextX=[];
var symbolToTextY=[];
//移動：searchLeaderで得た値のエレメントを動かす
function dragAll(startORmoveORend,allCenterId,x,y,dx,dy){
	var centerArray = allCenterId;
	if(startORmoveORend=='start'){
		for(i = 0; i < centerArray.length; i++){
			var target = paper.getById(centerArray[i]);
			//DEBUG
			//console.log(target);
			//centerドラッグ
			target.ox = target.attr('cx');
			target.oy = target.attr('cy');
			if(target.data('connectorType') != null){
				//コネクタ
				if(target.data('circleIDs') != null){
					for(var j=0;j < target.data('circleIDs').length;j++){
						var circleID = paper.getById(target.data('circleIDs')[j]);
						circleID.ox = circleID.attr('cx');
						circleID.oy = circleID.attr('cy');
						//一般的なコネクタ用
						if(circleID.data("flexX") != null){
							circleID.data("beforeFlexX",circleID.data("flexX"));
						}
					}
				}
			}else{
				//記号
				//隠す
				paper.getById(target.data('id_slash')).hide();
				paper.getById(target.data('id_text')).hide();
				var symbol = paper.getById(target.data("symbol"));
				//var0_1_5に追加　ここから
				symbolToTextX[i] = paper.getById(target.data('id_text')).getBBox().x - target.getBBox().x;
				symbolToTextY[i] = paper.getById(target.data('id_text')).getBBox().y - target.getBBox().y + paper.getById(target.data('id_text')).getBBox().height/2;
				//console.log(symbolToTextX[i]+","+symbolToTextY[i]);
				//var0_1_5に追加　ここまで
				if(target.data('triangle') == true){
					//隠す：三角
					paper.getById(target.data('symbol')).attr({"fill" : 'white'});
					paper.getById(target.data("symbolColorId")).hide();
				}else{
					//隠す：三角以外
					var hideDataArray = ["circle","asterisk","verticalLine"
						,"multiple","pregnancy","donor","surrogate","arrow","proband"];
					for(var j = 0; j < hideDataArray.length; j++){
						paper.getById( target.data("id_"+hideDataArray[j])).hide();
					}
					
					//色
					for(var j=0;j<4;j++){
						paper.getById(target.data("colorId")[j]).hide();
					}
					
				}
				
			}
		}
	}else if(startORmoveORend=='move'){
		for(i = 0; i < centerArray.length; i++){
			var target = paper.getById(centerArray[i]);
			target.attr({ cx : target.ox + dx,cy : target.oy + dy});
			moveLimit(target.id,'node');
			if(target.data('connectorType') != null){
				//コネクタ
				if(target.data('circleIDs') != null){
					for(var j=0;j < target.data('circleIDs').length;j++){
						var circleID = paper.getById(target.data('circleIDs')[j]);
						circleID.attr({  cx : circleID.ox + dx, cy : circleID.oy + dy});
						moveLimit(circleID.id,'node');
						//一般的なコネクタ用
						if(circleID.data("flexX") != null){
							var trueX = 0 + (Math.round( (circleID.data("beforeFlexX")+dx) / gridX) * gridX);
							//0とmaxはダメ
							if(trueX > paperWidth){
								trueX = gridX * Math.floor( (paperWidth/gridX) );
							}else if(trueX <= 0){
								trueX = gridX;
							}
							circleID.data("flexX",trueX);
						}
					}
				}
				//コネクタの描画
				drawPathLine(target.data('connectorType'),target.id);
			}else{
				//記号
				var targetSymbol = paper.getById(target.data("symbol"));
				//console.log("targetSymbol");
				//console.log(targetSymbol);
				drawPathLine(targetSymbol.type,target.id);
			}
		}
	}else if(startORmoveORend=='end'){
		for(i = 0; i < centerArray.length; i++){
			var target = paper.getById(centerArray[i]);
			if(target.data('connectorType') != null){
				//コネクタ
			}else{
				//記号
				//再表示
				var symbol = paper.getById(target.data("symbol"));
				var symbolX = symbol.getBBox().x
				var symbolWidth = symbol.getBBox().width;
				var symbolY = symbol.getBBox().y
				var symbolHeight = symbol.getBBox().height;
				//三角以外
				if(target.data('triangle') != true){
					paper.getById(target.data("id_circle"))
						.attr({ cx : target.attr('cx'),cy : target.attr('cy')});
					paper.getById(target.data("id_asterisk"))
						.attr({ x : symbolX + symbolWidth + 10,y : symbolY + symbolHeight});
					pathString = "M" + (symbolX + (symbolWidth/2)) + "," + symbolY + 
						"L" + (symbolX + (symbolWidth/2)) + "," + (symbolY + symbolHeight) + "z";
					paper.getById(target.data("id_verticalLine")).attr({"path":pathString});
					//記号の中心に
					var XYdataArray = ["multiple","pregnancy","donor","surrogate"];
					for(var j = 0; j < XYdataArray.length; j++){
						paper.getById(target.data("id_"+XYdataArray[j]))
							.attr({ x : target.attr('cx'),y : target.attr('cy')});
					}
					pathString =  " M " + (( symbolX- (symbolSize/2)) + 15) + "," + ((symbolY + symbolHeight+15) - 15) 
						+ "L" + ( symbolX- (symbolSize/2)) + "," +  (symbolY + symbolHeight +15)
						+ " M " + (( symbolX- (symbolSize/2)) + 15) + "," + ((symbolY + symbolHeight+15) - 15)
						+ " L " + (( symbolX- (symbolSize/2)) + 15-3) + "," + ((symbolY + symbolHeight+15) - 15+10)
						+ " M " + (( symbolX- (symbolSize/2)) + 15) + "," + ((symbolY + symbolHeight+15) - 15)
						+ " L " + (( symbolX- (symbolSize/2)) + 15-12) + "," + ((symbolY + symbolHeight+15) - 10)
					paper.getById(target.data("id_arrow")).attr({"path":pathString});

					paper.getById(target.data("id_proband"))
						.attr({ x : paper.getById(target.data("id_arrow")).getBBox().x - 10,
								y : paper.getById(target.data("id_arrow")).getBBox().y 
									+ paper.getById(target.data("id_arrow")).getBBox().height + 5});

					//表示するかしないか
					var showDataArray = ["circle","asterisk","verticalLine"
						,"multiple","pregnancy","donor","surrogate","arrow","proband"];
					for(var j = 0; j < showDataArray.length; j++){
						if(target.data("show_"+showDataArray[j])==true){
							paper.getById(target.data("id_"+showDataArray[j])).show();
						}
					}
					//色
					for(var j=0;j<4;j++){
						colorChange(j,false,target.id);
						paper.getById(target.data("colorId")[j]).show();
					}
					
				}else{
					//三角形のとき
					colorChageTriangle(false,target.id);
				}
				
				//共通
				pathString = 
					"M" + ( center("x",target.id) + (symbolSize*2/3) ) + "," + ( center("y",target.id) - (symbolSize*2/3) ) 
					+ "L" + ( center("x",target.id) - (symbolSize*2/3) ) + "," + ( center("y",target.id) + (symbolSize*2/3) ) + "z";
				paper.getById(target.data('id_slash')).attr({'path' : pathString});
				if(target.data('show_slash')==true){
					paper.getById(target.data('id_slash')).show();
				}
				/*paper.getById(target.data("id_text"))
					.attr({y : symbolY + symbolHeight  + (paper.getById(target.data("id_text")).getBBox().height/2)+5});
				if(target.data('triangle') != true && target.data("show_arrow")==true){
					paper.getById(target.data("id_text"))
						.attr({x : paper.getById(target.data("id_arrow")).getBBox().x 
								+ paper.getById(target.data("id_arrow")).getBBox().width
								+ 5});
				}else{*/

				//}
				paper.getById(target.data("id_text")).attr({x: target.getBBox().x + symbolToTextX[i],y: target.getBBox().y + symbolToTextY[i]}).toFront();

				if(target.data('show_text')==true){
					paper.getById(target.data('id_text')).show();
				}
				moveLimit(target.data('id_text'),'text');
			}
		}
	}
}



/*
接点をドラッグ：接点のみを動かす
*/
var dragStartCircle = 
function(x,y){
	initDragStart(x,y,this.data('centerId'),paper.getById(this.data('centerId')).data('connectorType'));
	this.attr({"opacity" : 0.5});
	dragAllCircle('start',this.id,x,y,-1,-1);
	//接点の表示
	circleArrayShowHide("show");
	
}
var dragMoveCircle =
function(dx,dy,x,y){
	initDragMove(dx,dy,x,y,this.id);
	dragAllCircle('move',this.id,-1,-1,dx,dy);
}
var dragEndCircle = 
function(){
	initDragEnd(obj.data('connectorType'));
	dragAllCircle('end',this.id,-1,-1,-1,-1);
	this.attr({"opacity" : 1});
}

function dragAllCircle(startORmoveORend,thisId,x,y,dx,dy){
	var target = paper.getById(thisId);
	var targetCenter = paper.getById(target.data('centerId'));
	var targetConnectorType = targetCenter.data('connectorType');
	
	if(startORmoveORend=='start'){
		target.ox = target.attr('cx');
		target.oy = target.attr('cy');
	}else if(startORmoveORend=='move' || startORmoveORend=='end'){
		if(startORmoveORend=='move'){
			target.attr({ cx : target.ox + dx,cy : target.oy + dy});
			moveLimit(target.id,'node');
		}
		if(targetConnectorType == 'ConnectorGenetic'){
			//一般的なコネクタの接点の場合：伸縮用接点を移動
			autoPlaceFlexCircle(target.id);
		}else if(targetConnectorType == 'MultipleGestation' && target.id == targetCenter.data('descentCircleId')){
			//多胎妊娠の血族の接点:centerとpokoのx座標も移動
			targetCenter.attr({'cx':target.attr('cx')});
			for (var i in targetCenter.data("pokoCircleList")){
				paper.getById(targetCenter.data("pokoCircleList")[i]).attr({'cx':targetCenter.attr('cx')});
			}
		}
		drawPathLine(targetCenter.data('connectorType'),targetCenter.id,thisId);
	}
}

/*
記号の移動
*/
var dragStartSymbol = 
function(x,y){
	//編集モードOFFのときは動かず、個体番号が移動する
	if(gridLineOn==false){
		/*var target = paper.getById(thisId);
		var individualNumPositionNum = this.data('individualNumPositionNum');
		if(individualNumPositionNum < 3){
			individualNumPositionNum += 1;
		}else{
			individualNumPositionNum = 0;
		}
		individual.attr({'text':"",'x': symbolCenter.attr('cx')-(gridX+10),'y':symbolCenter.attr('cy')-(gridY/2)});
		this.data('individualNumPositionNum') = individualNumPositionNum;
		if(symbolCenter.data("individualNumPositionNum")==0){
			individual.attr({'text':"",'x': symbolCenter.attr('cx')-(gridX+10),'y':symbolCenter.attr('cy')-(gridY/2)});
		}else if(symbolCenter.data("individualNumPositionNum")==1){
			individual.attr({'text':"",'x': symbolCenter.attr('cx')+(gridX+10),'y':symbolCenter.attr('cy')-(gridY/2)});
		}else if(symbolCenter.data("individualNumPositionNum")==2){
			individual.attr({'text':"",'x': symbolCenter.attr('cx')+(gridX+10),'y':symbolCenter.attr('cy')+(gridY/2)});
		}else if(symbolCenter.data("individualNumPositionNum")==3){
			individual.attr({'text':"",'x': symbolCenter.attr('cx')-(gridX+10),'y':symbolCenter.attr('cy')+(gridY/2)});
		}*/
		
		return "";
	}
	//初期化
	//半透明
	if(paper.getById(this.data('centerId')).data('triangle') == true){
		initDragStart(x,y,this.data("centerId"),'SymbolT');
		paper.getById(obj.data('symbol')).attr({"opacity" : 0.5});
	}else{
		initDragStart(x,y,this.data("centerId"),'Symbol');
		this.attr({"opacity" : 0.5});
	}
	
	//移動
	dragAllSymbol('start',this.id,x,y,-1,-1);
}

var dragMoveSymbol = 
function(dx,dy,x,y){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	initDragMove(dx,dy,x,y,this.id);//初期化
	dragAllSymbol('move',this.id,-1,-1,dx,dy);//移動
};

var dragEndSymbol = 
function(x,y){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない

	if(obj.data('triangle') == true){
		initDragEnd('SymbolT');
		paper.getById(obj.data('symbol')).attr({"opacity" : 1});
	}else{
		initDragEnd('Symbol');
		this.attr({"opacity" : 1});
	}
	//移動
	dragAllSymbol('end',this.id,x,y,-1,-1);
}

function dragAllSymbol(startORmoveORend,thisId,x,y,dx,dy){
	var target=paper.getById(thisId);
	var targetCenter = paper.getById(target.data('centerId'));
	var thisSymbol = paper.getById(targetCenter.data('symbol'));

	if(startORmoveORend=='start'){
		dragAll('start',[targetCenter.id],x,y,dx,dy);
		target.data('MoveCircle',searchMoveCircle(target.id,false));//一緒に移動する接点を登録
	}else if(startORmoveORend=='move'){
		dragAll('move',[targetCenter.id],y,x,dx,dy);
		//接点を動かす
		for(var i=0; i < thisSymbol.data('MoveCircle').length;i++){
			bondTargetPointMove(thisSymbol.data('MoveCircle')[i],thisSymbol.id,true);
			dragAllCircle('end',thisSymbol.data('MoveCircle')[i],-1,-1,-1,-1);
		}
	}else if(startORmoveORend=='end'){
		dragAll('end',[target.data('centerId')],x,y,dx,dy);
	}
}

//一般的なコネクタ：伸縮用接点とpokoの自動移動
function autoPlaceFlexCircle(thisId){
	var target = paper.getById(thisId);
	var center = paper.getById(target.data('centerId'));
	var childrenArray = center.data("children");
	var strChild = paper.getById(childrenArray[0]);
	var endChild = paper.getById(childrenArray[childrenArray.length-1]);
	if(childrenArray.length != 1){
		//血族
		if(center.data('descentCircleId') == target.id){
			if( target.attr('cx') > strChild.data("flexX") && target.attr('cx') < endChild.data("flexX")
			){
				center.attr({'cx': target.attr('cx')});
				for (var i in center.data("pokoCircleList")){
					paper.getById(center.data("pokoCircleList")[i]).attr({'cx':center.attr('cx')});
				}
			}
		}//子供
		else{
			//子供の接点
			if(strChild.id == target.id){
				//最初なら、配列の次に格納されているヤツ&centerよりも右に行かないようにする
				if(target.attr('cx') < paper.getById(childrenArray[1]).data("flexX") 
					&& target.attr('cx') < center.attr('cx')
				){
					target.data("flexX",target.attr('cx'));
				}
			}
			else if(endChild.id == target.id){
				//最後なら、配列の前に格納されているヤツ&centerよりも左に行かないようにする
				if(target.attr('cx') >= paper.getById(childrenArray[childrenArray.length-2]).data("flexX")
					&& target.attr('cx') >= (center.attr('cx'))
				){
					target.data("flexX",target.attr('cx'));
				}
			}
			else{
				//そうでないなら、前のヤツより左に、後のヤツより右に行かないようにする
				var i=0;
				while( i < childrenArray.length && childrenArray[i] != target.id){
					i++;
				}
				if(target.attr('cx') < paper.getById(childrenArray[i+1]).data("flexX")
					&& target.attr('cx') > paper.getById(childrenArray[i-1]).data("flexX")
				){
					target.data("flexX",target.attr('cx'));
				}
			}
		}
	}else{
		//血族関係の接点：centerとflexCirclのx座標も変更
		if(center.data('descentCircleId') == target.id){
			center.attr({'cx': target.attr('cx')});
			for (var i in center.data("pokoCircleList")){
				paper.getById(center.data("pokoCircleList")[i]).attr({'cx':center.attr('cx')});
			}
			target.data("flexX",target.attr('cx'));
		}
	}

}

//ポコドラッグ
var dragStartPoko = function (x,y){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	initDragStart(x,y,this.data("centerId"),paper.getById(this.data('centerId')).data('connectorType'));
	this.attr({"opacity" : 0.25});
	this.oy = this.attr('cy');
	//接点の表示
	circleArrayShowHide("show");
}
var dragMovePoko = function (dx,dy,x,y){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	initDragMove(dx,dy,x,y,this.id);
	var center = paper.getById(this.data("centerId"));
		this.attr({'cy' : this.oy+dy});
		moveLimit(this.id,'node');
	drawPathLine(center.data('connectorType'),center.id);
}
var dragEndPoko = function (){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	initDragEnd(paper.getById(this.data("centerId")).data('connectorType'));
	this.attr({"opacity" : 0.5});
}

//一般的なコネクタ・多胎妊娠のcenterのドラッグ
var dragStartTwoCenter = function (x,y){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	initDragStart(x,y,this.data("centerId"),paper.getById(this.data('centerId')).data('connectorType'));
	this.attr({"opacity" : 0.25});
	this.oy = this.attr('cy');
	//接点の表示
	circleArrayShowHide("show");
}
var dragMoveTwoCenter = function (dx,dy,x,y){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	initDragMove(dx,dy,x,y,this.id);
	var center = paper.getById(this.data("centerId"));

	this.attr({'cy' : this.oy+dy});
	moveLimit(this.id,'node');
	drawPathLine(center.data('connectorType'),center.id);
}
var dragEndTwoCenter = function (){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	initDragEnd(paper.getById(this.data("centerId")).data('connectorType'));
	this.attr({"opacity" : 0.5});
}

//婚姻関係の真ん中のドラッグ
var dragStartConnectorCenter = function (x,y){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	//remodelingModeがoffのときまたは,始点と終点のy座標が違うときは動かない
	initDragStart(x,y,this.id,this.data('connectorType'));

	var start=paper.getById(this.data("connectorStartId"));
	var end=paper.getById(this.data("connectorEndId"));
	if(this.data('remodelingMode')==false || (start.attr('cy') != end.attr('cy'))){
		return false;
	}
	
	this.attr({"opacity" : 0.25});
	initDragStart(x,y,this.data("centerId"),paper.getById(this.data('centerId')).data('connectorType'));
	this.oy = this.attr('cy');
	//接点の表示
	circleArrayShowHide("show");
}
var dragMoveConnectorCenter = function (dx,dy,x,y){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	//remodelingModeがoffのときまたは,始点と終点のy座標が違うときは動かない
	initDragMove(dx,dy,x,y,this.id);
	var start=paper.getById(this.data("connectorStartId"));
	var end=paper.getById(this.data("connectorEndId"));
	if(this.data('remodelingMode')==false || (start.attr('cy') != end.attr('cy'))){
		return false;
	}

	initDragMove(dx,dy,x,y,this.id);
	var center = paper.getById(this.data("centerId"));
	this.attr({'cy' : this.oy+dy});
	moveLimit(this.id,'node');
	if(this.attr('cy') <= start.attr('cy')){
		this.attr({'cy' : start.attr('cy')+gridY});
	}
	this.data('remodelingNum',((this.attr('cy')-start.attr('cy'))/gridY));
	drawPathLine(center.data('connectorType'),center.id);
}
var dragEndConnectorCenter = function (){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	initDragEnd(this.data('connectorType'));
	//remodelingModeがoffのときまたは,始点と終点のy座標が違うときは動かない
	var start=paper.getById(this.data("connectorStartId"));
	var end=paper.getById(this.data("connectorEndId"));
	if(this.data('remodelingMode')==false || (start.attr('cy') != end.attr('cy'))){
		return false;
	}
	
	this.attr({"opacity" : 0.5});
	initDragEnd(paper.getById(this.data("centerId")).data('connectorType'));
}

//dragStartの初期化
var holdUndoData=null;
function initDragStart(inputX,inputY,inputId,typeString){
	holdUndoData = JSON.stringify(createSaveData(true))
	saveX=inputX;
	saveY=inputY;
	dragBoolean=true;

	SubAllNone();

	obj = paper.getById(inputId);
	targetId = obj.id;

	//赤くする
	if(obj.data('connectorType')!=null){
		paper.getById(obj.data('connectorId')).attr({'stroke':'red'});
	}else{
		paper.getById(obj.data('symbol')).attr({'stroke':'red'});
	}
	
	//コネクタにinsertBefore(borderCircle)
	connectorInsertBefore(obj.id);

	//全ての接点を白くする(婚姻関係以外)
	for(var i=0;i<contactIdArray.length;i++){
		var thisCircle = paper.getById(contactIdArray[i]);
		if(thisCircle.id == thisCircle.data('centerId') 
			&& paper.getById(thisCircle.data('centerId')).data('connectorType')=='Connector'
		){
			thisCircle.attr({'fill':colorString});
		}else{
			thisCircle.attr({'fill':'white'});
		}
	}
}

//コネクタにinsertBefore(borderCircle)を行う
function connectorInsertBefore(centerId){
	var targetCenter = paper.getById(centerId);
	var targetConnectorType = targetCenter.data('connectorType');
	//操作したコネクタを全コネクタの上に
	if(targetConnectorType != null){
		//IDsを参照
		if(targetConnectorType == 'Connector' && targetCenter.data('remodelingMode')==false){
			targetCenter.insertBefore(borderCircle);//婚姻関係のcenter
		}
		for(var i=0;i<targetCenter.data('IDs').length;i++){
			paper.getById(targetCenter.data('IDs')[i]).insertBefore(borderCircle);
		}
		if(targetConnectorType != 'Connector'
			|| (targetConnectorType == 'Connector' && targetCenter.data('remodelingMode')==true)
		){
			targetCenter.insertBefore(borderCircle);//婚姻関係以外のcenter
		}
	}
}

//dragMoveの初期化
function initDragMove(dx,dy,x,y,thisId){
	dragBoolean=false;
}

//dragEndの初期化
function initDragEnd(typeString){
	//メニュー表示
	if(dragBoolean==true){
		subMenu(saveX,saveY,typeString);
	}else{
		saveOpenUndoData('save',holdUndoData)
	}
	holdUndoData = null;
	dragBoolean=false;
}

//テキスト移動
//ver0_1_5から追加
var dragStartText = function(x, y){
	this.data( "x", this.attr("x") );
    this.data( "y", this.attr("y") );
    saveOpenUndoData('save');
}
var dragMoveText = function(dx, dy, x, y){
	this.attr({
        "x" : this.data("x") + dx,
        "y" : this.data("y") + dy
    });
	moveLimit(this.id,'text');
}
var dragEndText = function(){
	
}

/*
その他関数
*/

//dragの制限
function moveLimit(targetId,textORnode){
	var target = paper.getById(targetId);
	var trueX;
	var trueY;
	
	if(textORnode=='node'){
		trueX = 0 + (Math.round(target.attr('cx') / gridX) * gridX);
		//0とmaxはダメ
		if(trueX > paperWidth){
			trueX = gridX * Math.floor( (paperWidth/gridX) );
		}else if(trueX <= 0){
			trueX = gridX;
		}
		trueY = 0 + (Math.round(target.attr('cy') / gridY) * gridY);
		//0とmaxはダメ
		if(trueY > paperHeight){
			trueY = gridY * Math.floor( (paperHeight/gridY) );
		}else if(trueY <= 0){
			trueY = gridY;
		}
		target.attr({cx : trueX,cy : trueY});
	}else if(textORnode=='text'){
		trueX = 0 + target.attr('x');
		//0とmaxはダメ
		if(trueX > paperWidth - target.getBBox().width){
			trueX = paperWidth - target.getBBox().width;
		}else if(trueX <= 0){
			trueX = 0;
		}
		trueY = 0 + target.attr('y');
		//0とmaxはダメ
		if(trueY > paperHeight - target.getBBox().height/2){
			trueY = paperHeight - target.getBBox().height/2;
		}else if(trueY <= 0 + target.getBBox().height/2){
			trueY = 0 + target.getBBox().height/2;
		}
		target.attr({x : trueX,y : trueY});
	}

}

//ある接点の中心座標がある記号の座標(ちょっと大きめ)に含まれているのかを調べる
function judgeInclud(aID,bID){
	var a = paper.getById(aID);		//a:中心座標を取得
	var b = paper.getById(bID);		//b:aの中心座標を含んでいるかを調べる
	if( (b.getBBox().x - 1 <= a.attr('cx') && a.attr('cx') <= (b.getBBox().x + b.getBBox().width + 1))
		&& (b.getBBox().y - 1 <= a.attr('cy') && a.attr('cy') <= (b.getBBox().y + b.getBBox().height + 1))
	){
		return true;
	}
	return false;
}

