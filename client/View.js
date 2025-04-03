import { View as BaseView, rootContext } from 'vanilla-bean-components';

import TouchPad from './TouchPad';
import Keyboard from './Keyboard';

export default class View extends BaseView {
	async render() {
		super.render();

		rootContext.keyboard = new Keyboard({ appendTo: this.elem });
		rootContext.touchPad = new TouchPad({ appendTo: this.elem });
	}
}
