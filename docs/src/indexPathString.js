//path書き換え
function drawPathLine(pathType,targetCenterId,thisId){
	var pathString,subPathString;
	var targetCenter = paper.getById(targetCenterId);
	var connectorWhite = paper.getById(targetCenter.data("connectorWhiteId"));
	var connector = paper.getById(targetCenter.data("connectorId"));

	if(pathType=='Adoption'){
		//養子
		var targetCenterX = targetCenter.getBBox().x;
		var targetCenterY = targetCenter.getBBox().y;
		var targetCenterHeight = targetCenter.getBBox().height;
		var targetCenterWidth = targetCenter.getBBox().width;

		var inORout = ["in","out"];
		for(var i=0;i<inORout.length;i++){
			var circle = paper.getById(targetCenter.data("id_"+inORout[i]+"Circle"));
			var line = paper.getById(targetCenter.data("id_"+inORout[i]+"Line"));
			if(targetCenter.data("show_"+inORout[i]+"Line") == true){
				pathString =  "M" + targetCenter.attr("cx") + "," + (targetCenter.attr("cy") - (targetCenterHeight / 2))
				+ "L" + circle.attr("cx") + "," + circle.attr("cy") + "z";
			}else{
				pathString = "";
			}
			line.attr({"path" : pathString});
			subPathString += pathString;
		}
		
		pathString = "M" + targetCenterX + "," + targetCenterY
			+ "L" + (targetCenterX + (targetCenterWidth / 4) ) +","+ targetCenterY+ "z"
			+ "M" + targetCenterX + "," + targetCenterY
			+ "L" + targetCenterX + "," + (targetCenterY + targetCenterHeight)+ "z"
			+ "M" + targetCenterX + "," + (targetCenterY + targetCenterHeight)
			+ "L" + (targetCenterX + (targetCenterWidth / 4) ) +","+ (targetCenterY + targetCenterHeight)+ "z"
			+ "M" + (targetCenterX + targetCenterWidth) + "," + targetCenterY
			+ "L" + (targetCenterX + (3 * targetCenterWidth / 4) ) +","+ targetCenterY+ "z"
			+ "M" + (targetCenterX + targetCenterWidth) + "," + targetCenterY
			+ "L" + (targetCenterX + targetCenterWidth) + "," + (targetCenterY + targetCenterHeight)+ "z"
			+ "M" + (targetCenterX + targetCenterWidth) + "," + (targetCenterY + targetCenterHeight)
			+ "L" + (targetCenterX + (3 * targetCenterWidth / 4) ) +","+ (targetCenterY + targetCenterHeight)+ "z";
		connectorWhite.attr({"path" :pathString + subPathString});
		connector.attr({"path" :pathString});
	}else if(pathType=='NoChildren'){
		//子供のいない夫婦
		var pathString
			= "M" + targetCenter.attr("cx") + "," + targetCenter.attr("cy") + "L" + ",v" + 50
			+ "M"+(targetCenter.attr("cx") -25) +"," + (targetCenter.attr("cy")+50) + "h" + 50;
		if(targetCenter.data("show_infertility") == true){
			pathString += "M"+(targetCenter.attr("cx") -25) +"," + (targetCenter.attr("cy")+60) + "h" + 50;
			//不妊症を表す線
		}
		connectorWhite.attr({"path" :pathString});
		connector.attr({"path" :pathString});
		
	}else if(pathType=='NotAvailable'){
		//家族関係が不明
		var pathString = "M " + targetCenter.attr('cx') + "," + targetCenter.attr('cy') + ",v" + -50;
		var unknown = paper.getById(targetCenter.data("unknownId"));
		
		connectorWhite.attr({"path" :pathString});
		connector.attr({"path" :pathString});
		unknown.attr({ x : targetCenter.attr('cx'), y : targetCenter.attr('cy') - 65});
		
	}
	else if(pathType=='MultipleGestation' || pathType=='ConnectorGenetic'){
		//多胎妊娠・一般的なコネクタ
		connectorWhite.attr({"path" :pathStringConnectorOrMultipleGestation(0,targetCenter.id,thisId)});
		connector.attr({"path" :pathStringConnectorOrMultipleGestation(0,targetCenter.id,thisId)});
	}
	else if(pathType=='Connector'){
		//婚姻
		var breakLineWhite = paper.getById(targetCenter.data("id_breakLineWhite"));
		var breakLine = paper.getById(targetCenter.data("id_breakLine"));

		connectorWhite.attr({"path" :pathStringConnector(0,targetCenter.id)});
		connector.attr({"path" :pathStringConnector(0,targetCenter.id)});
		breakLineWhite.attr({"path" :pathStringConnector(1,targetCenter.id)});
		breakLine.attr({"path" :pathStringConnector(1,targetCenter.id)});

		if(targetCenter.data("consanguinity")==true){
			var whitePath = paper.getById(targetCenter.data("whitePathId"));
			whitePath.attr({"path" :pathStringConnector(0,targetCenter.id)});
		}
	}
	else{
		//ここから記号(symbolType)
		var targetSymbol = paper.getById(targetCenter.data('symbol'));
		var underWhite = paper.getById(targetCenter.data("underWhite"));

		if(pathType == "circle"){
			targetSymbol.attr({ cx : targetCenter.attr('cx'),cy : targetCenter.attr('cy')});
			underWhite.attr({ cx : targetCenter.attr('cx'),cy : targetCenter.attr('cy')});
		}else if(pathType == "rect"){
			targetSymbol.attr({ x : targetCenter.attr('cx') - (targetSymbol.getBBox().width/2)
				,y : targetCenter.attr('cy') - (targetSymbol.getBBox().height/2)});
			underWhite.attr({ x : targetCenter.attr('cx') - (targetSymbol.getBBox().width/2)
				,y : targetCenter.attr('cy') - (targetSymbol.getBBox().height/2)});
		}else if(pathType == "path"){
			//三角形
			if(targetCenter.data('triangle') == true){
				//pathString = 'M'+ (targetCenter.attr('cx') - 15) +','+ (targetCenter.attr('cy')+5)//左
				//+'L'+ (targetCenter.attr('cx')) +','+ (targetCenter.attr('cy')-15)//上
				//+'L'+ (targetCenter.attr('cx')+15) +','+ (targetCenter.attr('cy')+5) +",z";//右
        		//三角形の大きさの修正を行った部分。
				pathString = 'M'+ (targetCenter.attr('cx') - 20) +','+ (targetCenter.attr('cy')+15)//左
				+'L'+ (targetCenter.attr('cx')) +','+ (targetCenter.attr('cy')-17)//上
				+'L'+ (targetCenter.attr('cx')+20) +','+ (targetCenter.attr('cy')+15) +",z";//右

			}//菱形
			else{
				pathString = "M"+ targetCenter.attr('cx') +","+ (targetCenter.attr('cy') - (symbolSize*2/3)) 
					+ "L" + (targetCenter.attr('cx') - (symbolSize*2/3)) + "," + targetCenter.attr('cy')
					+ "L" + targetCenter.attr('cx') + "," + (targetCenter.attr('cy') + (symbolSize*2/3))
					+ "L" + (targetCenter.attr('cx') + (symbolSize*2/3)) + "," + targetCenter.attr('cy') + "Z";
				underWhite.attr({"path":pathString});
			}
			targetSymbol.attr({'path' : pathString});
		}
	}
}

