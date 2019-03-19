/* These are the enumerated types that we need to create the MakeCode blocks. */
enum FourPort {
    //% block="1"
    One = 1,
    //% block="2"
    Two = 2,
    //% block="3"
    Three = 3,
    //% block="4" 
    Four = 4
}

enum ThreePort {
    //% block="1"
    One = 1,
    //% block="2"
    Two = 2,
    //% block="3"  
    Three = 3,
}

enum TwoPort {
    //% block="1"
    One = 1,
    //% block="2"
    Two = 2,
}

enum SensorType {
    //% block="Light"
    Light = 1,
    //% block="Dial"
    Dial = 2,
    //% block="Distance (cm)"
    Distance = 3,
    //% block="Sound"
    Sound = 4,
    //% block="Other"
    Other = 5,
}


/**
 * Blocks for Controlling a Hummingbird Bit
 */
//% color=#62bcc7 weight=32 icon="\uF0EB"
namespace hummingbird {
    let cmdBuff: Buffer
    let readBuff: Buffer
    let readyToSend: boolean
    let waitTime_1 = 4
    let waitTime_2 = 100
    let waitTime_Initial = 500
    let waitTime_Start = 2000

    readyToSend = false // to prevent sending or attempting to receive data until we have initialized the connection


    /**
     * This block is required for every Hummingbird program.
     */
    //% weight=32 blockId="startHB" block="Start Hummingbird"
    export function startHummingbird(): void {
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
     * Sets a single color LED on port 1, 2, or 3 to a brightness value from 0% to 100%
     * @param port the LED port to control [1-3]
     * @param brightness the % brightness of the LED [0-100]
     */
    //% weight=31 blockId="setLED" block="Hummingbird LED %port_num %intensity |\\%"
    //% port_num.min=1 port_num.max=3
    //% intensity.min=0 intensity.max=100
    export function setLED(port: ThreePort, intensity: number = 50): void {
        let timeout = 0
        while (!readyToSend && timeout < 25) {
            basic.pause(10)
            timeout++;
        }
        if (port >= 1 && port <= 3 && readyToSend) {
            let intensityScaled = 0
            if (intensity > 100)
                intensity = 100
            if (intensity < 0)
                intensity = 0
            intensityScaled = (intensity * 255) / 100

            while (!readyToSend); // Wait for other functions in other threads
            readyToSend = false
            if (port == 1) {
                control.waitMicros(waitTime_Initial)
                pins.digitalWritePin(DigitalPin.P16, 0)
                control.waitMicros(waitTime_1)
                pins.spiWrite(0xC0)
                control.waitMicros(waitTime_2)
                pins.spiWrite(intensityScaled)
                control.waitMicros(waitTime_2)
                pins.spiWrite(0xFF)
                control.waitMicros(waitTime_2)
                pins.spiWrite(0xFF)
                control.waitMicros(waitTime_1)
                pins.digitalWritePin(DigitalPin.P16, 1)

            }
            else if (port == 2) {
                pins.analogWritePin(AnalogPin.P2, intensityScaled * 4)
            }
            else if (port == 3) {
                pins.analogWritePin(AnalogPin.P8, intensityScaled * 4)
            }
            readyToSend = true
        }
    }

    /**
     * Sets a tri-color LED on port 1 or 2 to the color specified by red, green, and blue brightness values. The values range from 0% to 100%.
     * @param port the LED port to control [1-2]
     * @param red the % brightness of the red LED element [0-100]
     * @param green the % brightness of the green LED element [0-100]
     * @param blue the % brightness of the blue LED element [0-100]
     */
    //% weight=29 blockId="setTriLED" block="Hummingbird Tri-LED %port_num| Red %Red| Green %Green| Blue %Blue|"
    //% port_num.min=1 port_num.max=2
    //% Red.min=0 Red.max=100
    //% Green.min=0 Green.max=100
    //% Blue.min=0 Blue.max=100
    export function setTriLED(port: TwoPort, red: number = 50, green: number = 0, blue: number = 50): void {
        let timeout = 0
        while (!readyToSend && timeout < 25) {
            basic.pause(10)
            timeout++;
        }
        if (port >= 1 && port <= 2 && readyToSend) {

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

            let port_val = 0xC3 + port
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
     * Sets a position servo on port 1, 2, 3, or 4 to an angle from 0° to 180°.
     * @param port the servo port to control [1-4]
     * @param angle the angle in degrees for the servo [0-180]; eg: 90
     */
    //% weight=28 blockId="setPositionServo" block="Hummingbird Position Servo %port_num| %angle|°"
    //%port_num.min=1 port_num.max=4
    //% angle.min=0 angle.max=180
    export function setPositionServo(port: FourPort, angle: number = 90): void {
        let timeout = 0
        while (!readyToSend && timeout < 25) {
            basic.pause(10)
            timeout++;
        }
        if (port >= 1 && port <= 4 && readyToSend) {
            let angle_conv = 0
            if (angle > 180)
                angle = 180
            if (angle < 0)
                angle = 0

            angle_conv = (angle * 254) / 180
            let port_val = port + 0xC5

            while (!readyToSend); // Wait for other functions in other threads
            readyToSend = false
            control.waitMicros(waitTime_Initial)
            pins.digitalWritePin(DigitalPin.P16, 0)
            control.waitMicros(waitTime_1)
            pins.spiWrite(port_val)
            control.waitMicros(waitTime_2)
            pins.spiWrite(angle_conv)
            control.waitMicros(waitTime_2)
            pins.spiWrite(0xFF)
            control.waitMicros(waitTime_2)
            pins.spiWrite(0xFF)
            control.waitMicros(waitTime_1)
            pins.digitalWritePin(DigitalPin.P16, 1)
            //control.waitMicros(1000)
            readyToSend = true
        }
    }

    /**
     * Sets a rotation servo on port 1, 2, 3, or 4 to a rotation speed from -100% to 100%.
     * @param port the servo port to control [1-4]
     * @param speed the speed as a percent for the servo [-100 to 100]
     */
    //% weight=28 blockId="setRotationServo" block="Hummingbird Rotation Servo %port_num| %speed|\\%"
    //%port_num.min=1 port_num.max=4
    //% speed.min=-100 speed.max=100
    export function setRotationServo(port: FourPort, speed: number = 0): void {
        let timeout = 0
        while (!readyToSend && timeout < 25) {
            basic.pause(10)
            timeout++;
        }
        if (port >= 1 && port <= 4 && readyToSend) {
            let speed_conv = 0
            if (speed > 100)
                speed = 100
            if (speed < -100)
                speed = -100

            // Send the off command if the speed is close to zero. Otherwise,
            // convert the speed to a range from 104 to 144 (found experimentally to
            // be the command range for the rotation servo)
            if ((speed > -2) && (speed < 2))
                speed_conv = 255
            else
                speed_conv = (speed * 23 / 100) + 124

            let port_val = port + 0xC5

            while (!readyToSend); // Wait for other functions in other threads
            readyToSend = false
            control.waitMicros(waitTime_Initial)
            pins.digitalWritePin(DigitalPin.P16, 0)
            control.waitMicros(waitTime_1)
            pins.spiWrite(port_val)
            control.waitMicros(waitTime_2)
            pins.spiWrite(speed_conv)
            control.waitMicros(waitTime_2)
            pins.spiWrite(0xFF)
            control.waitMicros(waitTime_2)
            pins.spiWrite(0xFF)
            control.waitMicros(waitTime_1)
            pins.digitalWritePin(DigitalPin.P16, 1)
            //control.waitMicros(1000)
            readyToSend = true
        }
    }

    /**
     * Reads the value of the sensor on port 1, 2, or 3. Readings for the distance sensor are given in cm. All other readings range from 0 to 100 (no units).
     * @param port the sensor port to read [1-3]
     */
    //% weight=20 blockId="getSensors" block="Hummingbird %sensorType | %port_num"
    //%sensorType.min=1 sensorType.max=3
    //%port_num.min=1 port_num.max=3
    export function getSensor(sensor: SensorType, port: ThreePort): number {
        let timeout = 0
        while (!readyToSend && timeout < 25) {
            basic.pause(10)
            timeout++;
        }
        if (port >= 1 && port <= 3 && readyToSend) {
            let vals = [0, 0, 0, 0];
            let return_val: number

            while (!readyToSend); // Wait for other functions in other threads

            readyToSend = false
            // Need to read all three sensor values and the battery (vals[3]) to complete the communication protocol.
            control.waitMicros(waitTime_Initial)
            pins.digitalWritePin(DigitalPin.P16, 0)
            control.waitMicros(waitTime_1)
            vals[0] = pins.spiWrite(0xCC)
            control.waitMicros(waitTime_2)
            vals[1] = pins.spiWrite(0x66)
            control.waitMicros(waitTime_2)
            vals[2] = pins.spiWrite(0x77)
            control.waitMicros(waitTime_2)
            vals[3] = pins.spiWrite(0x88)
            control.waitMicros(waitTime_1)
            vals[0] = pins.spiWrite(0x55)
            control.waitMicros(waitTime_1)
            vals[1] = pins.spiWrite(0x66)
            control.waitMicros(waitTime_1)
            pins.digitalWritePin(DigitalPin.P16, 1)
            readyToSend = true

            /* Scale distance value to cm, otherwise scale the sensor value to 0-100 */
            if (sensor == SensorType.Distance)
                return_val = (vals[port - 1] * 117 / 100)
            else if (sensor == SensorType.Sound)
                return_val = (vals[port - 1] * 200 / 255)
            else if (sensor == SensorType.Dial) {
                return_val = (vals[port - 1] * 100 / 230)
                if (return_val > 100)
                    return_val = 100
            }
            else
                return_val = (vals[port - 1] * 100) / 255
            return Math.round(return_val)
        }
        else {
            return 0
        }
    }

    /**
     * Reads the value of the battery in milliVolts. You may start to see strange behavior when the value is below 4630 mV. 
     */
    //% weight=20 blockId="getBattery" block="Hummingbird Battery"
    export function getBattery(): number {
        let timeout = 0
        while (!readyToSend && timeout < 25) {
            basic.pause(10)
            timeout++;
        }
        if (readyToSend) {
            let vals = [0, 0, 0, 0];
            let return_val: number

            while (!readyToSend); // Wait for other functions in other threads

            readyToSend = false
            // Need to read all three sensor values and the battery (vals[3]) to complete the communication protocol.
            control.waitMicros(waitTime_Initial)
            pins.digitalWritePin(DigitalPin.P16, 0)
            control.waitMicros(waitTime_1)
            vals[0] = pins.spiWrite(0x55)
            control.waitMicros(waitTime_2)
            vals[1] = pins.spiWrite(0x66)
            control.waitMicros(waitTime_2)
            vals[2] = pins.spiWrite(0x77)
            control.waitMicros(waitTime_2)
            vals[3] = pins.spiWrite(0x88)
            control.waitMicros(waitTime_1)
            pins.digitalWritePin(DigitalPin.P16, 1)
            readyToSend = true

            return_val = 406 * (vals[3]) / 10
            return Math.round(return_val)
        }
        else {
            return 0
        }
    }


} 