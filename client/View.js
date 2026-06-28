import { View as BaseView } from '@vanilla-bean/components';

import TouchPad from './TouchPad';
import Keyboard from './Keyboard';
import context from './context.js';

export default class View extends BaseView {
	build() {
		context.keyboard = new Keyboard({ appendTo: this.elem });
		context.touchPad = new TouchPad({ appendTo: this.elem });
	}
}
