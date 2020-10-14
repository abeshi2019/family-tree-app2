/*
新規作成ボタンやサブメニュー画面などを作成する
メニュー画面：
現在はページが読み込まれたときに一括で作成しているが、
表示される度にメニュー画面作成・非表示の際に作成したメニュー画面削除のほうが良いかもしれない
*/

var targetCreateElement;//新規作成ボタンを灰色にする（今からこの記号を作成しますよと言う目印）

//記号の色についての変数：不恰好なのでハッシュか何かで統一したい
	var splitNum;
	var colorBase;
	var split4_1,split4_2,split4_3,split4_4;

//本当の意味での色変更じに使うカラーパレット
	var colorPalette = {"black":"red","red":"green","green":"blue","blue":"black"};
	var colorOption;

var buttonAttrTool = {"fill": "white", "stroke": "black", "stroke-width": 2,"fill-opacity":0.01};
var textAttrTool = {"font-size": 12 , "stroke": "black", "stroke-width": 0};
var pathAttrTool = {"stroke": "black", "stroke-width": 2};
var colorBaseAttrTool = {"fill": "45-gray-black", "stroke": "white", "stroke-width": 3,"fill-opacity":0.25};

//各ボタン用の変数（copy,edit,undo
	var copyButton;
	var editButton;
	var undoButton;	
	
//このページの関数(ツール関係の作成)を全て呼び出す、サブ以外
function createTools(){
	document.getElementById('toolPaper').style.display='block';
	document.getElementById('subTools').style.display='block';

	newCreateTools('tool',1,17,"toolPaper");
	
	newCreateTools('wrapPaperTextCreate',1,2,"buttonWrapPaperTextCreate");
	newCreateTools('wrapPaperTextChange',1,3,"buttonWrapPaperTextChanbe");
	
	newCreateTools('toolRight',2,4,"toolRightButton");
}

//サブメニューのボタンで最初に呼び出す
function initSubButton(){
	saveOpenUndoData('save')//一つ前に戻るためのデータを保存
}

var clickColorBase = 
function(){
	initSubButton();
	colorChange(this.data("pushNum"),true,targetId);
};

