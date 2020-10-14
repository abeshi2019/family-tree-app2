//戻る機能
var undoData=[];//ここに格納
function saveOpenUndoData(saveORopen,holdUndoData){
if(gridLineOn==false){return "";}//編集モードOFFのときは動かない
	if(saveORopen=='save'){
		if(holdUndoData==null){
			undoData.push(JSON.stringify(createSaveData(true)))//格納
		}else{
			undoData.push(holdUndoData)
		}
		//undoDataが３よりも大きい
		if(undoData.length > 5){
			undoData.splice(0,1);
		}
		undoButton.attr({"fill": "white","fill-opacity":0.01});
		//戻すボタン押下可能アピール（灰色を消す
	}else if(saveORopen=='open'&&undoData.length > 0){
		paperClear();
		openSaveData(eval(undoData.pop()))//開く
		if(undoData.length==0){
			undoButton.attr({"fill": "gray","fill-opacity":0.5})
			//戻すボタンを押せないアピール(灰色にする
		}
	}
}

function saveOpenData(txtOrString,saveOrOpen){
	if(gridLineOn==false){return "";}//編集モードOFFのときは動かない

	SubAllNone();

	if(saveOrOpen=='save'){
		SubAllNone();
	}else if(saveOrOpen=='open'){
		saveOpenUndoData('save')
		paperClear();
		/* for debugging.*/
		initWrapPaper();
	}
	var inputSaveDataForm  = document.getElementById("inputSaveData");
	var targetdiv = document.getElementById('saveDataTxt')
	
	//救済措置の説明
	guide = {
		save: "上記フォームに記載している文字列を全選択し、txtファイルに保存してください。",
		open: "保存したtxtファイルを開き、記載されている文字列を全て上記フォームに入力して下さい。\nその後,フォーム横のボタンを押してください。"
	};
	guideText = "\n---\n"+saveOrOpen + "が動作しない場合： \n" +guide[saveOrOpen] + "\n\t※文字列の編集は行わないでください\n"//※○○文字コード推奨";
	document.getElementById("guideText").innerText = guideText;

	if(saveOrOpen=='save'){
		inputSaveDataForm.value = JSON.stringify(createSaveData(true));
		if(txtOrString=='txt'){
		}
	}else if(saveOrOpen=='open'){
		if(txtOrString=='txt'){
			inputSaveDataForm.value = "";
		}else if(txtOrString=='string'){
			openSaveData(eval(inputSaveDataForm.value))
		}
	}
	
	targetdiv.style.display = 'block';
	var miniOpen = document.getElementById('miniOpen');
	if(saveOrOpen=='save'){
		miniOpen.style.display = 'none';
	}else if(saveOrOpen=='open'){
		miniOpen.style.display = 'block';
	}
}

//copy:OnOff
var cutMode=false;
function onCopyMode(cutModeTrue){
	SubAllNone();
	paperElement.attr({'fill':'none'})

	if(cutModeTrue==true){
		cutMode = true;
	}else{
		cutMode = false;
	}
	return true;
}

//copy:コピーする記号を判定する関数
function serchCopyCenter(){
	var copyCenterArray=[];
	for(var i = 0; i < centerIdArray.length; i++){
		var targetCenter = paper.getById(centerIdArray[i]);
		var targetCopy;
		if(targetCenter.data('connectorType') != null){
			targetCopy = paper.getById(targetCenter.data('connectorId'));
		}else{
			targetCopy = paper.getById(targetCenter.data('symbol'));
		}
		//coprRectの中に要素が含まれているか判定
		if((copyRect.getBBox().x-5) <= targetCopy.getBBox().x
			&& (copyRect.getBBox().x+copyRect.getBBox().width+5) >= (targetCopy.getBBox().x+targetCopy.getBBox().width)
			&& (copyRect.getBBox().y-5) <= targetCopy.getBBox().y
			&& (copyRect.getBBox().y+copyRect.getBBox().height+5) >= (targetCopy.getBBox().y+targetCopy.getBBox().height)
		){
			copyCenterArray[copyCenterArray.length] = targetCenter.id;
		}
	}
	return copyCenterArray;
}

//copy:実際に記号のコピーを行う関数
//作成する記号のcenter : コピー元の座標 + (クリックした所の座標-copyRectの座標)
function copyCreateSymbol(beforeXY,afterXY,centerArray){
	saveOpenUndoData('save')
	var copyCenterArray = centerArray;
	var trueXY={'x':(afterXY['x']-beforeXY['x']),'y':(afterXY['y']-beforeXY['y'])};

	var saveData=[]
	for(var i = 0; i < copyCenterArray.length; i++){
		var targetCenter = paper.getById(copyCenterArray[i]);
		
		var object = createJsonData(targetCenter,trueXY);
		if (object) {
			saveData.push(object);
		}
		//カットアンドペーストの場合,元のヤツ削除
		if(cutMode == true){
			remove(targetCenter.id);
		}
	}
	openSaveData(saveData);
}

