# pxt-finch
A library for the Finch robot in MakeCode. The Finch is a programmable robot that brings computer science to life by providing students from kindergarten to college a hands-on representation of their code. [This robot is available from BirdBrain Technologies](https://store.birdbraintechnologies.com/collections/featured-items/products/finch2). The blocks are described below, but a lot [more information and activity ideas are available online](https://www.birdbraintechnologies.com/finch2/makecode).

Every program must contain the **Start Finch** in the **on start** block. Then use the Finch blocks to make the Finch move and turn, to control the beak and tail lights, and to make sounds with the buzzer. The Finch also contains a number of sensors that you can use to program the Finch to interact with its environment.

```
finch.startFinch()
basic.forever(function () {
    finch.setBeak(0, 0, 100)
    basic.pause(100)
    finch.setBeak(0, 42, 0)
    basic.pause(100)
})
```
# Reference
## Start Finch
This block is required for every Finch program
``` 
finch.startFinch()
```

## Finch Beak
Sets the tri-color LED in the finch's beak to color specified by red, green, and blue brightness values. The values range from 0% to 100%.
``` 
finch.setBeak(85, 0, 100)
```

## Finch Tail
Sets one or all of the tri-color LEDs in the Finch tail to the color specified by red, green, and blue brightness values. The values range from 0% to 100%.
``` 
finch.setTail(TailPort.All, 0, 100, 0)
```

## Finch Move
Moves the Finch forward or back for a given distance at a given speed (0-100%).
``` 
finch.setMove(MoveDir.Forward, 50, 50)
```

## Finch Turn
Turns the Finch right or left a given angle at a given speed (0-100%).
``` 
finch.setTurn(RLDir.Right, 45, 50)
```

## Finch Wheels
Sets the rotation speeds of the left and right Finch wheels to values from -100 to 100%.
``` 
finch.startMotors(50, 50)
```

## Finch Stop
Stops the Finch wheels.
``` 
finch.stopMotors()
```

## Finch Distance
Returns the value of the Finch distance sensor in cm.
``` 
finch.getDistance()
```

## Finch Light
Returns the value of the right or left Finch light sensor from 0 to 100.
``` 
finch.getLight(RLDir.Right)
```

## Finch Line
Returns the value of the right or left Finch line tracking sensor from 0 to 100.
``` 
finch.getLine(RLDir.Right)
```

## Finch Reset Encoders
Sets the value of the left and right encoders to zero.
``` 
finch.resetEncoders
```

## Finch Encoder
Returns the number of rotations that the right or left wheel has turned.
``` 
finch.getEncoder(RLDir.Right)
```

## Finch Beak Up/Beak Down/Etc.
Returns a Boolean value that indicates whether or not the Finch is in the selected position.
``` 
finch.getFinchOrientation(Orientation.BeakUp)
```

## Finch Compass
Returns the value of the Finch compass in degrees.
``` 
finch.getFinchCompass()
```

## Finch Accelerometer/Magentometer
Returns the value of the Finch accelerometer or magnetometer in the * x, y, or z direction.
``` 
finch.getFinchAM(AorM.Accelerometer, Dimension.X)
```

## Finch Battery
Reads the value of the battery in milliVolts. You may start to see strange behavior when the value is below 3373 mV.
``` 
finch.getBattery()
```

## License
MIT License

Copyright (c) 2017 BirdBrainTechnologies

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)