function newCreateTools(type,bLength,bSide,divName){
	//作成するdiv
	var targetIdName = divName;
	document.getElementById(targetIdName).style.display = 'block';
	//paper宣言
	var plusYPaper = 0,plusXPaper=5;
	if(type=='symbol'||type=='symbolT'){
		plusYPaper = 10+116;
	}else if(type=='tool'){
		plusXPaper=bSide;
		plusYPaper =10;
	}
	var targetPaper = Raphael(targetIdName, 55*plusXPaper, 55*bLength+ plusYPaper);

	//【記号：色変更】
	var plusYButton=0;
	if(type=='symbol' || type=='symbolT'){
		//色変更:これを基に、分割なし~4分割をpath要素で作成する
		colorBase = targetPaper.circle(50,50,45).attr(colorBaseAttrTool)
		if(type=='symbol'){
			colorBase.data("pushNum",0).click(clickColorBase).hide();
		}else if(type=='symbolT'){
			colorBase.click(function (){initSubButton();colorChageTriangle(true,obj.id)});
		}
		if(type=='symbol'){
			split4_1 = targetPaper.path("").attr(colorBaseAttrTool).data("pushNum",0).click(clickColorBase);
			split4_2 = targetPaper.path("").attr(colorBaseAttrTool).data("pushNum",1).click(clickColorBase);
			split4_3 = targetPaper.path("").attr(colorBaseAttrTool).data("pushNum",2).click(clickColorBase);
			split4_4 = targetPaper.path("").attr(colorBaseAttrTool).data("pushNum",3).click(clickColorBase);
			//分割数変更_ no,2,3,4
			splitNum = targetPaper.text(0,0,"No split")
				.attr({"font-size": 20 , "stroke": "black", "stroke-width": 0});
			var button = targetPaper.rect(colorBase.getBBox().x+colorBase.getBBox().width+15
					,colorBase.attr('cy')-(45/2),80,45,8)
				.attr(buttonAttrTool).click(function(){initSubButton();splitChange(true);});
			splitNum.attr({"x":button.getBBox().x + (button.getBBox().width/2)
				,"y":button.getBBox().y+(button.getBBox().height/2)});
			
			//ver0_1_5での追加ここから
			colorOption = targetPaper.text(0,0,"");
			var button2 = targetPaper.rect(button.getBBox().x+button.getBBox().width+15,button.getBBox().y,45,45,8)
			.attr(buttonAttrTool).click(function(){initSubButton();trueColorChange(true);});
			trueColorChange(false);
			colorOption.attr({"x":button2.getBBox().x + (button2.getBBox().width/2),"y":button2.getBBox().y + (button2.getBBox().height/2)}).attr(textAttrTool);
			button2.toFront();
			//ver0_1_5での追加ここまで
			
		}else if(type=='symbolT'){
			colorOption = targetPaper.text(0,0,"");
			var button = targetPaper.rect(colorBase.getBBox().x+colorBase.getBBox().width+15,colorBase.attr('cy')-(45/2),45,45,8)
			.attr(buttonAttrTool).click(function(){initSubButton();trueColorChange(true);});
			trueColorChange(false);
			colorOption.attr({"x":button.getBBox().x + (button.getBBox().width/2),"y":button.getBBox().y + (button.getBBox().height/2)}).attr(textAttrTool);
			button.toFront();
		}
		var text = targetPaper.text(colorBase.getBBox().x + colorBase.getBBox().width
				,colorBase.getBBox().y + colorBase.getBBox().height+15,"図をタッチして色変更")
			.attr(textAttrTool);
		
		text.attr({"x":colorBase.getBBox().x + colorBase.getBBox().width+(text.getBBox().width/2)+5
			,"y":colorBase.getBBox().y + colorBase.getBBox().height});
		
		 plusYButton = text.getBBox().y + text.getBBox().height+15;
	}

	//【tool：どのボタンが押されているのかを記憶する】
	if(type == 'tool'){
		targetCreateElement = targetPaper.rect(0,0,40,40,8)
			.attr({"stroke": "none","fill": "gray","fill-opacity":1})
			.data('targetCreateElementNum',-1).hide();
	}

	//【ボタンの外枠作成→ボタンの中のデザイン作成→ボタン押下時の動作指定】
	for(var i=0; i < bLength; i++){
		for(var j=0; j < bSide; j++){
			if((type == 'symbol' && i==2 && 2<=j)||(type == 'symbolT' && i==0 && j==2)){
				continue;
			}
			var button = targetPaper.rect(5+(55*j),5 + (55*i) + plusYButton,45,45,8).attr(buttonAttrTool);

			if((type == 'symbol' && i==2) || (type == 'symbolT' && i==1)){
				button.attr({"y":button.attr("y")+10});
			}else if(type=='tool' && (j==10 || j==12)){
				button.attr({"y":button.attr("y")+45/4});
			}
			
			var butX = button.attr("x"), butWidth = button.attr("width");
			var butY = button.attr("y"), butHeight = button.attr("height");
			var butCx = button.attr("x") + button.attr("width")/2;
			var butCy = button.attr("y") + button.attr("height")/2;

			if(type == 'adoption'){
			//サブメニュー画面：養子の線
				var inOut=['in','out','remove'];
				button.data('inORout',inOut[j]);
				targetPaper.text(butCx,butCy,button.data('inORout')).attr(textAttrTool);
				if(j==0||j==1){
					button.click(function(){initSubButton();showHideAdoption(this.data('inORout'));});
				}else if(j==2){
					button.click(function(){initSubButton();remove();});
				}
			
			}else if(type=='noChildren'){
			//サブメニュー画面：子供なしの線
				if(j==0){
					var pathString =  "M" + butCx + "," + (butY+5)
						+ "L" + butCx +","+ (butY+butHeight*2/3);
					for(var k=0;k<2;k++){
						pathString += "M" + (butX+5) + "," + (butY+butHeight*2/3+(k*7))
							+ "L" + (butX+butWidth-5) +","+ (butY+butHeight*2/3+(k*7));
					}
					targetPaper.path(pathString).attr(pathAttrTool);
					button.click(function(){initSubButton();showHideNoChildren();});
				}else if(j==1){
					targetPaper.text(butCx,butCy,"remove").attr(textAttrTool);
					button.click(function(){initSubButton();remove();});
				}
			}else if(type=='notAvailable'){
			//サブメニュー画面：家族関係不明
					targetPaper.text(butCx,butCy,"remove").attr(textAttrTool);
					button.click(function(){initSubButton();remove();});
			}else if(type=='multipleGestation' || type=='connectorGenetic'){
			//サブメニュー画面：血族関係・多胎妊娠
				var toolButtonHash={
					'connectorGenetic'  : [ ['red','blue','green','remove'], []],
					'multipleGestation' : [ ['red','blue','green','monozygotic','dizygotic'], ['unknown','remove']]
				}
				if(toolButtonHash[type][i][j] =='red' 
					|| toolButtonHash[type][i][j] =='blue' 
					|| toolButtonHash[type][i][j] =='green'
				){
					var pathString = "M" + butCx + "," + (butY+5) + "L" + butCx +","+ (butCy-10)
						+ "M" + butCx + " " + (butCy-10)
						+ "A" + 10 + " " + 10 + " " + 0 + " " + 0 + " " + 1 + " " + butCx + " " + (butCy+10)
						+ "M" + butCx + "," + (butCy+10) + "L" + butCx +","+ (butCy+15)
						+ "M" + butCx + "," + (butCy+15) + "L" + (butCx-23+8) +","+ (butCy+23-1)
						+ "M" + butCx + "," + (butCy+15) + "L" + (butCx+23-8) +","+ (butCy+23-1) + "z";
					targetPaper.path(pathString).attr(pathAttrTool);
					targetPaper.text(button.attr("x")+15,butCy,toolButtonHash[type][i][j]).attr(textAttrTool);
					button.data('colortext',toolButtonHash[type][i][j])
						.click(function(){initSubButton();showHidePoko(this.data('colortext'));});
				}
				else if(toolButtonHash[type][i][j] =='monozygotic'
					|| toolButtonHash[type][i][j] =='dizygotic'
					|| toolButtonHash[type][i][j] =='unknown'
				){
					var pathString = "M" + butCx + "," + (butY+5) + "L" + butCx +","+ (butY+butHeight/3)
						+ "M" + butCx + "," + (butY+butHeight/3) + "L" + (butCx-butWidth/2) +","+ (butY+butHeight-10)
						+ "M" + butCx + "," + (butY+butHeight/3) + "L" + (butCx+butWidth/2) +","+ (butY+butHeight-10) + "z";
					
					if(toolButtonHash[type][i][j] =='monozygotic'){
						pathString += 'M' + (butCx-15) + " " + (butCy+5) + "L" + (butCx+15) +" "+(butCy+5);
					}else if(toolButtonHash[type][i][j] =='unknown'){
						targetPaper.text(butCx,butCy+10,"?").attr(textAttrTool).attr({"font-size": 15});
					}
					
					targetPaper.path(pathString).attr(pathAttrTool);
					button.data('typeString',toolButtonHash[type][i][j])
					.click(function(){initSubButton();changeMultipleType(this.data('typeString'));});
				}
				else if(toolButtonHash[type][i][j] =='remove'){
					targetPaper.text(butCx,butCy,"remove").attr(textAttrTool);
					button.click(function(){initSubButton();remove();});
					if(type == 'multipleGestation'){
						button.toFront();
						break;
					}
				}
			}else if(type=='relationships'){
			//サブメニュー画面：婚姻関係
				var relaList = ["breakLine","underLine","engagement","remove"];
				if(relaList[j]=="breakLine"){
					option = targetPaper.text(butCx,butCy,"〃").attr(textAttrTool).attr({"font-size": 30});
					button.click(function(){initSubButton();showHideConnector();});
				}else if(relaList[j]=="underLine"){
					//|_|
					pathString= 'M' + (butX + 10) +' '+ (butY+10) + 'L' + (butX + 10) +' '+ (butY+butHeight-10)
						+ 'M' + (butX + butWidth - 10) +' '+ (butY+10)
						+ 'L' + (butX + butWidth - 10) +' '+ (butY+butHeight-10)
						+ 'M' + (butX + 10) +' '+ (butY+butHeight-10)
						+ 'L' + (butX + butWidth - 10) +' '+ (butY+butHeight-10);
					targetPaper.path(pathString).attr(pathAttrTool).attr({"stroke-width": 3});
					button.click(function(){initSubButton();changeRemodelingMode();});
				}else if(relaList[j]=="engagement"){
					pathString= 'M' + (butX+5) +' '+ (butY+butHeight/2) + 'L' + (butX + butWidth-5) +' '+ (butY+butHeight/2);
					targetPaper.path(pathString).attr(pathAttrTool)
						.attr({"stroke-width": 3,"stroke-dasharray":"-"});
					button.click(function(){initSubButton();engagement();});
				}else if(relaList[j]=="remove"){
					targetPaper.text(butCx,butCy,"remove").attr(textAttrTool);
					button.click(function(){initSubButton();remove();});
				}
			}else if(type=='symbol'||type=='symbolT'){
			//サブメニュー画面：人物を表す記号のボタン部分
				var showHideText = [["circle","slash","asterisk","verticalLine","pregnancy"],
					["donor","surrogate","arrow","proband","remove"],["multiple","update"]];
				if(type=='symbolT'){
					showHideText = [["slash","remove"],["text","update","size"]];
				}
				
				button.data("showHideText",showHideText[i][j]);
				var option;
				if(showHideText[i][j]=="circle"){
					option = targetPaper.circle(butCx,butCy,10).attr({"fill": "black", "stroke-width": 0});
				}else if(showHideText[i][j]=="slash"){
					var pathString = "M" + (butX+butWidth-10) + " " + (butY+10)
						 + "L" + (butX+10) + " " + (butY+butHeight-10);
					option = targetPaper.path(pathString).attr(pathAttrTool);
				}else if(showHideText[i][j]=="asterisk"){
					option = targetPaper.text(butCx+10,butCy+10,"＊").attr(textAttrTool).attr({"font-size": 25});
				}else if(showHideText[i][j]=="verticalLine"){
					var pathString = "M" + butCx + " " + (butY+5) + "L" + butCx + " " + (butY+butHeight-5);
					option = targetPaper.path(pathString).attr(pathAttrTool);
				}else if(showHideText[i][j]=="pregnancy" || showHideText[i][j]=="donor"
					|| showHideText[i][j]=="surrogate" || showHideText[i][j]=="multiple"
				){
					var text = {"pregnancy":"P","donor":"D","surrogate":"S","multiple":"n"};
					option = targetPaper.text(butCx,butCy,text[showHideText[i][j]]).attr(textAttrTool).attr({"font-size": 25});
				}else if(showHideText[i][j]=="arrow"){
					var pathString = "M" + butCx + " " + butCy + "L" + (butX+5) + " " + (butCy+15);
					option = targetPaper.path(pathString).attr(pathAttrTool).attr({"arrow-start" :"block-wide-long"})
				}else if(showHideText[i][j]=="proband"){
					option = targetPaper.text(butCx-10,butCy+10,"P").attr(textAttrTool).attr({"font-size": 20});
				}else if(showHideText[i][j]=="remove"){
					option = targetPaper.text(butCx,butCy,"remove").attr(textAttrTool);
				}else if(showHideText[i][j]=="text"){
					option = targetPaper.text(butCx,butCy,"text").attr(textAttrTool).attr({"font-size": 20});
				}else if(showHideText[i][j]=="update"){
					option = targetPaper.text(butCx,butCy,"update").attr(textAttrTool);
				}else if(showHideText[i][j]=="size"){
					option = targetPaper.text(butCx,butCy,"size").attr(textAttrTool);
				}
				
				if(showHideText[i][j]=="remove"){
					button.click(function(){initSubButton();remove();});
				}else if(showHideText[i][j]=="update"){
					if(type=='symbol'){
						button.click(function(){initSubButton();multiple();});
					}else if(type=='symbolT'){
						button.click(function(){textInOut('textT');});
					}
				}else if(showHideText[i][j]=="size"){
					button.click(function(){initSubButton();textSizeChange();});
				}else{
					button.click(
						function(){initSubButton();showHide("id_"+this.data("showHideText"),"show_"+this.data("showHideText"));});
				}
			}if(type=='tool'){
			//新規作成：家系図記号
				if(j==10 || j==12){
					var upORdown=['up','down'];
					for(var k = 0; k < 2;k++){
						var arrow = targetPaper.rect(butX,butY+(k*butHeight/2)-(Math.pow(-1,k)*2.5),45,23)
							.attr({"stroke-width": 0,"opacity" : 0.01 ,'fill':'white'})
							.data("text",text).data("upORdown",upORdown[k]);
						targetPaper.text(butCx,arrow.attr('y')+arrow.attr('height')/2, arrow.data("upORdown"))
							.insertBefore(arrow).attr(textAttrTool).attr({"font-size": 15});
							var typeString = {10:"genetic",12:"multiple"};
						arrow.data("typeString",typeString[j])
							.drag(function(){}
								,function(){
									SubAllNone();
									this.attr({"opacity" : 1.0});
									childUpDown(this.data("upORdown"),this.data("text"),this.data("typeString"));
								}
								,function(){this.attr({"opacity" : 0.01}
							);
						});
					}
					text.insertAfter(arrow);
					button.remove();
				}else if(0<=j && j<=6){
					if(j==0 || j==1){
						option = targetPaper.rect(butX+8,butY+8,29,29);
					}else if(j==2 || j==3){
						option = targetPaper.circle(butCx,butCy,15);
					}else if(j==4){
						var pathString = "M" + butCx + "," + (butY+5) + "L" + (butX+5) + "," + butCy
						 + "L" + butCx + "," + (butY+butHeight-5) + "L" + (butX+butWidth-5) + "," + butCy +"z";
						option = targetPaper.path(pathString);
					}else if(j==5 || j==6){
						var pathString = "M" +  butCx + "," + (butY+10)
							+ "L" + (butX+5) + "," + (butCy +10) +"L" + (butX+butWidth-5) + "," + (butCy+10) +"z";
						option = targetPaper.path(pathString);
						
					
					}
					if(j==1||j==3||j==6){
						option.attr({"fill":"black"});
					}
					option.attr({"stroke": "black", "stroke-width": 2}).insertBefore(button);
				}else if(j==13){
					option = targetPaper.text(butCx, butCy, "？\n｜")
						.attr(textAttrTool).attr({"font-size": 18,"stroke-width": 1}).insertBefore(button);
				}else if(7 <= j && j<=16){
					if(j==7){
						var pathString = "M" + (butX+5) + "," + butCy +"L" +(butX+butWidth-5) +","+butCy +"z";
					}else if(j==8){
						var pathString = "M" + (butX+5) + "," + (butCy-5) +"L" +(butX+butWidth-5) +","+(butCy-5)+
									"M" + (butX+5) + "," + (butCy+5) +"L" +(butX+butWidth-5) +","+(butCy+5) + "z";
					}else if(j==9){
						var pathString = "M" + butCx + "," + (butY+5) + "L" + butCx +","+ butCy +
							 "M" + (butX+8) + "," + butCy + "L" + (butX+butWidth-8) +","+ butCy +
							 "M" + (butX+8) + "," + butCy + "L" + (butX+8) +","+ (butY+butHeight-5)+
							 "M" + (butX+butWidth-8) + "," + butCy + "L" + (butX+butWidth-8) +","+ (butY+butHeight-5) + "z";
					}else if(j==11){
						var pathString = "M" + butCx + "," + (butY+5) + "L" + butCx +","+ butCy +
							 "M" + butCx + "," + butCy + "L" + (butX+8) +","+ (butY+butHeight-5)+
							 "M" + butCx + "," + butCy + "L" + (butX+butWidth-8) +","+ (butY+butHeight-5) + "z";
					}else if(j==14){
						var pathString = "M" + butCx + "," + (butY+5) + "L" + butCx+ "," + (butCy+10)
							 + "M"+ (butX+5) +"," + (butCy+10) + "L" + (butX+butWidth-5) + "," + (butCy+10)+"z";
					}else if(j==15){
						var pathString = "M" + butCx + "," + (butY+5) + "L" + butCx+ "," + (butCy+7)
							 + "M"+ (butX+5) +"," + (butCy+7) + "L" + (butX+butWidth-5) + "," + (butCy+7)
							 + "M"+ (butX+5) +"," + (butCy+15) + "L" + (butX+butWidth-5) + "," + (butCy+15)+"z";
					}else if(j==16){
						var pathString = "M"+ (butX+8) + " " + (butY+8) + "L" + (butX+8) + " " + (butY+butHeight-8)
						+ "M"+ (butX+8) + " " + (butY+8) + "L" + (butX+15) + " " + (butY+8)
						+ "M"+ (butX+8) + " " + (butY+butHeight-8) + "L" + (butX+15) + " " + (butY+butHeight-8)
						+ "M"+ (butX+butWidth-8) + " " + (butY+8) + "L" + (butX+butWidth-8) + " " + (butY+butHeight-8)
						+ "M"+ (butX+butWidth-8) + " " + (butY+8) + "L" + (butX+butWidth-15) + " " + (butY+8)
						+ "M"+ (butX+butWidth-8) + " " + (butY+butHeight-8) + "L" + (butX+butWidth-15) + " " + (butY+butHeight-8)+"z";
					}
					option = targetPaper.path(pathString)
						.attr({"stroke": "black", "stroke-width": 3})
						.insertBefore(button);
					if(j==9||j==11){
						var text = targetPaper.text(butX+butWidth,butY+butHeight, "2")
							.attr({"font-size": 40 , "fill":"black","stroke-width": 0});
					}
				}
				if(!(j==10 || j==12)){
					button.data('typeNum',j+1)
						.click(function(){
							SubAllNone();
							targetCreateElement
								.attr({'x' : this.attr('x')+(5/2),'y':this.attr('y')+(5/2)})
								.data('targetCreateElementNum',this.data('typeNum')).show();
							
						});
				}
			}else if(type=="toolRight"){
			//Undo,Copyなどの項目
				var textArray=[["Clear","Edit","Copy","Undo"],["save","open"]];
				button.attr({"height": button.attr("height") / 2}).data('text',textArray[i][j]);
				if(i==0){
					button.attr({"x":275-((45+10)*(j+1))})
				}else if(i==1){
					button.attr({"y":5+(i*(45/2+20))})
				}
				
				option = targetPaper.text(button.attr("x")+(button.attr("width")/2)
				,button.attr("y")+(button.attr("height")/2),textArray[i][j]).attr(textAttrTool);

				if(textArray[i][j]=="Undo"){
					button.data('text',option)
						.click(function(){saveOpenUndoData('open');})
						.attr({"fill": "gray","fill-opacity":0.5});
					undoButton = button;
				}
				else if(textArray[i][j]=="Copy"){
					button.data('text',option)
					.click(function(){
						var changeText = {'Copy':'Cut','Cut':'Copy'};
						var buttonFill = ['blue','red'];
						if(gridLineOn==true && this.attr("fill") != 'white'){
							this.data('text').attr({'text': changeText[this.data('text').attr('text')]})
						}
						if(gridLineOn==true){
							onCopyMode((this.data('text').attr('text')=='Cut'));
							this.attr({"fill": buttonFill[Number(gridLineOn)],"fill-opacity":0.5});
						}
					});
					copyButton = button;
				}else if(textArray[i][j]=="Edit"){
					editButton = button;
					button.click(function(){gridLineOnOff(true);});
				}else if(textArray[i][j]=="Clear"){
					button.click(function(){clear();});
				}else if(textArray[i][j]=="save"||textArray[i][j]=="open"){
					button.click(function(){saveOpenData('txt',this.data('text'));});
					if(textArray[i][j]=="open"){
						button.toFront();
						targetPaper.setSize(275,button.attr("y")+button.attr("height")+5);
						break;
					}
				}
				button.toFront();
			}else if(type=='wrapPaperTextCreate'||type=='wrapPaperTextChange'){
			//メニュー画面：EditOFF時の文字入力
				button.attr({'height':button.attr('height')/2})
				button.attr({
					'x': (55*plusXPaper)-(button.attr('width')+10)*(j+1),
					'y': button.attr('y')+button.attr('height')
				});
				var text={'wrapPaperTextCreate':['Size','決定'],'wrapPaperTextChange':['削除','Size','変更']};
				var inputText = targetPaper.text(button.attr("x")+(button.attr("width")/2),button.attr("y")+(button.attr("height")/2)+3,
						text[type][j]);
				inputText.attr(textAttrTool);
				// Raphael text bug - https://github.com/DmitryBaranovskiy/raphael/issues/491
				$('tspan', inputText.node).attr('dy', 0);
				if(text[type][j]=='決定'){//新規作成
					button.click(
						function(){
							createWrapText(document.getElementById('textWrapPaper').value);
						}
					);
				}else if(text[type][j]=='削除'){
					button.click(function(){removeWrapPaper();});
				}else if(text[type][j]=='変更'){
					button.click(function(){changeWrapPaper();});
					document.getElementById('subToolWrapPaperText').style.display='none';//今だけ
				}else if(text[type][j]=='Size'){
					button.click(function(){changeTextSizeWrapPaper();});
				}
			}
			
			button.toFront();
		}
	}
	
	//【文字入力(三角以外の人物記号)】
	if(type=='symbol'){
		targetPaper = Raphael(targetIdName+'_b', 275, 70);
		for(var i=0;i<3;i++){
			button = targetPaper.rect((55*i)+5,20,45,45,8).attr(buttonAttrTool);
			var butCx = button.attr("x") + button.attr("width")/2;
			var butCy = button.attr("y") + button.attr("height")/2;
			if(i==0){
				option = targetPaper.text(butCx,butCy,"text").attr(textAttrTool).attr({"font-size": 20});
				button.data("showHideText","text");
				button.click(function(){initSubButton();showHide("id_"+this.data("showHideText"),"show_"+this.data("showHideText"))});
			}else if(i==1){
				option = targetPaper.text(butCx,butCy,"update").attr(textAttrTool);
				button.click(function(){initSubButton();textInOut('text');});
			}else if(i==2){
				option = targetPaper.text(butCx,butCy,"size").attr(textAttrTool);
				button.click(function(){initSubButton();textSizeChange();});
			}
			button.toFront();
		}
	}
}

