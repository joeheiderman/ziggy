/* These are the enumerated types that we need to create the MakeCode blocks. */

enum MoveDir {
  //% block="Forward"
  Forward,
  //% block="Backward"
  Backward
}

enum RLDir {
  //% block="Right"
  Right,
  //% block="Left"
  Left
}

enum TailPort {
    //% block="1"
    One = 1,
    //% block="2"
    Two = 2,
    //% block="3"
    Three = 3,
    //% block="4"
    Four = 4,
    //% block="All"
    All = 5
}


/**
 * Blocks for Controlling a Finch
 */
//% color=#62bcc7 weight=32 icon="\uF0EB"
namespace finch {
    let readyToSend: boolean
    let waitTime_1 = 4
    let waitTime_2 = 100
    let waitTime_Initial = 500
    let waitTime_Start = 2000

    let sensor_vals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    readyToSend = false // to prevent sending or attempting to receive data until we have initialized the connection


    /**
     * This block is required for every Finch program.
     */
    //% weight=32 blockId="startFN" block="Start Finch"
    export function startFinch(): void {
        pins.analogWritePin(AnalogPin.P0, 0)
        basic.pause(waitTime_Start);                //To avoid the bootloader
        pins.digitalWritePin(DigitalPin.P16, 1)
        pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
        pins.spiFormat(8, 0)
        pins.spiFrequency(1000000)
        control.waitMicros(waitTime_Initial)
        pins.digitalWritePin(DigitalPin.P16, 0)
        control.waitMicros(waitTime_1)
        pins.spiWrite(0xCB) // Stop all (just in case)
        control.waitMicros(waitTime_2)
        pins.spiWrite(0xFF)
        control.waitMicros(waitTime_2)
        pins.spiWrite(0xFF)
        control.waitMicros(waitTime_2)
        pins.spiWrite(0xFF)
        control.waitMicros(waitTime_1)
        pins.digitalWritePin(DigitalPin.P16, 1)
        //control.waitMicros(200)
        //control.waitMicros(1000)
        readyToSend = true

        // Set LEDs 2 and 3 to 0
        pins.analogWritePin(AnalogPin.P2, 0)
        pins.analogWritePin(AnalogPin.P8, 0)
    }

    /**
     * Sets the tri-color LED in the beak to the color specified by red, green, and blue brightness values. The values range from 0% to 100%.
     * @param red the % brightness of the red LED element [0-100]
     * @param green the % brightness of the green LED element [0-100]
     * @param blue the % brightness of the blue LED element [0-100]
     */
    //% weight=29 blockId="setBeak" block="Finch Beak Red %Red| Green %Green| Blue %Blue|"
    //% Red.min=0 Red.max=100
    //% Green.min=0 Green.max=100
    //% Blue.min=0 Blue.max=100
    export function setBeak(red: number = 50, green: number = 0, blue: number = 50): void {
        let timeout = 0
        while (!readyToSend && timeout < 25) {
            basic.pause(10)
            timeout++;
        }
        if (readyToSend) {

            if (red > 100)
                red = 100
            if (red < 0)
                red = 0
            if (green > 100)
                green = 100
            if (green < 0)
                green = 0
            if (blue > 100)
                blue = 100
            if (blue < 0)
                blue = 0

            let port_val = 0xD0
            red = red * 255 / 100
            green = green * 255 / 100
            blue = blue * 255 / 100

            while (!readyToSend); // Wait for other functions in other threads
            readyToSend = false
            control.waitMicros(waitTime_Initial)
            pins.digitalWritePin(DigitalPin.P16, 0)
            control.waitMicros(waitTime_1)
            pins.spiWrite(port_val)
            control.waitMicros(waitTime_2)
            pins.spiWrite(red)
            control.waitMicros(waitTime_2)
            pins.spiWrite(green)
            control.waitMicros(waitTime_2)
            pins.spiWrite(blue)
            control.waitMicros(waitTime_1)
            pins.digitalWritePin(DigitalPin.P16, 1)
            //control.waitMicros(1000)
            readyToSend = true
        }
    }

    /**
     * Sets the color of one or all of the tail leds
     * @param port
     * @param red the % brightness of the red LED element [0-100]
     * @param green the % brightness of the green LED element [0-100]
     * @param blue the % brightness of the blue LED element [0-100]
     */
    //% weight=28 blockId="setTail" block="Finch Tail %port| Red %Red| Green %Green| Blue %Blue|"
    //% Red.min=0 Red.max=100
    //% Green.min=0 Green.max=100
    //% Blue.min=0 Blue.max=100
    export function setTail(port: TailPort, red: number = 50, green: number = 0, blue: number = 50): void {

    }

    /**
     * Sets the finch to move in the given direction at given speed for given distance
     * @param direction Forward or Backward
     * @param speed the speed as a percent for the motor [0 to 100]
     * @param distance the discance to travel in cm
     */
    //% weight=27 blockId="setMove" block="Finch Move %direction| at %speed| \\% for %discance|cm"
    //% speed.min=0 speed.max=100
    export function setMove(direction: MoveDir, speed: number = 50, distance: number = 10) : void {
      sendMotor(speed, distance, speed, distance)
    }

    /**
     * Sends finch motor command
     */
    export function sendMotor(l_speed: number, l_dist: number, r_speed: number, r_dist:number) : void {
      let port_val = 0xD2
      if (l_speed > 100)
          l_speed = 100
      if (l_speed < 0)
          l_speed = 0
      if (r_speed > 100)
          r_speed = 100
      if (r_speed < 0)
          r_speed = 0

      //TODO: Convert distance to ticks
      let l_ticks_msb = 0
      let l_ticks_lsb = 0
      let r_ticks_msb = 0
      let r_ticks_lsb = 0

      let timeout = 0
      while (!readyToSend && timeout < 25) {
          basic.pause(10)
          timeout++;
      }
      if (readyToSend) {
        readyToSend = false
        control.waitMicros(waitTime_Initial)
        pins.digitalWritePin(DigitalPin.P16, 0)
        control.waitMicros(waitTime_1)
        pins.spiWrite(port_val)
        control.waitMicros(waitTime_2)
        pins.spiWrite(l_speed)
        control.waitMicros(waitTime_2)
        pins.spiWrite(l_ticks_msb)
        control.waitMicros(waitTime_2)
        pins.spiWrite(l_ticks_lsb)
        control.waitMicros(waitTime_2)
        pins.spiWrite(r_speed)
        control.waitMicros(waitTime_2)
        pins.spiWrite(r_ticks_msb)
        control.waitMicros(waitTime_2)
        pins.spiWrite(r_ticks_lsb)
        control.waitMicros(waitTime_1)
        pins.digitalWritePin(DigitalPin.P16, 1)
        //control.waitMicros(1000)
        readyToSend = true
      }
    }

    /**
     * Sets the finch to turn in the given direction at given speed for given distance
     * @param direction Right or Left
     * @param speed the speed as a percent for the motor [0 to 100]
     * @param angle the angle to turn in degrees
     */
    //% weight=26 blockId="setTurn" block="Finch Turn %direction| at %speed| \\% for %angle|°"
    //% speed.min=0 speed.max=100
    //% angle.min=0 angle.max=180
    export function setTurn(direction: RLDir, speed: number = 50, angle: number = 90): void {
      let r_speed = 0
      let l_speed = 0
      let r_dist = 0
      let l_dist = 0
      if (direction == RLDir.Right) {
        l_speed = speed
        r_speed = -speed
      } else {
        l_speed = -speed
        r_speed = speed
      }
      sendMotor(l_speed, l_dist, r_speed, r_dist)
    }




}
