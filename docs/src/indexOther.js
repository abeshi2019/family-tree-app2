/*
その他
*/

//図形の中心座標を取得する関数
function center(xORy,id){
	var target = paper.getById(id);
	if(xORy == "x"){
		return  target.getBBox().x + (target.getBBox().width / 2);
	}else if(xORy == "y"){
		return  target.getBBox().y + (target.getBBox().height / 2);
	}
	else{
		return 0;
	}
}

//図形の上下左右の中心を取得する関数
function centerTbrl(tbrl,xORy,id){
	if(xORy == "x"){
		if( tbrl == "top" ){
			return  paper.getById(id).getBBox().x + (paper.getById(id).getBBox().width / 2);
		}
		else if (tbrl == "bottom" ){
			return  paper.getById(id).getBBox().x + (paper.getById(id).getBBox().width / 2);
		}
		else if( tbrl == "left" ){
			return  paper.getById(id).getBBox().x;
		}
		else if (tbrl =="right" ){
			return  paper.getById(id).getBBox().x + paper.getById(id).getBBox().width;
		}
	}
	else if(xORy == "y"){
		if( tbrl == "top" ){
			return  paper.getById(id).getBBox().y;
		}
		else if (tbrl == "bottom" ){
			return  paper.getById(id).getBBox().y + paper.getById(id).getBBox().height;
		}
		else if( tbrl == "left" ){
			return  paper.getById(id).getBBox().y + (paper.getById(id).getBBox().height / 2);
		}
		else if (tbrl =="right" ){
			return  paper.getById(id).getBBox().y + (paper.getById(id).getBBox().height / 2);
		}
	}
	return -1;
}

//図形の上下左右の中心のうち、どれが一番近い距離にあるか調べる関数
//Ａに調べたい図形の座標
	function pythagoras(Aid,Bid){
		var t = Math.sqrt(Math.pow(center("x",Bid) - centerTbrl("top","x",Aid),2) 
				+ Math.pow(center("y",Bid) - centerTbrl("top","y",Aid),2));
		var b = Math.sqrt(Math.pow(center("x",Bid) - centerTbrl("bottom","x",Aid),2) 
				+ Math.pow(center("y",Bid) - centerTbrl("bottom","y",Aid),2));
		var l = Math.sqrt(Math.pow(center("x",Bid) - centerTbrl("left","x",Aid),2) 
				+ Math.pow(center("y",Bid) - centerTbrl("left","y",Aid),2));
		var r = Math.sqrt(Math.pow(center("x",Bid) - centerTbrl("right","x",Aid),2) 
				+ Math.pow(center("y",Bid) - centerTbrl("right","y",Aid),2));

		var ans = t;
		var ansString ="top";

		if(ans > b){
			ans = b;
			ansString = "bottom";
		}
		if(ans > l){
			ans = l;
			ansString = "left";
		}
		if(ans > r){
			ans = r;
			ansString = "right";
		}
			return ansString;
	}