//色変更ボタン表示数変更
function colorChangeButton(splitNum){
	var symbol = colorBase;
	var pathString="";

	var bBoxXY = [symbol.getBBox().x,symbol.getBBox().y];
	var bBoxW = symbol.getBBox().width;
	var bBoxH = symbol.getBBox().height;
	var centerXY = [bBoxXY[0]+(bBoxW/2) , bBoxXY[1]+(bBoxH/2)];
	var symbolR = (bBoxW/2);

	var split = {"4_1":split4_1,"4_2":split4_2,"4_3":split4_3,"4_4":split4_4}

	if(splitNum>=1){
		colorBase.show();
		for(i in split){
			split[i].attr({"path":""}).hide();
		}
	}
	if(splitNum>=2){
		for(var i=0; i<4; i++){
			if(i < 2){
				pathString = "M" + centerXY[0] + " " + (centerXY[1]-symbolR)
					+ "A" + symbolR + " " + symbolR + " " + 0 + " " + 0 + " " + i + " "
					+ centerXY[0] + " " + (centerXY[1]+symbolR)+"Z";
			}
			split["4_"+(i+1)].attr({"path":pathString}).show();
			pathString = "";
		}
		colorBase.hide();
	}
	if(splitNum>=3){
		//後回し
	}
	if(splitNum==4){
		//まとめれそう
		//左上
		pathString = "M" + centerXY[0] + " " + (centerXY[1]-symbolR)
			+ "A" + symbolR + " " + symbolR + " " + 0 + " " + 0 + " " + 0 + " "
			+ (centerXY[0]-symbolR) + " " + centerXY[1] + "L" + centerXY[0] + " " + centerXY[1]+"Z";
		split4_1.attr({"path":pathString}).show();
		//右上
		pathString = "M" + centerXY[0] + " " + (centerXY[1]-symbolR)
			+ "A" + symbolR + " " + symbolR + " " + 0 + " " + 0 + " " + 1 + " "
			+ (centerXY[0]+symbolR) + " " + centerXY[1] + "L" + centerXY[0] + " " + centerXY[1]+"Z";
		split4_2.attr({"path":pathString}).show();
		//左下
		pathString = "M" + centerXY[0] + " " + (centerXY[1]+symbolR)
			+ "A" + symbolR + " " + symbolR + " " + 0 + " " + 0 + " " + 1 + " "
			+ (centerXY[0]-symbolR) + " " + centerXY[1] + "L" + centerXY[0] + " " + centerXY[1]+"Z";
		split4_3.attr({"path":pathString}).show();
		//右下
		pathString = "M" + centerXY[0] + " " + (centerXY[1]+symbolR)
			+ "A" + symbolR + " " + symbolR + " " + 0 + " " + 0 + " " + 0 + " "
			+ (centerXY[0]+symbolR) + " " + centerXY[1] + "L" + centerXY[0] + " " + centerXY[1]+"Z";
		split4_4.attr({"path":pathString}).show();
		colorBase.hide();
	}
}

