<script>
	import { Device, StringController } from '../client/Controller';

	import { createEventDispatcher, onMount } from 'svelte';
	const dispatch = createEventDispatcher();

	let controllerSurface;
	const originOrientation = {x:0,y:0,z:0};
	let phone;
	
	function resetOrientation(e) {
		originOrientation.x = phone.rot.x;
		originOrientation.y = phone.rot.y;
		originOrientation.z = phone.rot.z;
	}

	let acceleration;
	let avgAccel;
	let rotation;

	onMount( () => {
		const controller = new StringController(controllerSurface, 'handle');
		phone = new Device();

		function update() {
			const acc = phone.acc;
			const rot = { // points origin at screen if properly calibrated
				x: phone.rot.x - originOrientation.x, 
				y: phone.rot.y - originOrientation.y, 
				z: phone.rot.z - originOrientation.z
			};
			const pulls = controller.stringPulls;

			// for parent
			dispatch('motion', {acc, rot, pulls});

			// for display
			const da = phone.acc;
			const daa = phone.avgacc;
			const dd = phone.drift;
			const rounder = 10000;
			const fax = Math.round(rounder * (da.x - dd.x)) / rounder;
			const fay = Math.round(rounder * (da.y - dd.y)) / rounder;
			const faz = Math.round(rounder * (da.z - dd.z)) / rounder;

			acceleration = (fax).toFixed(5) + ', ' + (fay).toFixed(5) + ', ' + (faz).toFixed(5);
			avgAccel = (daa.x - dd.x).toFixed(5) + ', ' + (daa.y - dd.y).toFixed(5) + ', ' + (daa.z - dd.z).toFixed(5);
			rotation = phone.absolute ? 'abs-' : 'rel-' + (rot.x).toFixed(5) + ', ' + (rot.y).toFixed(5) + ', ' + (rot.z).toFixed(5);
		}
		
		setInterval(update, 16);
	});

</script>

<div bind:this={controllerSurface} class='controller' />

<div class='calibrator'>
	<!--<p>Point the top edge of the phone towards the screen and press the button to calibrate the orientation.</p>-->
	<button class='resetButton' on:click={resetOrientation}>Calibrate</button>
	<div>{acceleration}</div>
	<div>{avgAccel}</div>
	<div>{rotation}</div>
</div>

<style>
	.controller {
		touch-action: none;
		-webkit-user-drag: none;
		user-drag: none;
		
		position: relative;
		display: inline-block;

		top: 0;
		left: 0;
		width: 100vmin;
		height: 100vmin;

		background:gray;
	}
	.calibrator {
		display: inline-block;
	}
	:global(.handle) {
		touch-action: none;
		-webkit-user-drag: none;
		user-drag: none;

		position: absolute;

		width: 12%;
		height: 12%;

		border-radius: 50%;

		background: silver;
	}
</style>
