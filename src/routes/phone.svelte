<script>
	//import '../client/phone';
	import { onMount } from 'svelte';
	import { init, sendMotionUpdate } from '../client/PhoneConnection';
	import Controller from '../components/Controller.svelte';

	onMount( async () => {
		await init();
	});
	function update(e) {
		sendMotionUpdate(e.detail);
	}
</script>

<svelte:head>
  <title>Virtual Marionette Controller</title>
	<meta http-equiv="origin-trial" data-feature="Generic Sensors" data-expires="2018-03-28" content="AtUxUTQrrpSGy8WnJu4nAf0mT8jFsr8gXkhz7TKenNGVI4kCj39WdZq4S1cW2JrTdSxmBuejwRPEINAyyiZfxgEAAABjeyJvcmlnaW4iOiJodHRwczovL21hcmlvbmV0dGVzLmZlcnJleXJhcG9ucy5jb206NDQzIiwiZmVhdHVyZSI6IkdlbmVyaWNTZW5zb3IiLCJleHBpcnkiOjE1MjIyMDg2MTR9">
</svelte:head>

<!--
<input id='text' type='text' placeholder="Type something here..."/>
<div id='stage' width='100vw' height='40vw'>
	<div class='handle' id='cpos' />
</div>
-->
<Controller on:motion={update}/>
<!--
<div id='thing'>Hello!</div>
-->