//分割数変更
function splitChange(change){
	var obj = paper.getById(targetId);
	var split = obj.data("split");
	var pathString;
	if(change==true){
		if(split!=4){
			split++;
		}else{
			split=1;
		}
		//現在、3分割は後回し
		if(split==3){
			split++;
		}
	}
	obj.data("split",split);
	if(split!=1){
		pathString= split + " split";
	}else{
		pathString= "No split";
		//4分割→分割なしの時、左上の要素で塗りつぶす
		colorChange(0,false,obj.id);
	}
	splitNum.attr({"text":pathString});
	colorChangeButton(split);
}

//本当の意味での色変更
function trueColorChange(boolean){
	
	var obj = paper.getById(targetId);
	
	var trueColor = obj.data("trueColor");
	if(boolean==false){
		colorOption.attr({"text":trueColor});
		return "";
	}
	var nextTrueColor = colorPalette[trueColor];
	colorOption.attr({"text":nextTrueColor});
	obj.data("trueColor",nextTrueColor);
	
	var dataArray;
	//三角以外
	if(obj.data("symbolType") != "triangle"){
		var colorIdList = obj.data("colorId");
		dataArray = ["circle","text","slash","asterisk","verticalLine"
		     			,"multiple","pregnancy","donor","surrogate","arrow","proband"];
		for(var i = 0;i < colorIdList.length;i++){
			paper.getById(colorIdList[i]).attr({"fill":nextTrueColor,"stroke":nextTrueColor});
		}
	}else{//三角の時
		var colorId = obj.data("symbolColorId");
		dataArray = ["text","slash"];
		paper.getById(colorId).attr({"fill":nextTrueColor,"stroke":nextTrueColor});
		if(obj.data("colorType")==1){
			paper.getById(obj.data("symbol")).attr({"fill":nextTrueColor});
		}
	}
	
	for(var i = 0; i < dataArray.length; i++){
		paper.getById(obj.data("id_"+dataArray[i])).attr({"fill":nextTrueColor,"stroke":nextTrueColor});
	}
	
}
