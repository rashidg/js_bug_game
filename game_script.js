window.onload=init;

var timeRemaining, currentLevel, isPaused, spawnTime;
var lvl1Score=0, lvl2Score=0;
var foodItems = [], bugs = [];
var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

function init(){
	canvas.addEventListener("mousedown", baam, false);
	if (localStorage.getItem('currentLevel') <= 0)
		localStorage.setItem('currentLevel',1);
	currentLevel = localStorage.getItem('currentLevel');
	document.getElementById('score').innerHTML='Score: 0';
	prepareFood();
	timeRemaining = 61;
	spawnTime = 59;
	if (currentLevel != 2)
		lvl1Score = 0;
	lvl2Score = 0;
	isPaused = 0;

	renderInterval= setInterval(render,1);

	timerInterval = setInterval(timer,1000);

}
function render(){
	if (isPaused)
		return;
	context.clearRect(0,0,400,600);
	
	for (var i=0; i<foodItems.length; i++)
	{
		context.beginPath();
		context.arc(foodItems[i].x, foodItems[i].y, 10, 0, 2 * Math.PI, false);
		context.fillStyle = "green";
		context.fill();
	}


	for (var i=0; i<bugs.length; i++)
	{
		bugs[i].target = foodItems[0];
		var mindist = 1000;

		for (var j=0; j<foodItems.length; j++)
		{
			var dx = foodItems[j].x - bugs[i].x;
			var dy = foodItems[j].y - bugs[i].y;
			var dist = Math.sqrt(dx*dx+dy*dy);
			if (dist < mindist){
				mindist = dist;
				bugs[i].target = foodItems[j];
			}
		}
		var dx = bugs[i].target.x - (bugs[i].x);
		var dy = bugs[i].target.y - (bugs[i].y);
		var rad = Math.atan2(dy,dx);
		var dist = Math.sqrt(dx*dx+dy*dy);
		context.save();
		context.translate(bugs[i].x, bugs[i].y);
		context.rotate(rad+0.5*Math.PI);
		draw_bug(0,0, bugs[i].type, bugs[i].alpha);
		context.restore();

		if (bugs[i].isKilled == 1)
		{
			if (bugs[i].alpha>0)
				bugs[i].alpha -= 0.005; 
			else
				bugs.splice(i, 1);
			continue;
		}
		var nextX = (dx/dist)*bugs[i].speed;
		var nextY = (dy/dist)*bugs[i].speed;

		var yieldWay = 0;

		for (j=0; j<bugs.length; j++)
		{
			if (i == j) continue;
				var bug1 = { left:bugs[i].x-20, bottom:bugs[i].y+30, right:bugs[i].x+20, top:bugs[i].y-30};
				var bug2 = { left:bugs[j].x-20, bottom:bugs[j].y+30, right:bugs[j].x+20, top:bugs[j].y-30};

				if ((Math.abs(bugs[i].x - bugs[j].x) < 40) && (Math.abs(bugs[i].y - bugs[j].y) < 40))
				{
					if (bugs[i].score <= bugs[j].score)
						yieldWay = 1;
				}
				else
					yieldWay = 0;
		}

		if(dist > 1)
		{
			if (!yieldWay)
			{
				bugs[i].x += nextX;
				bugs[i].y += nextY;
			}
			else
			{
				bugs[i].x -= .001;
				bugs[i].y -= .001;
			}	
		}
		else
		{
			var index = foodItems.indexOf(bugs[i].target);
			if (index > -1)
			{
				foodItems.splice(index, 1);
				if (foodItems.length == 0)
					gameOver();
			}
		}
	}
}
function baam(){
	if (isPaused) return;
	var x = event.x;
	var y = event.y;
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
	for (var i=0; i<bugs.length; i++)
	{
		if (bugs[i].isKilled)
			continue;
		
		var dx = bugs[i].x - x;
		var dy = bugs[i].y - y;
		var dist = Math.sqrt(dx*dx + dy*dy);

		if (parseInt(dist) <= 50) // 30 + 20  --->  30px around click and 20 is the radius of the bug
		{
			addScore(bugs[i].score);
			bugs[i].isKilled = 1;

		}
	}
}
function addScore(add_score){
	if (currentLevel == 1)
	{
		lvl1Score += add_score;31
		document.getElementById('score').innerHTML = 'Score: '+lvl1Score;
	}
	else
	{
		lvl2Score += add_score;
		document.getElementById('score').innerHTML = 'Score: '+lvl2Score;
	}

}
function timer(){
	if (isPaused) return;
	if (timeRemaining == 0)
		gameOver();
	else
	{
		timeRemaining--;
		document.getElementById("timer").innerHTML = timeRemaining+" sec";
		if (timeRemaining === spawnTime)
		{
			spawnBug();
			var one23 = Math.floor((Math.random() * 3)) + 1;
			spawnTime = timeRemaining - one23;
		}
		
	}
}
function spawnBug(){
	var rand = Math.floor(Math.random() * 10);
	var bugType = 0;


	if (rand < 3)		bugType = 1; 
	else if (rand < 6)	bugType = 2; 
	else 				bugType = 3;
	
	var newBug = {};
	if (bugType == 1)
	{
		newBug.score = 1;
		if (currentLevel == 1)
			newBug.speed = 0.6;
		else
			newBug.speed = 0.8;
		
	}
	else if (bugType ==2)
	{
		newBug.score = 3;
		if (currentLevel == 1)
			newBug.speed = 0.75;
		else
			newBug.speed = 1;
	}
	else
	{
		newBug.score = 5;
		if (currentLevel == 1)
			newBug.speed = 1.5;
		else
			newBug.speed = 2;
	}
	newBug.alpha = 1;
	newBug.target=-1;
	newBug.isKilled = 0;
	newBug.type = bugType;
	newBug.x = Math.floor((Math.random() * 380) + 10); // 10 to 390 
	newBug.y = -20;
	newBug.alpha = 1;
	bugs.push(newBug);
}
function gameOver(){
	foodItems = [];
	bugs = [];
	clearInterval(timerInterval);
	clearInterval(renderInterval);
	
	if (lvl1Score > localStorage.getItem('l1highscore'))
		localStorage.setItem('l1highscore',lvl1Score);
	if (lvl2Score > localStorage.getItem('l2highscore'))
		localStorage.setItem('l2highscore',lvl2Score);
	

	if (parseInt(localStorage.getItem('currentLevel')) == 1)
	{
		if (timeRemaining != 0)
		{
			document.getElementById('pscore').innerHTML = "Level 1 score: "+lvl1Score+"<br>"+"Level 2 score: "+lvl2Score;
			document.getElementById("popup-c").style.display = "block";
		}
		else
		{
			localStorage.setItem('currentLevel',2);
			init();
		}
	}
	else if (parseInt(localStorage.getItem('currentLevel')) == 2)
	{
		localStorage.setItem('currentLevel',1);
		document.getElementById('pscore').innerHTML = "Level 1 score: "+lvl1Score+"<br>"+"Level 2 score: "+lvl2Score;
		document.getElementById("popup-c").style.display = "block";
	}
}
function restart(){
	lvl1Score = 0;
	lvl2Score = 0;
		document.getElementById("popup-c").style.display = "none";
		document.getElementById('score').innerHTML = "Score: 0";
	init();
}
function prepareFood(){
	for (i = 0; i < 5; i++) { 
		var newFood = {};
		newFood.foodId=i;
		newFood.x = Math.floor((Math.random() * 370) + 10);
		newFood.y = Math.floor((Math.random() * 460) + 120);
		foodItems.push(newFood);
	}
}
function draw_bug(x, y, color, alpha){
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = color;
	if (color == 1)
		ctx.fillStyle = "rgba(255, 128, 0, " + alpha + ")";
	if (color == 2)
		ctx.fillStyle = "rgba(255, 0, 0, " + alpha + ")";
	if (color == 3)
		ctx.fillStyle = "rgba(0, 0, 0, " + alpha + ")";

	topx = x;
	topy = y-15;
	botx = x;
	boty = y+20;
	midy = (topy+boty)/2;
	width = 10;

	// __arms legs__
    ctx.beginPath(); // top left
    ctx.moveTo(x,y);
    ctx.quadraticCurveTo(x-10, y-5, x-10, y-13);
    ctx.stroke();
    ctx.beginPath(); // top right
    ctx.moveTo(x,y);
    ctx.quadraticCurveTo(x+10, y-5, x+10, y-13);
    ctx.stroke();
    ctx.beginPath(); // bot left
    ctx.moveTo(x,y+4);
    ctx.quadraticCurveTo(x-10, y+10, x-10, y+18);
    ctx.stroke();
    ctx.beginPath(); // bot right
    ctx.moveTo(x,y+4);
    ctx.quadraticCurveTo(x+10, y+10, x+10, y+18);
    ctx.stroke();
    // --arms legs--

 	// __body__
	ctx.beginPath();
	ctx.moveTo(topx,topy);
    ctx.quadraticCurveTo(topx-10, midy, botx, boty);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
	ctx.moveTo(topx,topy);
    ctx.quadraticCurveTo(topx+10, midy, botx, boty);
    ctx.fill();
    ctx.stroke();
    // --body--

    // __head__
    ctx.beginPath();
    ctx.arc(topx, topy, 5, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
    // --head--

    // __antennas__
    ctx.beginPath();
    ctx.moveTo(topx-2, topy-1);
    ctx.quadraticCurveTo(topx-5, topy-3, topx-5, topy-10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(topx+2, topy-1);
    ctx.quadraticCurveTo(topx+5, topy-3, topx+5, topy-10);
    ctx.stroke();
    // --antennas--

}

var pause = document.getElementById('pause');
pause.style.cursor = 'pointer';
pause.onclick = function() {
	if (!isPaused)
	{
		isPaused = true;
		pause.innerHTML = '&#9658;';
	}
	else
	{
		isPaused =false;
		pause.innerHTML = ' &#10073;&#10073;';
	}
};