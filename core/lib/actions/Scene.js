import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Scene extends Action {

	static setup () {
		Monogatari.history ('scene');
		Monogatari.history ('sceneElements');
		Monogatari.state ({
			scene: ''
		});
		return Promise.resolve ();
	}

	static onLoad () {
		const { scene } = Monogatari.state ();
		if (scene !== '') {
			Monogatari.run (scene, false);
		}
		return Promise.resolve ();
	}

	static reset () {
		$_(`${Monogatari.selector} [data-ui="background"]`).style ('background', 'initial');
		Monogatari.state ({
			scene: ''
		});
		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'scene';
	}

	constructor ([ action, scene, separator, ...classes ]) {
		super ();
		this.scene = scene;
		this.property = 'background-image';
		if (typeof Monogatari.asset ('scenes', scene) !== 'undefined') {
			this.value = `url(assets/scenes/${Monogatari.asset ('scenes', scene)})`;
		} else {
			if (this.scene.indexOf ('.') === -1) {
				this.property = 'background-color';
			}
			this.value = this.scene;
		}

		if (typeof classes !== 'undefined') {
			this.classes = ['animated', ...classes];
		} else {
			this.classes = [];
		}
	}

	willApply () {
		const scene_elements = [];
		$_(`${Monogatari.selector} #game img:not([data-ui="face"]):not([data-visibility="invisible"])`).each ((element) => {
			scene_elements.push (element.outerHTML);
		});

		Monogatari.history ('sceneElements').push (scene_elements);

		$_(`${Monogatari.selector} [data-character]`).remove ();
		$_(`${Monogatari.selector} [data-image]`).remove ();
		$_(`${Monogatari.selector} [data-ui="background"]`).removeClass ();
		return Promise.resolve ();
	}

	apply () {

		$_(`${Monogatari.selector} [data-ui="background"]`).style (this.property, this.value);

		for (const newClass of this.classes) {
			$_(`${Monogatari.selector} [data-ui="background"]`).addClass (newClass);
		}

		Monogatari.state ({
			scene: this._statement
		});
		Monogatari.history ('scene').push (this._statement);

		Monogatari.action ('Dialog').reset ();

		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	willRevert () {
		$_(`${Monogatari.selector} [data-character]`).remove ();
		$_(`${Monogatari.selector} [data-image]`).remove ();
		$_(`${Monogatari.selector} [data-ui="background"]`).removeClass ();
		return Promise.resolve ();
	}

	revert () {
		Monogatari.history ('scene').pop ();
		Monogatari.state ({
			scene: Monogatari.history ('scene').slice(-1)[0]
		});

		$_(`${Monogatari.selector} [data-ui="background"]`).style (this.property, this.value.replace (this.scene, Monogatari.state ('scene')));

		if (Monogatari.history ('sceneElements').length > 0) {
			const scene_elements = Monogatari.history  ('sceneElements').pop ();

			if (typeof scene_elements === 'object') {
				for (const element of scene_elements) {
					$_(`${Monogatari.selector} #game`).append (element);
				}
			}
		}
		Monogatari.action ('Dialog').reset ();
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Scene.id = 'Scene';

Monogatari.registerAction (Scene);