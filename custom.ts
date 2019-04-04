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


}
