<script>
	import { onMount } from 'svelte';
	onMount( async () => {
		const Stage = await import('../client/Stage');
		Stage.start();
		const StageConnection = await import('../client/StageConnection');
		StageConnection.init();
	})
</script>

<canvas id="canvas"></canvas>

<style>
	#canvas {
		position: absolute;
		width: 100%;
		height: 100%;
		background: #000;
		cursor: pointer;
	}
</style>