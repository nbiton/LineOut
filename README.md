# LineOut.js
This is a micro-library which wraps the **WebAudio API** to provide a chaining interface

This library encourages intuitive functional programming, when creating a network of *AudioNodes* to modulate sound.

## Why do I need this?
When using the native WebAudio API, you normally have to create your nodes and connect them to each other, starting with the output and ending with the input.
This is how it would typically look like:
```js
  var audioContext = new AudioContext()
  
  var envelope = audioContext.createGain()
  envelope.gain.value = 0
  envelope.gain.setTargetAtTime(1, startTime, 0.1)
  envelope.gain.setTargetAtTime(0, endTime, 0.2)
  envelope.connect(audioContext.destination)

  var vibrato = audioContext.createGain()
  vibrato.gain.value = 30
  vibrato.connect(oscillator.detune)
  
  var lfo = audioContext.createOscillator()
  lfo.frequency.value = 5
  lfo.start(startTime)
  lfo.stop(endTime)
  lfo.connect(vibrato)
  
  var oscillator = audioContext.createOscillator()
  oscillator.type = 'sawtooth'
  oscillator.detune.value = 400 
  oscillator.connect(envelope)
  oscillator.start(startTime)
  oscillator.stop(stopTime)
```
 
Using LineOut to accomplish the same thing, would look like this:
```js
    var l = LineOut(audioContext)
    l.createOscillator() // Input generator
      .options(node => {
        node.frequency.value = 5
        node.start(startTime)
        node.stop(endTime + 2)
      })
      .createGain()
      .options(node => node.gain.value = 30)
      .pipe('osc.detune') // connect to it when it is created

    l.createOscillator('osc')
      .options(node => {
        node.type = 'sawtooth'
        node.detune.value = pitch * 100
        node.start(startTime)
        node.stop(endTime + 2)
      })
      .createGain()
      .options(node => {
        node.gain.value = 0
        node.gain.setTargetAtTime(1, startTime, 0.1)
        node.gain.setTargetAtTime(0, endTime, 0.2)
      })
      .lineout() // connect to audioContext.destination
```

## Getting Started

Install from npm
```
npm install lineout
```

Hook it up to the audio context
```js
var LineOut = require('lineout')

var audioContext = new AudioContext()
var lo = LineOut(audioContext)

lo.createOscillator()
.options((node, ctx) => {
  node.detune.value = 300
  node.start(ctx.currentTime)
  node.stop(ctx.currentTime + 2)
})
.lineout()
```
