# pxt-finch
A library for the Finch robot in MakeCode

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

