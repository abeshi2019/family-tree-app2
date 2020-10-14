/*
EditOFF時の動作
・作成した家系図にタイトルなどの文字を入力する
→作成した家系図に線を引く機能などを追しても良いかもしれない
*/
var wrapPaper;
var wrapPaperRect;
var targetElement = null;//現在操作中の文字
var clickCircle;//ここをクリックしていますという目印の赤い丸
var wrapXY={'x':0,'y':0};

function showHideWrapPaper(show){
	var wrapPaperDiv = document.getElementById('wrapPaper');
	if(show==true){
		wrapPaperDiv.style.display='block';
		createWrapPaper();
	}else{
		wrapPaperDiv.style.display='none';
		wrapTargetChange('black',targetElement);
		wrapPaperExitButton();
	}
}

function initWrapPaper(){
	wrapPaper = Raphael("wrapPaper",0,0);
	wrapPaperRect = wrapPaper.rect(0,0,0,0).click(wrapClick);
	clickCircle = wrapPaper.circle(0,0,10).attr({'stroke-width':5,'stroke':'red','stroke-opacity':0.5}).hide();
	createWrapPaper();
	showHideWrapPaper(false)
}

function createWrapPaper(){

	wrapPaper.setSize(paperWidth,paperHeight);
	wrapPaperRect.attr({'width':paperWidth, 'height':paperHeight,'fill':'white',"opacity" : 0.01});
	
	//console.log("here");
	//console.log(wrapPaper);
	//console.log(wrapPaperRect);
}

var wrapClick = function (e,x,y){
	//console.log('click');
	//text新規作成呼び出し
	wrapPaperExitButton();
	clickCircle.attr({'cx':x,'cy':y}).show();
	document.getElementById('subToolWrapPaperText').style.display='block';
	document.getElementById('buttonWrapPaperTextCreate').style.display='block';
	document.getElementById('buttonWrapPaperTextChanbe').style.display='none';//変更のメニューボタンは非表示
	wrapXY['x']=x;
	wrapXY['y']=y;
}

var openWrapTool=false;
var dragStartWrapText = function(x,y){
	openWrapTool=true;
	this.data('xy',{'x':x,'y':y});
	this.data('text').attr({"opacity" : 0.5});
	 wrapPaperExitButton();
}

var dragMoveWrapText = function(dx,dy){
	openWrapTool=false;
	this.attr({
		'x': this.data('xy')['x']-(this.getBBox().width/2)+dx,
		'y': this.data('xy')['y']-(this.getBBox().height/2)+dy
	});
	
	this.data('text').attr({
		'x':this.attr('x')+(this.getBBox().width/2),
		'y':this.attr('y')+(this.getBBox().height/2)
	});
}

var dragEndWrapText = function(){
	this.data('text').attr({"opacity" : 1});
	wrapTargetChange('black',targetElement);
	
	if(openWrapTool==true){
		wrapPaperExitButton();
		document.getElementById('textWrapPaper').value = this.data('text').attr('text')
		document.getElementById('subToolWrapPaperText').style.display='block';
		document.getElementById('buttonWrapPaperTextCreate').style.display='none';
		document.getElementById('buttonWrapPaperTextChanbe').style.display='block';//変更のメニューボタンは非表示
		wrapTargetChange('red',this.data('text'));
	}else{
		document.getElementById('subToolWrapPaperText').style.display='none';
	}
}

//文字を赤くしたり黒くしたりする
function wrapTargetChange(color,target){
	if(target != null){
		target.attr({'fill':color});
		if(target==targetElement){
			targetElement = null;
		}else{
			targetElement = target;
		}
	}
}

//ボタン
//決定(新規作成)
function createWrapText(textString,hashXY){
	if(textString != "" && textString!=null){
		var text = wrapPaper.text(0,0,textString)
			.attr({"font-size": 18, "stroke": "black","stroke-width": 0,'text-anchor':'start'});

		if(hashXY != null){
			text.attr({'x': hashXY['x'],'y': hashXY['y']});
		}else{
			text.attr({'x':wrapXY['x'],'y':wrapXY['y']});
		}
		var rect = wrapPaper.rect(text.getBBox().x,text.getBBox().y,text.getBBox().width,text.getBBox().height);
		rect.attr({'stroke':'none','fill':'white',"opacity" : 0.01})
			.data('text',text)
			.drag(dragMoveWrapText,dragStartWrapText,dragEndWrapText);
		text.data('rect',rect);
		
		wrapTargetChange('black',targetElement);
		wrapTargetChange('red',text);
	}
}

//内容の変更
function changeWrapPaper(){
	var textString = document.getElementById('textWrapPaper').value;
	if(textString != "" && textString!=null){
		var text = targetElement.attr({'text':textString});
		targetElement.data('rect')
			.attr({'width':text.getBBox().width,'height':text.getBBox().height})
			.attr({'x':text.getBBox().x,'y':text.getBBox().y})
	}
}

//文字サイズ変更
function changeTextSizeWrapPaper(){
	//18と15を入れ替え
	var textSize = {18:15,15:18};
	if(targetElement!=null){
		targetElement
			.attr({"font-size": textSize[targetElement.attr("font-size")]});
		targetElement.data('rect')
			.attr({'width':text.getBBox().width,'height':text.getBBox().height})
			.attr({'x':text.getBBox().x,'y':text.getBBox().y});
	}
}

//削除
function removeWrapPaper(){
	targetElement.data('rect').remove();
	targetElement.remove();
	wrapPaperExitButton();
}

//閉じる・もう使っていない
function wrapPaperExitButton(){
	document.getElementById('subToolWrapPaperText').style.display='none';
	document.getElementById('textWrapPaper').value="";
	wrapTargetChange('black',targetElement);
	if(clickCircle!=null){
		clickCircle.hide();
	}
}

//json出力
function jsonWrapPaper(){
	var jsonArray=[];
	
	for(var node = wrapPaper.bottom; node != null; node = node.next){
		if(node.type=='text'){
			var jsonData = {
					text: node.attr('text'),
					x: node.attr('x'),
					y: node.attr('y')
				};
			jsonArray.push(jsonData);
		}
	}
	
	return {center:{type:'wrapPaper'},'text':jsonArray};
}

