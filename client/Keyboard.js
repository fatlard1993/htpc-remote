/* eslint-disable spellcheck/spell-checker */
import { Keyboard as BaseKeyboard } from 'vanilla-bean-components';

import { keyDefinitions, layouts } from './constants';
import socket from './socket';

export default class Keyboard extends BaseKeyboard {
	constructor(options = {}) {
		super({
			layout: 'hide',
			keyDefinitions,
			layouts,
			styles: ({ colors, fonts }) => `
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				z-index: 999;

				button {
					background-color: ${colors.black};
					height: 42px;
					color: ${colors.white};
					font-size: 20px;
					transition: transform .2s;

					&.kb-switch {
						color: ${colors.orange};

						&.pressed {
							transform: none !important;
							background-color: ${colors.orange};
						}
					}

					&.shift {
						color: ${colors.lighter(colors.orange)};

						&.pressed {
							background-color: ${colors.lighter(colors.orange)};
						}
					}

					&:empty {
						height: auto;
					}

					&.quit:before {
						content: "\\f410";
					}

					&.fullscreen:before {
						content: "\\f424";
					}

					&.refresh:before {
						content: "\\f2f1";
					}

					&.open:before {
						content: "\\f002";
					}

					&.os:before {
						${fonts.fontAwesomeBrands};

						content: "\\f7df";
					}

					&.backspace:before {
						content: "\\f55a";
					}

					&.media:before {
						content: "\\f26c";
					}

					&.numpad:before {
						content: "\\f00a";
					}

					&.basic:before {
						content: "\\f11c";
					}

					&.full:before {
						content: "\\f552";
					}

					&.mouse:before {
						content: "\\f245";
					}

					&.hide {
						opacity: 1 !important;

						&:before {
							content: "\\f070";
						}
					}

					&.delete:before {
						transform: scale(-1, 1);
						content: "\\f55a";
					}

					&.tab:before {
						content: "\\f362";
					}

					&.volUp:before {
						content: "\\f028";
					}

					&.volDown:before {
						content: "\\f027";
					}

					&.volMute:before {
						content: "\\f6a9";
					}

					&.play:before {
						content: "\\f04b";
					}

					&.pause:before {
						content: "\\f04c";
					}

					&.stop:before {
						content: "\\f04d";
					}

					&.next:before {
						content: "\\f04e";
					}

					&.prev:before {
						content: "\\f04a";
					}

					&.left:before {
						content: "\\f053";
					}

					&.up:before {
						content: "\\f077";
					}

					&.down:before {
						content: "\\f078";
					}

					&.right:before {
						content: "\\f054";
					}

					&.pgUp:before {
						content: "\\f3bf";
					}

					&.pgDown:before {
						content: "\\f3be";
					}

					&.browserHome:before {
						content: "\\f015";
					}

					&.space:before, &.lmb:before, &.rmb:before {
						content: "";
					}

					&.settings:before {
						content: "\\f013";
					}

					&.shift:before {
						content: "\\f35b";
					}

					&.keyboard:before {
						content: "\\f11c";
					}

					&.return:before {
						transform: rotate(90deg);
						content: "\\f3be";
					}

					&:focus {
						top: 0;
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
			`,
			onKeyPress: ({ detail: { key, keyDefinition } }) => {
				if (layouts[key]) this.setLayout(key);
				else if (layouts[keyDefinition?.layout]) this.setLayout(keyDefinition.layout);
				else {
					socket.send(keyDefinition?.command || 'keyPress', keyDefinition?.payload || { key, mod: keyDefinition?.mod });
				}
			},
			...options,
		});
	}
}
