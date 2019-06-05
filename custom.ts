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
    let FILLER_VALUE = 0xFF
    let FILLER_VALUE_2 = 0x00
    let STOP_COMMAD = 0xDF
    let SET_LED_COMMAND = 0xD0
    let SET_MOTOR_COMMAND = 0xD2
    let SET_SINGLE_LED_COMMAND = 0xD3

    let CONVERSION_FACTOR_CM_TICKS = 50.95
    let ANGLE_TICKS_FACTOR = 2.805
    let MINIMUM_SPEED = -127
    let MAXIMUM_SPEED = 127
    let SPEED_CONVERSION_FACTOR = 2.805
    let BATT_FACTOR = 0.40
    let MOSI_PIN = DigitalPin.P15
    let MISO_PIN = DigitalPin.P14
    let SCK_PIN = DigitalPin.P13
    let SLAVESELECT_PIN = DigitalPin.P16


    let tailPin: DigitalPin = DigitalPin.P2
    let tailBuf: Buffer
    let buzzerPin: DigitalPin = DigitalPin.P0
    let beakLEDR = 0
    let beakLEDG = 0
    let beakLEDB = 0

    let leftEncoderOffset = 0
    let rightEncoderOffset = 0

    let sensor_vals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  //16 bytes
    let ledOutputs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  //15 bytes
    readyToSend = false // to prevent sending or attempting to receive data until we have initialized the connection


    /**
     * This block is required for every Finch program.
     */
    //% weight=32 blockId="startFN" block="Start Finch"
    export function startFinch(): void {

        pins.analogWritePin(AnalogPin.P0, 0)
        basic.pause(waitTime_Start);                //To avoid the bootloader
        pins.digitalWritePin(SLAVESELECT_PIN, 1)
        pins.spiPins(MOSI_PIN, MISO_PIN, SCK_PIN)
        pins.spiFormat(8, 0)
        pins.spiFrequency(1000000)
        stop()
        resetEncoders()
        readyToSend = true
        //Clear or do something with neopixel LED
    }

    //Stop Command
    export function stop(): void {
        control.waitMicros(waitTime_Initial)
        pins.digitalWritePin(SLAVESELECT_PIN, 0)
        control.waitMicros(waitTime_1)
        pins.spiWrite(STOP_COMMAD)                  //1
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //2
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //3
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //4
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //5
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //6
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //7
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //8
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //9
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //10
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //11
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //12
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //13
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //14
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //15
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //16
        control.waitMicros(waitTime_1)

        pins.digitalWritePin(SLAVESELECT_PIN, 1)
        //control.waitMicros(1000)

    }


    //Utiltity function to send the LED command for beak and tail LED
    //Stop Command
    export function sendLED(red: number = 50, green: number = 0, blue: number = 50): void {
        while (!readyToSend); // Wait for other functions in other threads
        readyToSend = false
        control.waitMicros(waitTime_Initial)
        pins.digitalWritePin(SLAVESELECT_PIN, 0)
        control.waitMicros(waitTime_1)
        pins.spiWrite(SET_LED_COMMAND)         //1
        control.waitMicros(waitTime_2)
        pins.spiWrite(beakLEDR)                //2
        control.waitMicros(waitTime_2)
        pins.spiWrite(beakLEDG)                //3
        control.waitMicros(waitTime_2)
        pins.spiWrite(beakLEDB)                //4
        control.waitMicros(waitTime_2)
        pins.spiWrite(red)                     //5
        control.waitMicros(waitTime_2)
        pins.spiWrite(green)                   //6
        control.waitMicros(waitTime_2)
        pins.spiWrite(blue)                    //7
        control.waitMicros(waitTime_2)
        pins.spiWrite(red)                     //8
        control.waitMicros(waitTime_2)
        pins.spiWrite(green)                   //9
        control.waitMicros(waitTime_2)
        pins.spiWrite(blue)                   //10
        control.waitMicros(waitTime_2)
        pins.spiWrite(red)                   //11
        control.waitMicros(waitTime_2)
        pins.spiWrite(green)                  //12
        control.waitMicros(waitTime_2)
        pins.spiWrite(blue)                  //13
        control.waitMicros(waitTime_2)
        pins.spiWrite(red)                   //14
        control.waitMicros(waitTime_2)
        pins.spiWrite(green)                 //15
        control.waitMicros(waitTime_2)
        pins.spiWrite(blue)                  //16
        control.waitMicros(waitTime_1)
        pins.digitalWritePin(SLAVESELECT_PIN, 1)
        readyToSend = true

    }

    export function sendSingleLED(portNumber: number = 0, red: number = 50, green: number = 0, blue: number = 50): void {
        while (!readyToSend); // Wait for other functions in other threads
        readyToSend = false
        control.waitMicros(waitTime_Initial)
        pins.digitalWritePin(SLAVESELECT_PIN, 0)
        control.waitMicros(waitTime_1)
        pins.spiWrite(SET_SINGLE_LED_COMMAND)       //1
        control.waitMicros(waitTime_2)
        pins.spiWrite(portNumber)                   //2
        control.waitMicros(waitTime_2)
        pins.spiWrite(red)                          //3
        control.waitMicros(waitTime_2)
        pins.spiWrite(green)                        //4
        control.waitMicros(waitTime_2)
        pins.spiWrite(blue)                         //5
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE_2)                 //6
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE_2)                 //7
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE_2)                 //8
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE_2)                 //9
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE_2)                 //10
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE_2)                 //11
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE_2)                 //12
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE_2)                 //13
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE_2)                 //14
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE_2)                 //15
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE_2)                 //16
        control.waitMicros(waitTime_1)
        pins.digitalWritePin(SLAVESELECT_PIN, 1)
        readyToSend = true
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
        let portNumber = 0
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

            beakLEDR = red * 255 / 100
            beakLEDG = green * 255 / 100
            beakLEDB = blue * 255 / 100

            sendSingleLED(portNumber, red, green, blue)

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
        let timeout = 0
        while (!readyToSend && timeout < 25) {
            basic.pause(10)
            timeout++;
        }
        if (readyToSend) {
            if (port == TailPort.All) {
                for (let i = 1; i < 5; i++) {
                    red = red * 255 / 100
                    green = green * 255 / 100
                    blue = blue * 255 / 100
                    sendLED(red, green, blue)
                }

            } else {
                red = red * 255 / 100
                green = green * 255 / 100
                blue = blue * 255 / 100
                sendSingleLED(port, red, green, blue)

            }

        }

    }


    /**
     * Sends finch motor command
     */
    //Minumum speed  -- 0  cm/sec
    //Maximum Speed  -- 30 cm/sec
    export function sendMotor(l_velocity: number, l_dist: number, r_velocity: number, r_dist: number): void {

        let l_dist_ticks = 0
        let r_dist_ticks = 0

        l_dist_ticks = l_dist
        r_dist_ticks = r_dist
        /*
        //Assuming distance in cm
        l_dist_ticks = Math.round(l_dist * CONVERSION_FACTOR_CM_TICKS)
        r_dist_ticks = Math.round(r_dist * CONVERSION_FACTOR_CM_TICKS)
        */

        //TODO: Convert distance to ticks
        let l_ticks_3 = (l_dist_ticks & 0xFF0000) >> 16
        let l_ticks_2 = (l_dist_ticks & 0x00FF00) >> 8
        let l_ticks_1 = l_dist_ticks & 0x0000FF
        let r_ticks_3 = (r_dist_ticks & 0xFF0000) >> 16
        let r_ticks_2 = (r_dist_ticks & 0x00FF00) >> 8
        let r_ticks_1 = r_dist_ticks & 0x0000FF

        let timeout = 0
        while (!readyToSend && timeout < 25) {
            basic.pause(10)
            timeout++;
        }
        if (readyToSend) {
            readyToSend = false
            control.waitMicros(waitTime_Initial)
            pins.digitalWritePin(SLAVESELECT_PIN, 0)
            control.waitMicros(waitTime_1)

            pins.spiWrite(SET_MOTOR_COMMAND)                              //1
            control.waitMicros(waitTime_2)
            pins.spiWrite(FILLER_VALUE)                                  //2
            control.waitMicros(waitTime_2)
            pins.spiWrite(l_velocity)                                     //3
            control.waitMicros(waitTime_2)
            pins.spiWrite(l_ticks_3)                                      //4
            control.waitMicros(waitTime_2)
            pins.spiWrite(l_ticks_2)                                      //5
            control.waitMicros(waitTime_2)
            pins.spiWrite(l_ticks_1)                                      //6
            control.waitMicros(waitTime_2)
            pins.spiWrite(r_velocity)                                     //7
            control.waitMicros(waitTime_2)
            pins.spiWrite(r_ticks_3)                                      //8
            control.waitMicros(waitTime_2)
            pins.spiWrite(r_ticks_2)                                      //9
            control.waitMicros(waitTime_2)
            pins.spiWrite(r_ticks_1)                                      //10
            control.waitMicros(waitTime_2)
            pins.spiWrite(FILLER_VALUE)                                  //11
            control.waitMicros(waitTime_2)
            pins.spiWrite(FILLER_VALUE)                                  //12
            control.waitMicros(waitTime_2)
            pins.spiWrite(FILLER_VALUE)                                  //13
            control.waitMicros(waitTime_2)
            pins.spiWrite(FILLER_VALUE)                                  //14
            control.waitMicros(waitTime_2)
            pins.spiWrite(FILLER_VALUE)                                  //15
            control.waitMicros(waitTime_2)
            pins.spiWrite(FILLER_VALUE)                                  //16
            control.waitMicros(waitTime_1)
            pins.digitalWritePin(SLAVESELECT_PIN, 1)
            //control.waitMicros(1000)
            readyToSend = true
        }
    }

    /**
     * Sets the finch to move in the given direction at given speed for given distance
     * @param direction Forward or Backward
     * @param speed the speed as a percent for the motor [0 to 15]
     * @param distance the discance to travel in cm
     */
    //% weight=27 blockId="setMove" block="Finch Move %direction| at %speed| \\% for %distance|cm"
    //% speed.min=0 speed.max=100
    export function setMove(direction: MoveDir, speed: number = 50, distance: number = 10): void {
        let velocity = 0
        let tick_speed = 0
        let positionControlFlag = 0
        if (speed > MAXIMUM_SPEED) {
            speed = MAXIMUM_SPEED
        }
        if (speed < MINIMUM_SPEED) {
            speed = MINIMUM_SPEED
        }
        //tick_speed = Math.round(speed * SPEED_CONVERSION_FACTOR)

        distance = Math.round(distance * CONVERSION_FACTOR_CM_TICKS)
        if (direction == MoveDir.Forward) {
            velocity = (0x80 | speed);
        }
        else if (direction == MoveDir.Backward) {
            velocity = (0x7F & speed);
        }
        sendMotor(velocity, distance, velocity, distance)
        basic.pause(50)
        positionControlFlag = getPositionControlFlag()
        while (positionControlFlag == 1) {
            positionControlFlag = getPositionControlFlag()
            basic.pause(30)
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
        let positionControlFlag = 0;
        l_dist = Math.round(ANGLE_TICKS_FACTOR * angle)
        r_dist = Math.round(ANGLE_TICKS_FACTOR * angle)
        speed = Math.round(speed * 1.27)
        //basic.showNumber(speed)
        if (direction == RLDir.Left) {
            l_speed = (0x7F & speed);
            r_speed = (0x80 | speed);
        } else {
            l_speed = (0x80 | speed);
            r_speed = (0x7F & speed);
        }
        //basic.showNumber(l_speed)
        sendMotor(l_speed, l_dist, r_speed, r_dist)
        basic.pause(50)
        positionControlFlag = getPositionControlFlag()
        while (positionControlFlag == 1) {
            positionControlFlag = getPositionControlFlag()
            basic.pause(30)
        }


    }

    /**
     * Starts the finch moving at given speed
     * @param speed the speed as a percent for the motor [0 to 15]
     * @param distance the discance to travel in cm
     */
    //% weight=25 blockId="startMotors" block="Finch L %l_speed| \\% R %r_speed| \\%"
    //% l_speed.min=-100 l_speed.max=100
    //% r_speed.min=-100 r_speed.max=100
    export function startMotors(l_speed: number = 50, r_speed: number = 50): void {
        //convert
        let l_velocity = 0
        let r_velocity = 0

        let l_tick_speed = 0
        let r_tick_speed = 0

        l_speed = Math.round(l_speed * 1.27)
        r_speed = Math.round(r_speed * 1.27)
        /*
        //Left Motor
        if (l_speed > MAXIMUM_SPEED) {
            l_speed = MAXIMUM_SPEED
        }
        else if (l_speed < MINIMUM_SPEED) {
            l_speed = MINIMUM_SPEED
        }
        */

        l_tick_speed = Math.round(Math.abs(l_speed) * SPEED_CONVERSION_FACTOR)
        if (l_speed > 0) {
            l_velocity = (0x80 | l_tick_speed);
        }
        else {
            l_velocity = (0x7F & l_tick_speed);
        }

        //Right Motor
        if (r_speed > MAXIMUM_SPEED) {
            r_speed = MAXIMUM_SPEED
        }
        else if (r_speed < MINIMUM_SPEED) {
            r_speed = MINIMUM_SPEED
        }
        r_tick_speed = Math.round(Math.abs(r_speed) * SPEED_CONVERSION_FACTOR)
        if (r_speed > 0) {
            r_velocity = (0x80 | r_tick_speed);
        }
        else {
            r_velocity = (0x7F & r_tick_speed);
        }
        sendMotor(l_velocity, 0, r_velocity, 0)
    }

    /**
     * Stops the finch motors
     */
    //% weight=24 blockId="stopMotors" block="Finch Stop"
    export function stopMotors(): void {
        sendMotor(0, 1, 0, 1)
        stop()
    }



    /**
     * Reads the value of the sensors
     */
    export function getSensors(): void {
        let timeout = 0
        while (!readyToSend && timeout < 25) {
            basic.pause(10)
            timeout++;
        }
        if (readyToSend) {

            readyToSend = false
            // Need to read all sensor values and the battery to complete the communication protocol.
            control.waitMicros(waitTime_Initial)
            pins.digitalWritePin(SLAVESELECT_PIN, 0)
            control.waitMicros(waitTime_1)
            sensor_vals[0] = pins.spiWrite(0xDE) //Firmware version
            control.waitMicros(waitTime_2)
            sensor_vals[1] = pins.spiWrite(0xFF) //nothing
            control.waitMicros(waitTime_2)
            sensor_vals[2] = pins.spiWrite(0xFF) //distance msb
            control.waitMicros(waitTime_2)
            sensor_vals[3] = pins.spiWrite(0xFF) //distance lsb
            control.waitMicros(waitTime_2)
            sensor_vals[4] = pins.spiWrite(0xFF) //light left
            control.waitMicros(waitTime_2)
            sensor_vals[5] = pins.spiWrite(0xFF) //light right
            control.waitMicros(waitTime_2)
            sensor_vals[6] = pins.spiWrite(0xFF) //line left
            control.waitMicros(waitTime_2)
            sensor_vals[7] = pins.spiWrite(0xFF) //line right
            control.waitMicros(waitTime_2)
            sensor_vals[8] = pins.spiWrite(0xFF) //battery
            control.waitMicros(waitTime_2)
            sensor_vals[9] = pins.spiWrite(0xFF) //enc3 left
            control.waitMicros(waitTime_2)
            sensor_vals[10] = pins.spiWrite(0xFF) //enc2 left
            control.waitMicros(waitTime_2)
            sensor_vals[11] = pins.spiWrite(0xFF) //enc1 left
            control.waitMicros(waitTime_2)
            sensor_vals[12] = pins.spiWrite(0xFF) //enc3 right
            control.waitMicros(waitTime_2)
            sensor_vals[13] = pins.spiWrite(0xFF) //enc2 right
            control.waitMicros(waitTime_2)
            sensor_vals[14] = pins.spiWrite(0xFF) //enc1 right
            control.waitMicros(waitTime_1)
            sensor_vals[15] = pins.spiWrite(0xFF) //Filler Value
            control.waitMicros(waitTime_1)
            pins.digitalWritePin(SLAVESELECT_PIN, 1)
            readyToSend = true
        }
    }

    /**
     * Returns the finch encoder value specified. Forward is +, Back is -
     * Returns a value in rotations.
     * @param encoder Right or Left
     */
    //% weight=22 blockId="resetEncoders" block="Finch Reset Encoders"
    export function resetEncoders(): void {
        getSensors()
        rightEncoderOffset = (sensor_vals[12] << 16 | sensor_vals[13] << 8 | sensor_vals[14])
        leftEncoderOffset = (sensor_vals[9] << 16 | sensor_vals[10] << 8 | sensor_vals[11])
    }

    /**
     * Returns the finch encoder value specified. Forward is +, Back is -
     * Returns a value in rotations.
     * @param encoder Right or Left
     */
    export function getPositionControlFlag(): number {
        getSensors()
        let return_val = 0
        return_val = ((sensor_vals[6] & 0x80) >> 7)
        return return_val
    }

    /**
     * Returns the finch encoder value specified. Forward is +, Back is -
     * Returns a value in rotations.
     * @param encoder Right or Left
     */
    //% weight=22 blockId="getEncoder" block="Finch %encoder| Encoder"
    export function getEncoder(encoder: RLDir): number {
        getSensors()
        let return_val = 0
        if (encoder == RLDir.Right) {
            return_val = (sensor_vals[12] << 16 | sensor_vals[13] << 8 | sensor_vals[14]) - rightEncoderOffset
        } else {
            return_val = (sensor_vals[9] << 16 | sensor_vals[10] << 8 | sensor_vals[11]) - leftEncoderOffset
        }
        return return_val
    }

    /**
     * Returns the distance to the closest obstacle in cm
     */
    //% weight=21 blockId="getDistance" block="Finch Distance (cm)"
    export function getDistance(): number {
        getSensors()
        // Scale distance value to cm
        let return_val = ((sensor_vals[2] << 8 | sensor_vals[3]) * 0.0919)
        return Math.round(return_val)
    }

    /**
     * Returns brightness as a value 0-100
     * @param light Right or Left
     */
    //% weight=20 blockId="getLight" block="Finch %light| Light"
    export function getLight(light: RLDir): number {
        getSensors()
        let return_val = 0
        if (light == RLDir.Right) {
            return_val = sensor_vals[5]
        } else {
            return_val = sensor_vals[4]
        }
        return_val = return_val * 100 / 255
        return Math.round(return_val)
    }

    /**
     * Returns a value 0-100
     * @param line Right or Left
     */
    //% weight=19 blockId="getLine" block="Finch %line| Line"
    export function getLine(line: RLDir): number {
        getSensors()
        let return_val = 0
        if (line == RLDir.Right) {
            return_val = (sensor_vals[7] & 0x7F)
        } else {
            return_val = (sensor_vals[6] & 0x7F)
        }
        return_val = return_val * 100 / 127
        return Math.round(return_val)
    }

    /**
     * Reads the value of the battery in milliVolts. You may start to see
     * strange behavior when the value is below 4630 mV.
     */
    //% weight=18 blockId="getBattery" block="Finch Battery"
    export function getBattery(): number {
        getSensors()
        let return_val = BATT_FACTOR * (sensor_vals[8]) / 10
        return Math.round(return_val)
    }
}