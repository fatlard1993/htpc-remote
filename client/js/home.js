// includes dom log socket-client notify menu dialog
// babel
/* global dom log socketClient notify menu dialog */

dom.onLoad(function onLoad(){
	menu.init({
		main: ['test', 'test2:~:red']
	});

	notify.init();

	dialog.init();

	socketClient.init();

	socketClient.on('open', function(evt){
		log('socketClient open', evt);

		socketClient.reply('type', 'payload');
	});

	socketClient.on('error', function(evt){
		log('socketClient error', evt);
	});

	socketClient.on('message', function(evt){
		log('socketClient message', evt);
	});

	socketClient.on('close', function(evt){
		log('socketClient close', evt);

		socketClient.reconnect();
	});

	dom.interact.on('pointerDown', function(evt){
		log('interact pointerDown', evt);

		if(evt.target.id === 'touchPad'){
			var resolvePosition = function(evt){
				return {
					x: (evt.targetTouches) ? evt.targetTouches[0].pageX : evt.clientX,
					y: (evt.targetTouches) ? evt.targetTouches[0].pageY : evt.clientY
				};
			};

			var getPositionDifference = function(position1, position2, multiplier){
				return {
					x: (position1.x - position2.x) * multiplier,
					y: (position1.y - position2.y) * multiplier
				};
			};

			var lastPosition, moved;
			var multiplier = 2;
			var scrollSpeed = 50;

			var touchPadMove = function(evt){
				evt.preventDefault();

				var newPosition = resolvePosition(evt);

				if(!lastPosition) lastPosition = newPosition;

				var positionDifference = getPositionDifference(newPosition, lastPosition, multiplier);

				if(Math.abs(positionDifference.x) <= (evt.which === 3 || evt.targetTouches && evt.targetTouches.length === 2 ? scrollSpeed : 0) && Math.abs(positionDifference.y) <= (evt.which === 3 || evt.targetTouches && evt.targetTouches.length === 2 ? scrollSpeed : 0)) return;

				socketClient.reply(evt.which === 3 || evt.targetTouches && evt.targetTouches.length === 2 ? 'touchPadScroll' : 'touchPadMove', positionDifference);

				lastPosition = newPosition;

				moved = true;
			};

			var touchPadDrop = function(evt){
				evt.preventDefault();

				if(!moved) socketClient.reply(evt.which === 3 || evt.targetTouches && evt.targetTouches.length === 2 ? 'rightMouseButton' : 'leftMouseButton');

				document.removeEventListener('mouseup', touchPadDrop);
				document.removeEventListener('mousemove', touchPadMove);
				evt.target.removeEventListener('touchend', touchPadDrop);
				evt.target.removeEventListener('touchmove', touchPadMove);
			};

			document.addEventListener('mouseup', touchPadDrop);
			document.addEventListener('mousemove', touchPadMove);
			evt.target.addEventListener('touchend', touchPadDrop);
			evt.target.addEventListener('touchmove', touchPadMove);
		}
	});

	dom.interact.on('pointerUp', function(evt){
		log('interact pointerUp', evt);

		if(evt.target.id === 'leftMouseButton'){
			socketClient.reply('leftMouseButton');
		}

		else if(evt.target.id === 'rightMouseButton'){
			socketClient.reply('rightMouseButton');
		}
	});

	menu.on('selection', function(evt){
		log(this.isOpen, evt);

		dialog.err('test err');
	});
});