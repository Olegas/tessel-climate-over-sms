Climate over SMS
================

Simple demo for [Tessel](http://tessel.io) with [Ambient](https://tessel.io/modules#module-ambient),
[Climate](https://tessel.io/modules#module-climate) and [GPRS](https://tessel.io/modules#module-gprs) modules.

Script waits for a SMS with text "report" and then replies with current collected data (humidity, temperature,
noise and light levels).

It is not a production Weather-by-SMS-service but just a simplified demo.

Ambient module must be connected to port D, Climate to port C and GPRS to port A.

To prepare dependencies:

```
    npm install
```

To run on Tessel:
```
    tessel run index.js
```