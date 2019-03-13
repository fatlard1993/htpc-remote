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

			var getPositionDifference = function(position1, position2){
				return {
					x: position1.x - position2.x,
					y: position1.y - position2.y
				};
			};

			var lastPosition;

			var touchPadMove = function(evt){
				evt.preventDefault();

				var newPosition = resolvePosition(evt);

				if(!lastPosition) lastPosition = newPosition;

				var positionDifference = getPositionDifference(newPosition, lastPosition);

				if(!positionDifference.x || !positionDifference.y) return;

				log(positionDifference);

				lastPosition = newPosition;

				socketClient.reply('touchPadPosition', positionDifference);
			};

			var touchPadDrop = function(evt){
				evt.preventDefault();

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
			notify('info', 'leftMouseButton');

			socketClient.reply('leftMouseButton');
		}

		else if(evt.target.id === 'rightMouseButton'){
			notify('info', 'rightMouseButton');

			socketClient.reply('rightMouseButton');
		}
	});

	menu.on('selection', function(evt){
		log(this.isOpen, evt);

		dialog.err('test err');
	});
});