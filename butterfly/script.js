var RENDERER = {
	BUTTERFLY_INTERVAL : 80,
	
	init : function(){
		this.setParameters();
		this.reconstructMethods();
		this.render();
	},
	setParameters : function(){
		this.$container = $('#jsi-butterfly-container');
		this.width = this.$container.width();
		this.height = this.$container.height();
		this.$canvas = $('<canvas />').attr({width : this.width, height : this.height}).appendTo(this.$container);
		this.context = this.$canvas.get(0).getContext('2d');
		this.butterflies = [];
		this.interval = this.BUTTERFLY_INTERVAL;
		
		this.butterflies.push(new BUTTERFLY(this.width, this.height));
		
		this.gradient = this.context.createRadialGradient(this.width / 2, this.height / 2, 0, this.width / 2, this.height / 2, Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2)));
		this.gradient.addColorStop(0, 'hsl(200, 100%, 60%)');
		this.gradient.addColorStop(1, 'hsl(200, 100%, 80%)');
	},
	reconstructMethods : function(){
		this.render = this.render.bind(this);
	},
	render : function(){
		requestAnimationFrame(this.render);
		
		this.context.fillStyle = this.gradient;
		this.context.fillRect(0, 0, this.width, this.height);
		
		this.butterflies.sort(function(butterfly1, butterfly2){
			return butterfly2.zIndex - butterfly1.zIndex;
		});
		for(var i = this.butterflies.length - 1; i >= 0; i--){
			if(!this.butterflies[i].render(this.context)){
				this.butterflies.splice(i, 1);
			}
		}
		if(--this.interval == 0){
			this.interval = this.BUTTERFLY_INTERVAL;
			this.butterflies.push(new BUTTERFLY(this.width, this.height));
		}
	}
};
var BUTTERFLY = function(width, height){
	this.width = width;
	this.height = height;
	this.init();
};
BUTTERFLY.prototype = {
	ANIMATION_COUNT : 20,
	FADEIN_COUNT : 80,
	BODY_COLOR : 'hsla(0, 0%, 50%, %opacity)',
	WING_COLOR : 'hsla(%hue, 50%, %luminance%, %opacity)',
	VELOCITY : 1.5,
	Z_INDEX : {min : 1, max : 5},
	DELTA_THETA : Math.PI / 30,
	DELTA_PHI : Math.PI / 40,
	THRESHOLD : 100,
	
	init : function(){
		this.angle = this.getRandomValue({min : 0, max : Math.PI * 2});
		this.stage = 0;
		this.count = 0;
		this.enableToMove = false;
		this.theta = 0;
		this.phi = 0;
		this.wingColor = this.WING_COLOR.replace('%hue', Math.round(360 * Math.random()));
		this.zIndex = this.getRandomValue(this.Z_INDEX);
		
		var rate = this.zIndex / this.Z_INDEX.max;
		
		this.scale = 0.2 + 0.4 * rate;
		
		if(this.angle <= Math.PI / 2){
			this.x = this.getRandomValue({min : 0, max : this.width / 2});
			this.y = this.getRandomValue({min : 0, max : this.height / 2});
		}else if(this.angle <= Math.PI){
			this.x = this.getRandomValue({min : this.width / 2, max : this.width});
			this.y = this.getRandomValue({min : 0, max : this.height / 2});
		}else if(this.angle <= Math.PI * 3 / 2){
			this.x = this.getRandomValue({min : this.width / 2, max : this.width});
			this.y = this.getRandomValue({min : this.height / 2, max : this.height});
		}else{
			this.x = this.getRandomValue({min : 0, max : this.width / 2});
			this.y = this.getRandomValue({min : this.height / 2, max : this.height});
		}
		this.vx = this.VELOCITY * Math.cos(this.angle) * rate;
		this.vy = this.VELOCITY * Math.sin(this.angle) * rate;
	},
	getRandomValue : function(range){
		return range.min + (range.max - range.min) * Math.random();
	},
	render : function(context){
		var rate = this.count / this.ANIMATION_COUNT;
		
		context.save();
		context.lineWidth = 1.5;
		context.translate(this.x, this.y);
		context.rotate(this.angle + Math.PI / 2);
		context.scale(this.scale, this.scale);
		context.strokeStyle = this.wingColor.replace('%luminance', 20).replace('%opacity', 1);
		
		for(var i = -1; i <= 1; i += 2){
			context.save();
			context.scale(i, 1);
			
			switch(this.stage){
			case 0:
				context.beginPath();
				context.moveTo(-5, -10);
				
				if(this.count == this.ANIMATION_COUNT - 3){
					context.arcTo(-100, -100, -70, -5, 5);
					
					if(i == 1){
						this.stage++;
						this.count = 9;
					}
				}else{
					context.lineTo(-5 - 95 * rate, -10 - 90 * rate);
				}
				context.stroke();
				break;
			case 1:
				context.beginPath();
				context.moveTo(-5, -10);
				context.arcTo(-100, -100, -70, -5, 5);
				
				if(this.count == this.ANIMATION_COUNT){
					context.arcTo(-70, -5, -5, 0, 5);
					
					if(i == 1){
						this.stage++;
						this.count = 0;
					}
				}else{
					context.lineTo(-100 + 30 * rate, -100 + 95 * rate);
				}
				context.stroke();
				break;
			case 2:
				context.beginPath();
				context.moveTo(-5, -10);
				context.arcTo(-100, -100, -70, -5, 5);
				context.arcTo(-70, -5, -5, 0, 5);
				context.lineTo(-70 + 65 * rate, -5 + 5 * rate);
				
				if(this.count == this.ANIMATION_COUNT){
					if(i == 1){
						this.stage++;
						this.count = 0;
					}
				}
				context.stroke();
				break;
			case 3:
				context.beginPath();
				context.moveTo(-5, -10);
				context.arcTo(-100, -100, -70, -5, 5);
				context.arcTo(-70, -5, -5, 0, 5);
				context.lineTo(-5, 0);
				
				if(this.count == this.ANIMATION_COUNT){
					context.arcTo(-70, 5, -80, 80, 5);
					
					if(i == 1){
						this.stage++;
						this.count = 0;
					}
				}else{
					context.lineTo(-5 - 65 * rate, 5 * rate);
				}
				context.stroke();
				break;
			case 4:
				context.beginPath();
				context.moveTo(-5, -10);
				context.arcTo(-100, -100, -70, -5, 5);
				context.arcTo(-70, -5, -5, 0, 5);
				context.lineTo(-5, 0);
				context.arcTo(-70, 5, -80, 80, 5);
				
				if(this.count == this.ANIMATION_COUNT - 5){
					context.arcTo(-80, 80, -5, 0, 5);
					
					if(i == 1){
						this.stage++;
						this.count = 7;
					}
				}else{
					context.lineTo(-70 - 10 * rate, 5 + 75 * rate);
				}
				context.stroke();
				break;
			case 5:
				context.beginPath();
				context.moveTo(-5, -10);
				context.arcTo(-100, -100, -70, -5, 5);
				context.arcTo(-70, -5, -5, 0, 5);
				context.lineTo(-5, 0);
				context.arcTo(-70, 5, -80, 80, 5);
				context.arcTo(-80, 80, -5, 0, 5);
				context.lineTo(-80 + 75 * rate, 80 - 70 * rate);
				
				if(this.count == this.ANIMATION_COUNT){
					if(i == 1){
						this.stage++;
						this.count = 0;
					}
				}
				context.stroke();
				break;
			case 6:
				context.save();
				context.scale(0.8 + 0.2 * Math.cos(this.theta), 1);
				
				var gradient = context.createRadialGradient(0, 0, 0, 0, 0, 100),
					wingColor = this.wingColor.replace('%opacity', this.count / this.FADEIN_COUNT);
				
				gradient.addColorStop(0, wingColor.replace('%luminance', 40));
				gradient.addColorStop(0.3, wingColor.replace('%luminance', 60));
				gradient.addColorStop(1, wingColor.replace('%luminance', 80));
				
				context.strokeStyle = this.wingColor.replace('%luminance', 20 + Math.round(40 * this.count / this.FADEIN_COUNT)).replace('%opacity', 1);
				context.fillStyle = gradient;
				context.beginPath();
				context.moveTo(-5, -10);
				context.arcTo(-100, -100, -70, -5, 5);
				context.arcTo(-70, -5, -5, 0, 5);
				context.lineTo(-5, 0);
				context.arcTo(-70, 5, -80, 80, 5);
				context.arcTo(-80, 80, -5, 0, 5);
				context.lineTo(-5, 10);
				context.closePath();
				context.stroke();
				context.fill();
				context.restore();
				
				context.lineWidth = 2;
				context.strokeStyle = this.BODY_COLOR.replace('%opacity', this.count / this.FADEIN_COUNT);
				context.beginPath();
				context.moveTo(-3, -20);
				context.bezierCurveTo(-10, -40, -10 - 5 * Math.sin(this.phi), -60, -20 - 5 * Math.sin(this.phi), -80);
				context.stroke();
			}
			context.restore();
		}
		if(this.stage == 6){
			context.save();
			context.fillStyle = this.BODY_COLOR.replace('%opacity', this.count / this.FADEIN_COUNT);
			context.beginPath();
			context.moveTo(0, -20);
			context.arc(0, -20, 6, 0, Math.PI * 2, false);
			context.fill();
			
			context.beginPath();
			context.moveTo(6, -15);
			context.arc(0, -15, 6, 0, Math.PI, false);
			context.stroke();
			context.arcTo(0, 80, 6, -15, 3);
			context.fill();
			
			if(this.count == this.FADEIN_COUNT){
				this.enableToMove = true;
			}
			context.restore();
		}
		if(this.enableToMove){
			this.count = this.FADEIN_COUNT;
			this.theta += this.DELTA_THETA;
			this.theta %= Math.PI * 2;
			this.phi += this.DELTA_PHI;
			this.phi %= Math.PI * 2;
			this.x += this.vx;
			this.y += this.vy;
		}else{
			this.count++;
		}
		context.restore();
		
		return this.x >= -this.THRESHOLD && this.x <= this.width + this.THRESHOLD && this.y >= -this.THRESHOLD && this.y <= this.height + this.THRESHOLD;
	}
};

$(function(){
	RENDERER.init();
});