/*
JSONデータをもとに家系図記号を作成
*/
function openSaveData(saveData){
	//最初にキャンバスのサイズを変更
	for(var i=0;i<saveData.length;i++){
		var line = saveData[i];
		var elementType = line['center']['type'];
		if(
			elementType=='Adoption' || elementType=='NoChildren' ||elementType=='NotAvailable'
			|| elementType=='MultipleGestation' || elementType=='ConnectorGenetic'|| elementType=='Connector'
			|| elementType=='circle' || elementType=='rect' || elementType=='diamond'||elementType=='triangle'
		){
			// DEBUG
			newCreateElement(line)
		}else if(elementType=='size'){
			//一番最初に呼び出されるはず
			paperSetSize(line['paperSize']['paperWidth'],line['paperSize']['paperHeight'])
		}else if(elementType='wrapPaper'){
			showHideWrapPaper(true)//paperを表示して描画しないと不具合がおきるっぽい
			for(var j=0; j < line['text'].length; j++){
				var target = line['text'][j];
				createWrapText(target['text'],{'x':target['x'],'y':target['y']})
			}
			showHideWrapPaper(false)
		}
	}
}

/*
ここからJSONデータ作成
*/
function createSaveData(paperSize){
	var saveData = [];
	//キャンバスの大きさも(最初に)データに含める
	if(paperSize==true){
		var paperSizeData = {
			center:{type: 'size'},
			paperSize: {
				paperWidth: paperWidth,
				paperHeight: paperHeight
			}
		}
		saveData.push(paperSizeData);
	}
	for(var node = paper.bottom; node != null; node = node.next) {
		if (node && node.type && node.id == node.data("centerId")) {
			var object = createJsonData(node)
			if (object) {
				saveData.push(object);
			}
		}
	}
	saveData.push(jsonWrapPaper());//wrapPaperに関するjson
	return saveData;
}
function createJsonData(targetCenter,plusNumXY){
	var plusX=0;
	var plusY=0;
	if(plusNumXY!=null){
		plusX=plusNumXY['x'];
		plusY=plusNumXY['y'];
	}
	var node = targetCenter;
	//養子
	if(node.data('connectorType') == "Adoption"){
		var object = {
			center: {
				cx: node.attr('cx')+plusX,
				cy: node.attr('cy')+plusY,
				type: node.data('connectorType')
			}
		}
		var inOut=['in','out'];//inout
		for(var i = 0;i<inOut.length;i++){
			var target = paper.getById(node.data("id_"+inOut[i]+"Circle"));
			object[inOut[i]+"Circle"] = {
				cx: target.attr('cx')+plusX,
				cy: target.attr('cy')+plusY,
				show: node.data("show_"+inOut[i]+"Line")
			}
		}
	}//子供のいない夫婦
	else if(node.data('connectorType') == "NoChildren"){
		var object = {
			center: {
				cx: node.attr('cx')+plusX,
				cy: node.attr('cy')+plusY,
				type: node.data('connectorType'),
				infertility: node.data("show_infertility")
			}
		}
	}//家族関係不明
	else if(node.data('connectorType') == 'NotAvailable'){
		var object = {
			center: {
				cx: node.attr('cx')+plusX,
				cy: node.attr('cy')+plusY,
				type: node.data('connectorType'),
			}
		}
	}//多胎妊娠・一般的なコネクタ
	else if(node.data('connectorType') == 'MultipleGestation'
		|| node.data('connectorType') == 'ConnectorGenetic'
	){
		var descentCircle = paper.getById(node.data("descentCircleId"));
		var object = {
			center: {
				cx: node.attr('cx')+plusX,
				cy: node.attr('cy')+plusY,
				type: node.data('connectorType'),
				multipleType: node.data('multipleType'),
				childPokoList: node.data('childPokoList'),
			},
			descentCircle: {
				cx: descentCircle.attr('cx')+plusX,
				cy: descentCircle.attr('cy')+plusY,
			}
		}
		var children = node.data("children");
		var list=[];
	
		for(var i=0; i < children.length; i++){
			var child = paper.getById(children[i]);
			list[i] = {
				cx: child.attr('cx')+plusX,
				cy: child.attr('cy')+plusY,
				flexX: child.data('flexX')+plusX
			}
		}
		object['children'] = list;
	
		var pokoCircleList = node.data("pokoCircleList");
		list={};
		for(var i in pokoCircleList){
			var targetPoko = paper.getById(pokoCircleList[i]);
			list[i] = {
				cx: targetPoko.attr('cx')+plusX,
				cy: targetPoko.attr('cy')+plusY,
				color: targetPoko.attr('fill'),
			}
		}
		object['poko'] = list;
	}//婚姻関係
	else if(node.data('connectorType') == 'Connector'){
		var object = {
			center: {
				cx: node.attr('cx')+plusX,
				cy: node.attr('cy')+plusY,
				type: node.data('connectorType'),
				//breakLine: node.data("show_breakLine"),
				breakLineRLH:node.data("breakLineRLH"),
				consanguinity: node.data("consanguinity"),
				remodelingMode: node.data('remodelingMode'),
				remodelingNum: node.data('remodelingNum'),
				'stroke-dasharray': paper.getById(node.data('connectorId')).attr("stroke-dasharray")//追加
			}
		}
		var strEnd = ["Start","End"];
		for(var i=0;i<strEnd.length;i++){
			var target = paper.getById(node.data("connector"+strEnd[i]+"Id"));
			object[strEnd[i]] = {
				cx: target.attr('cx')+plusX,
				cy: target.attr('cy')+plusY,
			}
		}
	}//ここから記号
	else if(node.data('connectorType') == null){
		var symbol = paper.getById(node.data('symbol'));
		var symbolType = node.data('symbolType');
		//丸・四角・菱形
		if(symbolType == "circle" || symbolType == "rect" || symbolType == "diamond"){
			var object = {
				center: {
					cx: node.attr('cx')+plusX,
					cy: node.attr('cy')+plusY,
					type: symbolType,
				},
				color: {
					//sprit: node.data("split"),//間違ってた、けどしばらく使っているのでそのまま･･･。いつか消す
					split: node.data("split"),
					type: node.data("colorType"),
					color: node.data("trueColor")
				},
				//ver0_1_4以前の保存形式
				/*text:
					paper.getById(node.data('id_text')).attr('text'),*/
				//ver0_1_5からテキストのx,y座標、フォントサイズfont-sizeを保存
				//テキストのx,yはシンボル、ノードに対して相対的な値を保存
				text: {
					text: paper.getById(node.data('id_text')).attr('text'),
					x: paper.getById(node.data('id_text')).attr('x')+node.attr('width')/2,
					y: paper.getById(node.data('id_text')).attr('y')+node.attr('height')/2,
					size: paper.getById(node.data('id_text')).attr('font-size')
				},
					
				multiple:
					paper.getById(node.data("id_multiple")).attr('text')
				//個体番号の保存
				/*individualNumPositionNum: 
					node.data('individualNumPositionNum')*/
			}
		}
		//三角
		else if(symbolType == "triangle"){
			var object = {
				center: {
					cx: node.attr('cx')+plusX,
					cy: node.attr('cy')+plusY,
					type: symbolType
					//ver0.1.4以前の保存形式
					//color: node.data("colorType")
				},
				
				/*
				 * ver0_1_5から本当の意味での色を保存するcolorを追加
				 * colorの中のcolorに本当の意味での色を保存
				 * さらに三角以外のシンボルと保存形式を同じ構造にしたかったため
				 * centerのcolorをcolorのtypeに移動、変更して保存
				 */
				color: {
					type: node.data("colorType"),
					color: node.data("trueColor")
				},
				//ver0_1_4以前の保存形式
				/*text: 
					paper.getById(node.data('id_text')).attr('text'),*/
				//ver0_1_5からテキストのx,y座標、フォントサイズfont-sizeを保存
				//テキストのx,yはシンボル、ノードに対して相対的な値を保存
				text: {
					text: paper.getById(node.data('id_text')).attr('text'),
					x: paper.getById(node.data('id_text')).attr('x')+node.attr('width')/2,
					y: paper.getById(node.data('id_text')).attr('y')+node.attr('height')/2,
					size: paper.getById(node.data('id_text')).attr('font-size')
				}
				//個体番号の保存
				/*individualNumPositionNum: 
					node.data('individualNumPositionNum')*/
				
			}
		}
		var list={};
		var dataArray = ["circle","text","slash","asterisk","verticalLine"
			,"multiple","pregnancy","donor","surrogate","arrow","proband"];
		for(var i=0;i<dataArray.length;i++){
			list[dataArray[i]] = node.data("show_"+dataArray[i]);
		}
		object['show']=list;
	}
	return object;
}
