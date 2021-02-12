import socketClient from 'socket-client';

socketClient.stayConnected = function(){
	if(socketClient.status === 'open') return;

	var reload = 'soft';

	if(reload === 'soft' && socketClient.triedSoftReload) reload = 'hard';

	socketClient.log()(`Reload: ${reload}`);

	if(reload === 'hard') return window.location.reload(false);

	socketClient.reconnect();

	socketClient.triedSoftReload = true;

	socketClient.resetSoftReset_TO = setTimeout(function(){ socketClient.triedSoftReload = false; }, 4000);
};

if(typeof module === 'object') module.exports = socketClient;