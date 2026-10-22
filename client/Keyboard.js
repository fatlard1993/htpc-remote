import { Keyboard as BaseKeyboard } from '@vanilla-bean/components';

import { keyDefinitions, layouts } from './constants';
import { openSettings } from './settings';
import socket from './socket';

export default class Keyboard extends BaseKeyboard {
	constructor(options = {}) {
		super({
			layout: 'hide',
			keyDefinitions,
			layouts,
			styles: ({ colors, fonts, safeArea }) => `
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				z-index: 999;
				box-sizing: border-box;
				max-width: 720px;
				margin: 0 auto;
				/* Clear of the home indicator and a landscape notch */
				padding: 0 ${safeArea.right} ${safeArea.bottom} ${safeArea.left};
				background-color: ${colors.black};

				& button {
					min-width: 0;
					padding-inline: 0;
					background-color: ${colors.dark(colors.gray)};
					height: 42px;
					color: ${colors.white};
					font-size: 20px;
					transition: transform .2s;

					&.kb-switch {
						color: ${colors.light(colors.orange)};

						&.pressed {
							transform: none !important;
							background-color: ${colors.dark(colors.orange)};
							color: ${colors.white};
						}
					}

					&.shift {
						color: ${colors.lighter(colors.orange)};

						&.pressed {
							background-color: ${colors.orange};
						}
					}

					&:empty:not(.lmb, .rmb) {
						height: auto;
					}

					&.os:before {
						${fonts.fontAwesomeBrands};
					}

					&.hide {
						opacity: 1 !important;
					}

					&.delete:before {
						transform: scale(-1, 1);
					}

					&.return:before {
						transform: rotate(90deg);
					}

					&.space {
						flex: 6;
					}

					&.return {
						flex: 1.5;
					}

					&.mod {
						flex: 1.5;
						color: ${colors.light(colors.red)};

						&.pressed {
							background-color: ${colors.red};
							color: ${colors.white};
						}
					}

					&.active, &.pressed {
						background-color: ${colors.white};
						color: ${colors.black};
						transform: scale(2) translateY(-30px);
						transition: transform .05s;

						&.mod {
							transform: unset !important;
						}
					}

					&:first-of-type.active:not(:only-child) {
						transform: scale(2) translateY(-30px) translateX(20px);
					}

					&:last-of-type.active:not(:only-child) {
						transform: scale(2) translateY(-30px) translateX(-20px);
					}
				}

				/* Fifteen keys to a row fit a phone in a smaller type */
				&:is(.layout-full, .layout-fullFakeShift) button:not(.kb-switch) {
					font-size: 14px;

					/* A narrower space bar leaves Home and End their whole word */
					&.space {
						flex: 2;
					}
				}
			`,
			onKeyPress: ({ detail: { key, keyDefinition } }) => {
				if (key === 'settings') openSettings();
				else if (layouts[key]) this.setLayout(key);
				else if (layouts[keyDefinition?.layout]) this.setLayout(keyDefinition.layout);
				else {
					socket.send(keyDefinition?.command || 'keyPress', keyDefinition?.payload || { key, mod: keyDefinition?.mod });
				}
			},
			...options,
		});
	}
}
