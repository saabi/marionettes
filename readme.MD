# Marionette Simulator

Using a mobile device with motion and rotation sensors you can control a virtual marionette running on a browser.
![Marionette Simulator](https://i.imgur.com/iGInAkc.gif)

## Installation

Though I plan to improve the packaging, for the time being you must have bower and requirejs installed globally.

```
npm i -g requirejs bower
```

Once that's done:

```
npm i
bower install
./build
npm start
```

## Using it

Also needs improvement but for now the server is running on port 80 (you can also start it on another port by setting the PORT environment variable to something else) so just navigate with your browser to `http://(server's IP address)` and with your phone to `http://(server's IP address)/phone.html`

Now just move your phone!


## TODO and Proposed Features

  * Adjust marionette and hand controller parameters.
  * Improve string physics.
  * Ease camera movements when adjusting position.
  * Use a QR code on the desktop to make it easier to connect with a mobile device.
  * Add a text bubble to each marionette. The text should be set from the mobile device.
  * Use the touch screen on a mobile device to control the position on stage and to pull on the strings of the marionette. <img src='https://raw.githubusercontent.com/saabi/marionettes/master/public/img/controller-layout.png' width='356'>
  * Switch to Three.js in order to add skinning.
  * Provide various marionette skeletons and skins.
  * Support different shapes of hand controllers.