//多胎妊娠と一般的なコネクタのpath:
function pathStringConnectorOrMultipleGestation(type,centerId,thisId){
	var pathString="";
	var targetCenter = paper.getById(centerId);
	var descentCircle = paper.getById(targetCenter.data("descentCircleId"));
	var pathType = targetCenter.data('connectorType');
	var childArray = targetCenter.data("children");
	
	var pokoPathString="",R=15;//pokoの半径
	var pokoArray = [paper.getById(targetCenter.data("pokoCircleList")["red"])
					,paper.getById(targetCenter.data("pokoCircleList")["blue"])];
	if(pokoArray[0].attr('cy') >= pokoArray[1].attr('cy')){
		pokoArray = [pokoArray[1],pokoArray[0]];
	}
	var pokoWhiteArray = [];
	for(var i=0;i<targetCenter.data("pokoWhiteList").length;i++){
		pokoWhiteArray[pokoWhiteArray.length] = paper.getById(targetCenter.data("pokoWhiteList")[i]);
	}

	//【子供用poko】おかしな描画をしていても気にしないで計算する
	var childPoko = paper.getById(targetCenter.data('childPoko'));
	var fstChild = paper.getById(childArray[0]);
	var endChild = paper.getById(childArray[childArray.length-1]);
	childPoko.attr({'cx':Math.abs( (fstChild.attr('cx')+endChild.attr('cx')) / 2),
	'rx': Math.abs( (fstChild.attr('cx')-endChild.attr('cx')) / 2)});


	if(pokoArray[0].attr('fill') != 'none' && pokoArray[1].attr('fill') != 'none'){
		for(var i=0;i<pokoArray.length;i++){
			var targetPoko = pokoArray[i];
			if(i==0){
				pathString += "M" + descentCircle.attr('cx')+ "," + descentCircle.attr('cy')
					+ "L" + targetPoko.attr('cx') + "," + (targetPoko.attr('cy') - R)
			}
			if(targetPoko.attr('fill') != 'none'){
			 	var pokoPathString = "M" + targetPoko.attr('cx') + " " + (targetPoko.attr('cy') - R)
					+ "A" + R + " " + R + " " + 0 + " " + 0 + " " + 1 + " " + targetPoko.attr('cx') + " " + (targetPoko.attr('cy') + R);
			 	pathString += pokoPathString;
				pokoWhiteArray[i].attr({"path":pokoPathString});
			}else{
			 	pathString += "M" + targetPoko.attr('cx') + " " + (targetPoko.attr('cy') - R)
			 		+ "L" + targetPoko.attr('cx') + " " + (targetPoko.attr('cy') + R)
				pokoWhiteArray[i].attr({"path":""});
			}
			if(i != pokoArray.length-1){
				var nextPoko = pokoArray[i+1];
				pathString += "M" + targetPoko.attr('cx') + " " + (targetPoko.attr('cy') + R)
					+ "L " + nextPoko.attr('cx') + " " + (nextPoko.attr('cy') - R)
			}else{
				pathString += "M" + targetPoko.attr('cx') + "," + (targetPoko.attr('cy') + R)
					+ "L" +  targetCenter.attr('cx') + "," + targetCenter.attr('cy') + "z";
			}
		}
	}else if(pokoArray[0].attr('fill') != 'none' || pokoArray[1].attr('fill') != 'none'){
		for(var i=0;i<pokoArray.length;i++){
			var targetPoko = pokoArray[i];
			if(targetPoko.attr('fill') != 'none'){
				var pokoPathString = "M" + targetPoko.attr('cx') + " " + (targetPoko.attr('cy') - R)
					+ "A" + R + " " + R + " " + 0 + " " + 0 + " " + 1 + " " + targetPoko.attr('cx') + " " + (targetPoko.attr('cy') + R);
				pathString += "M" + descentCircle.attr('cx')+ "," + descentCircle.attr('cy')
					+ "L" + targetPoko.attr('cx') + "," + (targetPoko.attr('cy') - R)
					+ pokoPathString 
					+ "M" + targetPoko.attr('cx') + "," + (targetPoko.attr('cy') + R)
					+ "L" +  targetCenter.attr('cx') + "," + targetCenter.attr('cy') + "z";
				pokoWhiteArray[i].attr({"path":pokoPathString});
			}else{
				pokoWhiteArray[i].attr({"path":""});
			}
		}
	}else{
		pathString += "M " + targetCenter.attr('cx')+ "," + targetCenter.attr('cy')
			+ "L" + descentCircle.attr('cx')+ "," + descentCircle.attr('cy');
		for(var i=0;i<pokoWhiteArray.length;i++){
			pokoWhiteArray[i].attr({'path' : ""});
		}
	}
	if(pathType=='MultipleGestation'){
		var mX = [],mY = [],point;
		var multipleType = targetCenter.data("multipleType");
		for (var i = 0; i < childArray.length; i++) {
			var targetChild = paper.getById(childArray[i])
			subPathString = "M " +  targetCenter.attr('cx') + ","+ targetCenter.attr('cy')
			if(childPoko.attr('fill')!='none' && targetCenter.data("childPokoList")[i]==true){
				subPathString += 
				" L " + targetChild.attr('cx') + "," + (childPoko.attr('cy')-R) 
				+ "M" + targetChild.attr('cx') + " " + (childPoko.attr('cy')-R)
				+ "A" + R + " " + R + " " + 0 + " " + 0 + " " + 1 + " " 
				+ targetChild.attr('cx') + " " + (childPoko.attr('cy')+R)
				+ "M " + targetChild.attr('cx') + "," + (childPoko.attr('cy')+R) + "z";
			}
			subPathString += "L" + targetChild.attr('cx') + "," + targetChild.attr('cy');
		
			//一卵性用
			if( multipleType == "monozygotic" && (i == 0 || i == (childArray.length - 1)) ){
				var pointConector = paper.getById(targetCenter.data("connectorId"));
				pointConector.attr({"path" :subPathString});
				point = pointConector.getPointAtLength(30);
				if(i == 0){
					mX[0] = point.x;
					mY[0] = point.y;
				}else{
					mX[1] = point.x;
					mY[1] = point.y;
				}
			}

			pathString += subPathString;
		}
		var unknown = paper.getById(targetCenter.data("unknownId"));
		unknown.attr({ x : targetCenter.attr('cx'), y : targetCenter.attr('cy') +20}).hide();
		if(multipleType == "monozygotic"){
			pathString +=  "M " + mX[0] + ","+ mY[0] + "L" + mX[1] + "," + mY[1];
		}else if(multipleType == "unknown"){
			unknown.show();
		}
	}else if(pathType=='ConnectorGenetic'){
		//同胞の線
		pathString += "M " + paper.getById(childArray[0]).data("flexX") + "," + targetCenter.attr('cy')
			+ "L " + paper.getById(childArray[childArray.length-1]).data("flexX") + "," + targetCenter.attr('cy');
		//子供の線
		for (var i = 0; i < childArray.length; i++) {
			var targetChild = paper.getById(childArray[i])
			var fstX;
			if(childArray.length != 1){
				fstX = targetChild.data("flexX")
			}else{
				fstX = targetCenter.attr('cx')
			}
			
			pathString += "M " + fstX + "," + targetCenter.attr('cy') + " L " + targetChild.attr('cx') + ",";
			if(childPoko.attr('fill')!='none' && targetCenter.data("childPokoList")[i]==true){
				pathString += (childPoko.attr('cy')-R) +"M" + targetChild.attr('cx') + " " + (childPoko.attr('cy')-R)
				+ "A" + R + " " + R + " " + 0 + " " + 0 + " " + 1 + " " 
				+ targetChild.attr('cx') + " " + (childPoko.attr('cy')+R)
				+ "M " + targetChild.attr('cx') + "," + (childPoko.attr('cy')+R) + " L " + targetChild.attr('cx') + ",";
			}
			pathString += paper.getById(childArray[i]).attr('cy') + "z";
		}
	}
	return pathString;
}
//婚姻のpath
function pathStringConnector(type,centerId){
	var thisRemodelingNum=0;
	
	var targetCenter = paper.getById(centerId);
	
	var start = paper.getById(targetCenter.data("connectorStartId"));
	var end = paper.getById(targetCenter.data("connectorEndId"));
	if(targetCenter.data("breakLineRLH")=="left"){
		end = paper.getById(targetCenter.data("connectorStartId"));
		start= paper.getById(targetCenter.data("connectorEndId"));
	}
	if(targetCenter.data('remodelingMode') == true){
		thisRemodelingNum = gridY * targetCenter.data('remodelingNum');
	}

	var pathString = "M" + start.attr("cx") + " , " + (start.attr("cy")+thisRemodelingNum)
		+ "L" + end.attr("cx") + " , " + (end.attr("cy")+thisRemodelingNum) + "z"
		+ "M" + start.attr("cx") + " , " + start.attr("cy")
		+ "L" + start.attr("cx") + " , " + (start.attr("cy")+thisRemodelingNum) + "z"
		+ "M" + end.attr("cx") + " , " + end.attr("cy")
		+ "L" + end.attr("cx") + " , " + (end.attr("cy")+thisRemodelingNum) + "z";

	//centerを真ん中に&大きさを変える
	targetCenter.attr({ cx : (start.attr('cx') + end.attr('cx'))/2
			, cy : ((start.attr('cy') + end.attr('cy'))/2) + thisRemodelingNum})
		.attr({'rx': Math.abs((start.attr('cx') - end.attr('cx'))/2)});

	if(type==0){
		return pathString;
	}else if(type==1){
		var breakLinePoint;
		var connector = paper.getById(targetCenter.data("connectorId"));
		if(targetCenter.data("breakLineRLH")=="right"||targetCenter.data("breakLineRLH")=="left"){
			breakLinePoint = connector.getPointAtLength(35);
			return "M" + (breakLinePoint.x + 10) + "," + (breakLinePoint.y - 10) +
			"L" + (breakLinePoint.x - 10) + "," + (breakLinePoint.y + 10) + "z";
		}else{
			return "";
		}

	}
}


